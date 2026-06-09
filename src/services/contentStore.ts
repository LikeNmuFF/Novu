import { getDb } from './database';
import type { QRContentType } from '../types/qr';

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
