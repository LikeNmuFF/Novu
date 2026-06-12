import * as Crypto from 'expo-crypto';
import { getDb } from './database';

const BOOTSTRAP_TEACHER_CODE = 'TCH-ADMIN';

export interface User {
  id: number;
  name: string;
  username: string;
  grade: string;
  avatar: string;
  role: 'student' | 'teacher';
}

const ITERATIONS = 10000;

async function hashPassword(password: string): Promise<string> {
  const salt = Crypto.getRandomBytes(16);
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  
  let hash = password;
  for (let i = 0; i < ITERATIONS; i++) {
    hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      saltHex + hash
    );
  }
  return saltHex + ':' + hash;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split(':');
  if (parts.length !== 2) return false;
  const [saltHex, storedHash] = parts;
  
  let hash = password;
  for (let i = 0; i < ITERATIONS; i++) {
    hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      saltHex + hash
    );
  }
  return hash === storedHash;
}

export async function registerUser(
  name: string,
  username: string,
  password: string,
  grade: string,
  role: 'student' | 'teacher' = 'student'
): Promise<User> {
  const db = await getDb();
  const existing = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM users WHERE username = ?',
    [username]
  );
  if (existing) {
    throw new Error('Username already exists');
  }

  const passwordHash = await hashPassword(password);
  const createdAt = Date.now();

  const result = await db.runAsync(
    'INSERT INTO users (name, username, password_hash, grade, role, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [name, username, passwordHash, grade, role, createdAt]
  );

  await db.runAsync(
    'INSERT INTO user_stats (user_id) VALUES (?)',
    [result.lastInsertRowId]
  );

  return {
    id: result.lastInsertRowId,
    name,
    username,
    grade,
    avatar: name.charAt(0).toUpperCase(),
    role,
  };
}

export async function loginUser(
  username: string,
  password: string
): Promise<User> {
  const db = await getDb();
  const row = await db.getFirstAsync<{
    id: number;
    name: string;
    username: string;
    password_hash: string;
    grade: string;
    role: string;
  }>(
    'SELECT id, name, username, password_hash, grade, role FROM users WHERE username = ?',
    [username]
  );

  if (!row) {
    throw new Error('Invalid username or password');
  }

  const valid = await verifyPassword(password, row.password_hash);
  if (!valid) {
    throw new Error('Invalid username or password');
  }

  const today = new Date().toISOString().split('T')[0];
  const stats = await db.getFirstAsync<{
    last_active_date: string | null;
    streak: number;
  }>(
    'SELECT last_active_date, streak FROM user_stats WHERE user_id = ?',
    [row.id]
  );

  if (stats) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    let newStreak = 1;
    if (stats.last_active_date === today) {
      newStreak = stats.streak;
    } else if (stats.last_active_date === yesterday) {
      newStreak = stats.streak + 1;
    }
    await db.runAsync(
      'UPDATE user_stats SET last_active_date = ?, streak = ? WHERE user_id = ?',
      [today, newStreak, row.id]
    );
  }

  return {
    id: row.id,
    name: row.name,
    username: row.username,
    grade: row.grade,
    avatar: row.name.charAt(0).toUpperCase(),
    role: row.role as 'student' | 'teacher',
  };
}

export async function getUserStats(userId: number): Promise<{
  xp: number;
  level: number;
  streak: number;
}> {
  const db = await getDb();
  const row = await db.getFirstAsync<{
    xp: number;
    level: number;
    streak: number;
  }>(
    'SELECT xp, level, streak FROM user_stats WHERE user_id = ?',
    [userId]
  );
  return row || { xp: 0, level: 1, streak: 0 };
}

export async function addXp(userId: number, amount: number): Promise<{ xp: number; level: number }> {
  const db = await getDb();
  const stats = await getUserStats(userId);
  const newXp = stats.xp + amount;
  const xpForNextLevel = stats.level * 100;
  let newLevel = stats.level;
  let remaining = newXp;
  while (remaining >= newLevel * 100) {
    remaining -= newLevel * 100;
    newLevel++;
  }
  await db.runAsync(
    'UPDATE user_stats SET xp = ?, level = ? WHERE user_id = ?',
    [newXp, newLevel, userId]
  );
  return { xp: newXp, level: newLevel };
}

export async function updateUserProfile(
  userId: number,
  name: string,
  grade: string
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE users SET name = ?, grade = ? WHERE id = ?',
    [name, grade, userId]
  );
}

export async function validateTeacherCode(code: string): Promise<boolean> {
  const db = await getDb();
  const now = Date.now();

  // Bootstrap code: works only if no teachers exist yet
  if (code === BOOTSTRAP_TEACHER_CODE) {
    const existingTeacher = await db.getFirstAsync<{ id: number }>(
      "SELECT id FROM users WHERE role = 'teacher' LIMIT 1"
    );
    if (!existingTeacher) return true;
    return false;
  }

  const row = await db.getFirstAsync<{
    id: number;
    used_by: number | null;
    expires_at: number;
  }>(
    'SELECT id, used_by, expires_at FROM teacher_codes WHERE code = ?',
    [code]
  );

  if (!row) return false;
  if (row.used_by !== null) return false;
  if (now > row.expires_at) return false;

  return true;
}

export async function registerTeacher(
  name: string,
  username: string,
  password: string,
  code: string
): Promise<User> {
  const db = await getDb();

  const isValid = await validateTeacherCode(code);
  if (!isValid) {
    throw new Error('Invalid or expired teacher code');
  }

  const existing = await db.getFirstAsync<{ id: number }>(
    'SELECT id FROM users WHERE username = ?',
    [username]
  );
  if (existing) {
    throw new Error('Username already exists');
  }

  const passwordHash = await hashPassword(password);
  const createdAt = Date.now();

  const result = await db.runAsync(
    'INSERT INTO users (name, username, password_hash, grade, role, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [name, username, passwordHash, '', 'teacher', createdAt]
  );

  await db.runAsync(
    'INSERT INTO user_stats (user_id) VALUES (?)',
    [result.lastInsertRowId]
  );

  // Mark code as used
  await db.runAsync(
    'UPDATE teacher_codes SET used_by = ? WHERE code = ?',
    [result.lastInsertRowId, code]
  );

  return {
    id: result.lastInsertRowId,
    name,
    username,
    grade: '',
    avatar: name.charAt(0).toUpperCase(),
    role: 'teacher',
  };
}

export async function generateTeacherCode(teacherId: number): Promise<string> {
  const db = await getDb();
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'TCH-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  const now = Date.now();
  const expiresAt = now + 7 * 24 * 60 * 60 * 1000; // 7 days

  await db.runAsync(
    'INSERT INTO teacher_codes (code, created_by, created_at, expires_at) VALUES (?, ?, ?, ?)',
    [code, teacherId, now, expiresAt]
  );

  return code;
}

export async function getLastSessionUser(): Promise<User | null> {
  try {
    const db = await getDb();
    const row = await db.getFirstAsync<{
      id: number;
      name: string;
      username: string;
      grade: string;
      role: string;
    }>(
      'SELECT id, name, username, grade, role FROM users ORDER BY created_at DESC LIMIT 1'
    );
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      username: row.username,
      grade: row.grade,
      avatar: row.name.charAt(0).toUpperCase(),
      role: row.role as 'student' | 'teacher',
    };
  } catch {
    return null;
  }
}
