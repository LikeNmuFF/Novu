import {
  QRChunkMeta,
  QRContentType,
  MAX_QR_CHUNK_SIZE,
  QR_FORMAT_VERSION,
  QRReconstruction,
} from '../../types/qr';
import { compressJSON } from './compress';

function generateId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function chunkString(str: string, chunkSize: number): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < str.length; i += chunkSize) {
    chunks.push(str.slice(i, i + chunkSize));
  }
  return chunks;
}

export function createChunks<T>(
  content: T,
  type: QRContentType
): QRChunkMeta[] {
  const { compressed, checksum } = compressJSON(content);
  const packageId = generateId();

  if (compressed.length <= MAX_QR_CHUNK_SIZE) {
    return [
      {
        v: QR_FORMAT_VERSION,
        id: packageId,
        i: 0,
        t: 1,
        d: compressed,
        c: checksum,
        type,
      },
    ];
  }

  const parts = chunkString(compressed, MAX_QR_CHUNK_SIZE);

  return parts.map((part, index) => ({
    v: QR_FORMAT_VERSION,
    id: packageId,
    i: index,
    t: parts.length,
    d: part,
    c: checksum,
    type,
  }));
}

export function createReconstruction(chunks: QRChunkMeta[]): QRReconstruction {
  const sorted = [...chunks].sort((a, b) => a.i - b.i);
  const totalChunks = sorted[0].t;

  return {
    packageId: sorted[0].id,
    totalChunks,
    receivedChunks: sorted.map((c) => c.i),
    data: sorted.map((c) => c.d),
  };
}

export function isComplete(
  reconstruction: QRReconstruction
): boolean {
  return reconstruction.receivedChunks.length === reconstruction.totalChunks;
}

export function isSingleChunk(chunks: QRChunkMeta[]): boolean {
  return chunks.length === 1 && chunks[0].t === 1;
}
