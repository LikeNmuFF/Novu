import {
  QRChunkMeta,
  QRScanResult,
  QRContentType,
  QRStore,
  QRReconstruction,
} from '../../types/qr';
import { createChunks, createReconstruction, isComplete, isSingleChunk } from './chunk';
import { decompressJSON } from './compress';

const STORAGE_KEY = 'learnbasilan_qr_reconstructions';
const BLOCKED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const MAX_CHUNKS_PER_PACKAGE = 100;
const MAX_CHUNK_SIZE = 2000;

function isSafeKey(key: string): boolean {
  return !BLOCKED_KEYS.has(key);
}

function safeStoreGet(store: QRStore, packageId: string) {
  if (!isSafeKey(packageId)) return undefined;
  return store[packageId];
}

function safeStoreSet(store: QRStore, packageId: string, value: any): void {
  if (!isSafeKey(packageId)) return;
  store[packageId] = value;
}

function safeStoreDelete(store: QRStore, packageId: string): void {
  if (!isSafeKey(packageId)) return;
  delete store[packageId];
}

function getStore(): QRStore {
  try {
    const raw = (global as any).__QR_STORE__;
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) return raw;
  } catch {}
  return {};
}

function setStore(store: QRStore): void {
  try {
    (global as any).__QR_STORE__ = store;
  } catch {}
}

function getChunksForPackage(packageId: string): QRChunkMeta[] {
  const store = getStore();
  const entry = safeStoreGet(store, packageId);
  if (!entry) return [];
  return entry.chunks.filter((c): c is QRChunkMeta => c !== null);
}

function addChunkToStore(chunk: QRChunkMeta): void {
  const store = getStore();
  const packageId = chunk.id;

  if (!isSafeKey(packageId)) return;

  const existing = safeStoreGet(store, packageId);
  if (!existing) {
    if (chunk.t > MAX_CHUNKS_PER_PACKAGE) return;
    safeStoreSet(store, packageId, {
      chunks: new Array(chunk.t).fill(null),
      type: chunk.type,
      createdAt: Date.now(),
    });
  }

  const entry = safeStoreGet(store, packageId);
  if (entry) {
    entry.chunks[chunk.i] = chunk;
    setStore(store);
  }
}

function getReconstruction(packageId: string): QRReconstruction | null {
  const chunks = getChunksForPackage(packageId);
  if (chunks.length === 0) return null;
  return createReconstruction(chunks);
}

function reconstructFromChunks(chunks: QRChunkMeta[]): unknown {
  if (isSingleChunk(chunks)) {
    return decompressJSON(chunks[0].d, chunks[0].c);
  }

  const reconstruction = createReconstruction(chunks);
  const fullCompressed = reconstruction.data.join('');
  return decompressJSON(fullCompressed, chunks[0].c);
}

export function createQRPackage<T>(
  content: T,
  type: QRContentType
): QRChunkMeta[] {
  return createChunks(content, type);
}

function validateChunkMeta(meta: any): meta is QRChunkMeta {
  if (typeof meta !== 'object' || meta === null) return false;
  if (typeof meta.v !== 'number') return false;
  if (typeof meta.id !== 'string' || meta.id.length === 0) return false;
  if (typeof meta.i !== 'number' || meta.i < 0) return false;
  if (typeof meta.t !== 'number' || meta.t <= 0 || meta.t > MAX_CHUNKS_PER_PACKAGE) return false;
  if (typeof meta.d !== 'string' || meta.d.length > MAX_CHUNK_SIZE) return false;
  if (typeof meta.c !== 'string') return false;
  if (typeof meta.type !== 'string') return false;
  if (!isSafeKey(meta.id)) return false;
  return true;
}

export function processQRScan(chunkData: string): QRScanResult {
  try {
    if (typeof chunkData !== 'string' || chunkData.length === 0) {
      return { status: 'invalid', error: 'Invalid QR data' };
    }

    const meta: unknown = JSON.parse(chunkData);

    if (!validateChunkMeta(meta)) {
      return { status: 'invalid', error: 'Missing or invalid fields in QR payload' };
    }

    if (meta.i >= meta.t) {
      return { status: 'invalid', error: `Invalid chunk index ${meta.i} of ${meta.t}` };
    }

    const existingChunks = getChunksForPackage(meta.id);
    if (existingChunks[meta.i]) {
      return {
        status: 'duplicate',
        packageId: meta.id,
        type: meta.type,
        progress: {
          received: existingChunks.filter(Boolean).length,
          total: meta.t,
        },
      };
    }

    addChunkToStore(meta);
    const currentChunks = getChunksForPackage(meta.id);

    if (!isComplete(createReconstruction(currentChunks))) {
      return {
        status: 'partial',
        packageId: meta.id,
        type: meta.type,
        progress: {
          received: currentChunks.filter(Boolean).length,
          total: meta.t,
        },
      };
    }

    const content = reconstructFromChunks(currentChunks);

    return {
      status: 'complete',
      packageId: meta.id,
      type: meta.type,
      content,
      progress: {
        received: meta.t,
        total: meta.t,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { status: 'invalid', error: message };
  }
}

export function getQRProgress(packageId: string): QRScanResult {
  const chunks = getChunksForPackage(packageId);
  if (chunks.length === 0) {
    return { status: 'invalid', error: 'No chunks found for this package' };
  }

  const total = chunks[0].t;
  const received = chunks.filter(Boolean).length;

  if (isComplete(createReconstruction(chunks))) {
    const content = reconstructFromChunks(chunks);
    return {
      status: 'complete',
      packageId,
      type: chunks[0].type,
      content,
      progress: { received, total },
    };
  }

  return {
    status: 'partial',
    packageId,
    type: chunks[0].type,
    progress: { received, total },
  };
}

export function clearQRPackage(packageId: string): void {
  const store = getStore();
  safeStoreDelete(store, packageId);
  setStore(store);
}

export function clearAllQRSessions(): void {
  setStore({});
}
