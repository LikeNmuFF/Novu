import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('learnbasilan.db');
  return db;
}

export async function initDatabase(): Promise<void> {
  const database = await getDb();

  await database.execAsync('PRAGMA foreign_keys = ON');

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      grade TEXT,
      avatar TEXT,
      role TEXT DEFAULT 'student',
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      icon TEXT,
      color TEXT,
      bg_color TEXT,
      subject_order INTEGER
    );

    CREATE TABLE IF NOT EXISTS lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      language TEXT DEFAULT 'fil',
      chapter_number INTEGER DEFAULT 1,
      image_url TEXT,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (subject_id) REFERENCES subjects(id)
    );

    CREATE TABLE IF NOT EXISTS quizzes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lesson_id INTEGER NOT NULL,
      question TEXT NOT NULL,
      options TEXT NOT NULL,
      correct_answer INTEGER NOT NULL,
      explanation TEXT,
      FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      lesson_id INTEGER NOT NULL,
      status TEXT DEFAULT 'locked',
      score REAL,
      completed_at INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS imported_content (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      imported_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS user_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      xp INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      streak INTEGER DEFAULT 0,
      last_active_date TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS earned_badges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      badge_id TEXT NOT NULL,
      earned_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, badge_id)
    );
  `);

  const count = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM subjects'
  );

  if (count && count.count === 0) {
    await seedSubjects(database);
  }
}

async function seedSubjects(database: SQLite.SQLiteDatabase): Promise<void> {
  const defaultSubjects = [
    { name: 'Mathematics', icon: '🔢', color: '#FF7E5F', bg_color: '#FFE8E0', order: 1 },
    { name: 'Science', icon: '🔬', color: '#2EC4B6', bg_color: '#E0F5F3', order: 2 },
    { name: 'English', icon: '📝', color: '#FFD93D', bg_color: '#FFF3D6', order: 3 },
    { name: 'Filipino', icon: '🇵🇭', color: '#6BCB77', bg_color: '#E0F5E6', order: 4 },
    { name: 'Araling Panlipunan', icon: '🌏', color: '#9B5DE5', bg_color: '#F0E6FF', order: 5 },
  ];

  for (const s of defaultSubjects) {
    await database.runAsync(
      'INSERT INTO subjects (name, icon, color, bg_color, subject_order) VALUES (?, ?, ?, ?, ?)',
      [s.name, s.icon, s.color, s.bg_color, s.order]
    );
  }
}
