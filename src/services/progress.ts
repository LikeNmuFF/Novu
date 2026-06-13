import { getDb } from './database';
import type { SQLiteDatabase } from 'expo-sqlite';

export type ChapterStatus = 'locked' | 'unlocked' | 'completed';

export async function getSubjectProgress(userId: number, subjectId: number): Promise<{
  completed: number;
  total: number;
  averageScore: number;
}> {
  const db = await getDb();
  const total = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM lessons WHERE subject_id = ?',
    [subjectId]
  );
  const completed = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM progress
     WHERE user_id = ? AND lesson_id IN (SELECT id FROM lessons WHERE subject_id = ?) AND status = 'completed'`,
    [userId, subjectId]
  );
  const avgScore = await db.getFirstAsync<{ avg: number | null }>(
    `SELECT AVG(score) as avg FROM progress
     WHERE user_id = ? AND lesson_id IN (SELECT id FROM lessons WHERE subject_id = ?) AND status = 'completed'`,
    [userId, subjectId]
  );

  return {
    completed: completed?.count ?? 0,
    total: total?.count ?? 0,
    averageScore: Math.round(avgScore?.avg ?? 0),
  };
}

export async function getChapterStatus(
  userId: number,
  lessonId: number
): Promise<ChapterStatus> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ status: string }>(
    'SELECT status FROM progress WHERE user_id = ? AND lesson_id = ?',
    [userId, lessonId]
  );
  if (row) return row.status as ChapterStatus;
  return 'locked';
}

export async function getChaptersForSubject(
  userId: number,
  subjectId: number,
  gradeLevel?: number
): Promise<Array<{
  id: number;
  title: string;
  chapterNumber: number;
  status: ChapterStatus;
  score: number | null;
}>> {
  const db = await getDb();
  const lessons = await db.getAllAsync<{
    id: number;
    title: string;
    chapter_number: number;
  }>(
    gradeLevel !== undefined
      ? 'SELECT id, title, chapter_number FROM lessons WHERE subject_id = ? AND grade_level = ? ORDER BY chapter_number ASC'
      : 'SELECT id, title, chapter_number FROM lessons WHERE subject_id = ? ORDER BY chapter_number ASC',
    gradeLevel !== undefined ? [subjectId, gradeLevel] : [subjectId]
  );

  const result = [];
  let previousCompleted = true;

  for (const lesson of lessons) {
    const row = await db.getFirstAsync<{ status: string; score: number | null }>(
      'SELECT status, score FROM progress WHERE user_id = ? AND lesson_id = ?',
      [userId, lesson.id]
    );

    let status: ChapterStatus;
    if (row) {
      status = row.status as ChapterStatus;
    } else if (previousCompleted) {
      status = 'unlocked';
    } else {
      status = 'locked';
    }

    if (status === 'completed') {
      previousCompleted = true;
    } else {
      previousCompleted = false;
    }

    result.push({
      id: lesson.id,
      title: lesson.title,
      chapterNumber: lesson.chapter_number,
      status,
      score: row?.score ?? null,
    });
  }

  return result;
}

export async function completeLesson(
  userId: number,
  lessonId: number,
  score: number
): Promise<void> {
  const db = await getDb();
  const passed = score >= 75;

  const existing = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM progress WHERE user_id = ? AND lesson_id = ?',
    [userId, lessonId]
  );

  if (existing) {
    await db.runAsync(
      `UPDATE progress SET status = ?, score = ?, completed_at = ?
       WHERE user_id = ? AND lesson_id = ?`,
      [passed ? 'completed' : 'unlocked', score, Date.now(), userId, lessonId]
    );
  } else {
    await db.runAsync(
      `INSERT INTO progress (user_id, lesson_id, status, score, completed_at)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, lessonId, passed ? 'completed' : 'unlocked', score, Date.now()]
    );
  }
}

export const BADGES = [
  { id: 'first_lesson', name: 'First Steps', icon: '🌟', description: 'Complete your first lesson', xp: 20 },
  { id: 'quiz_master', name: 'Quiz Master', icon: '🏆', description: 'Get 100% on any quiz', xp: 50 },
  { id: 'streak_3', name: 'On Fire', icon: '🔥', description: '3-day streak', xp: 30 },
  { id: 'streak_7', name: 'Week Warrior', icon: '⚡', description: '7-day streak', xp: 70 },
  { id: 'five_lessons', name: 'Dedicated', icon: '📚', description: 'Complete 5 lessons', xp: 40 },
  { id: 'ten_lessons', name: 'Scholar', icon: '🎓', description: 'Complete 10 lessons', xp: 80 },
  { id: 'math_whiz', name: 'Math Whiz', icon: '🔢', description: 'Complete all Math chapters', xp: 100 },
  { id: 'science_buddy', name: 'Science Buddy', icon: '🔬', description: 'Complete all Science chapters', xp: 100 },
];

export async function checkAndAwardBadges(userId: number): Promise<string[]> {
  try {
    const db = await getDb();
    const earned = await db.getAllAsync<{ badge_id: string }>(
      'SELECT badge_id FROM earned_badges WHERE user_id = ?',
      [userId]
    );
    const earnedIds = new Set(earned.map(b => b.badge_id));
    const newlyEarned: string[] = [];

    const completedCount = await db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM progress WHERE user_id = ? AND status = 'completed'",
      [userId]
    );

    const stats = await db.getFirstAsync<{ streak: number }>(
      'SELECT streak FROM user_stats WHERE user_id = ?',
      [userId]
    );

    const checkBadge = async (id: string, condition: boolean) => {
      if (condition && !earnedIds.has(id)) {
        await db.runAsync(
          'INSERT INTO earned_badges (user_id, badge_id, earned_at) VALUES (?, ?, ?)',
          [userId, id, Date.now()]
        );
        const badge = BADGES.find(b => b.id === id);
        if (badge) {
          await addXpDirect(db, userId, badge.xp);
        }
        newlyEarned.push(id);
      }
    };

    const count = completedCount?.count ?? 0;
    const streak = stats?.streak ?? 0;

    await checkBadge('first_lesson', count >= 1);
    await checkBadge('five_lessons', count >= 5);
    await checkBadge('ten_lessons', count >= 10);
    await checkBadge('streak_3', streak >= 3);
    await checkBadge('streak_7', streak >= 7);

    return newlyEarned;
  } catch {
    return [];
  }
}

async function addXpDirect(db: SQLiteDatabase, userId: number, amount: number): Promise<void> {
  const current = await db.getFirstAsync<{ xp: number; level: number }>(
    'SELECT xp, level FROM user_stats WHERE user_id = ?',
    [userId]
  );
  if (!current) return;
  const newXp = current.xp + amount;
  let newLevel = current.level;
  let remaining = newXp;
  while (remaining >= newLevel * 100) {
    remaining -= newLevel * 100;
    newLevel++;
  }
  await db.runAsync(
    'UPDATE user_stats SET xp = ?, level = ? WHERE user_id = ?',
    [newXp, newLevel, userId]
  );
}

export async function getEarnedBadges(userId: number): Promise<Array<{
  id: string;
  name: string;
  icon: string;
  description: string;
  earnedAt: number;
}>> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ badge_id: string; earned_at: number }>(
    'SELECT badge_id, earned_at FROM earned_badges WHERE user_id = ? ORDER BY earned_at DESC',
    [userId]
  );
  return rows.map(r => {
    const badge = BADGES.find(b => b.id === r.badge_id)!;
    return {
      id: r.badge_id,
      name: badge.name,
      icon: badge.icon,
      description: badge.description,
      earnedAt: r.earned_at,
    };
  });
}
