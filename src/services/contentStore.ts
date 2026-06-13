import { getDb } from './database';
import { QRContentType } from '../types/qr';

export interface ImportedItem {
  id: number;
  user_id: number | null;
  type: QRContentType;
  title: string;
  content: unknown;
  importedAt: number;
}

export async function getImportedContent(userId?: number): Promise<ImportedItem[]> {
  const db = await getDb();
  let rows;
  if (userId) {
    rows = await db.getAllAsync<ImportedItem>(
      'SELECT id, user_id, type, title, content, imported_at as importedAt FROM imported_content WHERE user_id = ? ORDER BY imported_at DESC',
      [userId]
    );
  } else {
    rows = await db.getAllAsync<ImportedItem>(
      'SELECT id, user_id, type, title, content, imported_at as importedAt FROM imported_content ORDER BY imported_at DESC'
    );
  }
  return rows.map(r => ({
    ...r,
    content: typeof r.content === 'string' ? (() => { try { return JSON.parse(r.content); } catch { return r.content; } })() : r.content,
  }));
}

export async function importContent(
  type: QRContentType,
  content: unknown,
  userId?: number
): Promise<ImportedItem> {
  const db = await getDb();
  const title = extractTitle(content);
  const importedAt = Date.now();
  const contentStr = JSON.stringify(content);

  // For lesson type, insert into lessons table so it appears in student's subject list
  if (type === QRContentType.Lesson && content && typeof content === 'object') {
    const lessonContent = content as Record<string, unknown>;
    const subjectName = lessonContent.subject as string | undefined;
    const subjectId = lessonContent.subject_id as number | undefined;
    const gradeLevel = (lessonContent.grade_level as number) || 1;
    const language = (lessonContent.language as string) || 'fil';
    const lessonContentText = (lessonContent.content as string) || '';
    const lessonTitle = (lessonContent.title as string) || title;

    // Resolve subject_id from name if not provided
    let resolvedSubjectId = subjectId;
    if (!resolvedSubjectId && subjectName) {
      const subj = await db.getFirstAsync<{ id: number }>(
        'SELECT id FROM subjects WHERE name = ?',
        [subjectName]
      );
      resolvedSubjectId = subj?.id;
    }

    if (resolvedSubjectId) {
      // Get next chapter number for this subject and grade
      const maxChapter = await db.getFirstAsync<{ max_chapter: number | null }>(
        'SELECT MAX(chapter_number) as max_chapter FROM lessons WHERE subject_id = ? AND grade_level = ?',
        [resolvedSubjectId, gradeLevel]
      );
      const nextChapter = (maxChapter?.max_chapter || 0) + 1;

      // Insert into lessons table
      await db.runAsync(
        'INSERT INTO lessons (subject_id, title, content, language, chapter_number, grade_level, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [resolvedSubjectId, lessonTitle, lessonContentText, language, nextChapter, gradeLevel, null, importedAt]
      );
    }
  }

  // For quiz type, insert into quizzes table if lesson exists
  if (type === QRContentType.Quiz && content && typeof content === 'object') {
    const quizContent = content as Record<string, unknown>;
    const lessonTitle = quizContent.lesson_title as string | undefined;

    if (lessonTitle) {
      const lesson = await db.getFirstAsync<{ id: number }>(
        'SELECT id FROM lessons WHERE title = ? ORDER BY id DESC LIMIT 1',
        [lessonTitle]
      );

      if (lesson) {
        const questions = quizContent.questions as Array<Record<string, unknown>> | undefined;
        if (questions && Array.isArray(questions)) {
          for (const q of questions) {
            const question = q.question as string;
            const options = JSON.stringify(q.options || []);
            const correctAnswer = (q.correctAnswer as number) || 0;
            const explanation = (q.explanation as string) || null;

            await db.runAsync(
              'INSERT INTO quizzes (lesson_id, question, options, correct_answer, explanation) VALUES (?, ?, ?, ?, ?)',
              [lesson.id, question, options, correctAnswer, explanation]
            );
          }
        }
      }
    }
  }

  // Always save to imported_content for tracking history
  const result = await db.runAsync(
    'INSERT INTO imported_content (user_id, type, title, content, imported_at) VALUES (?, ?, ?, ?, ?)',
    [userId ?? null, type, title, contentStr, importedAt]
  );

  return {
    id: result.lastInsertRowId,
    user_id: userId ?? null,
    type,
    title,
    content,
    importedAt,
  };
}

function extractTitle(content: unknown): string {
  if (content && typeof content === 'object') {
    const obj = content as Record<string, unknown>;
    if (typeof obj.title === 'string') return obj.title;
    if (typeof obj.question === 'string') return obj.question.slice(0, 40);
    if (typeof obj.name === 'string') return obj.name;
  }
  return 'Imported Content';
}

export async function clearImportedContent(userId?: number): Promise<void> {
  const db = await getDb();
  if (userId) {
    await db.runAsync('DELETE FROM imported_content WHERE user_id = ?', [userId]);
  } else {
    await db.runAsync('DELETE FROM imported_content');
  }
}

export async function removeImportedItem(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM imported_content WHERE id = ?', [id]);
}
