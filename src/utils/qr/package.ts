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

function getStore(): QRStore {
  try {
    const raw = (global as any).__QR_STORE__;
    if (raw) return raw;
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
  const entry = store[packageId];
  if (!entry) return [];
  return entry.chunks.filter((c): c is QRChunkMeta => c !== null);
}

function addChunkToStore(chunk: QRChunkMeta): void {
  const store = getStore();
  const packageId = chunk.id;

  if (!store[packageId]) {
    store[packageId] = {
      chunks: new Array(chunk.t).fill(null),
      type: chunk.type,
      createdAt: Date.now(),
    };
  }

  store[packageId].chunks[chunk.i] = chunk;
  setStore(store);
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

export function processQRScan(chunkData: string): QRScanResult {
  try {
    const meta: QRChunkMeta = JSON.parse(chunkData);

    if (!meta.v || !meta.id || meta.i === undefined || !meta.t || !meta.d || !meta.c || !meta.type) {
      return { status: 'invalid', error: 'Missing required fields in QR payload' };
    }

    if (meta.i < 0 || meta.i >= meta.t) {
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
  delete store[packageId];
  setStore(store);
}

export function clearAllQRSessions(): void {
  setStore({});
}
