export const QR_FORMAT_VERSION = 1;

export const MAX_QR_CHUNK_SIZE = 1800;

export enum QRContentType {
  Lesson = 'lesson',
  Quiz = 'quiz',
  Subject = 'subject',
  Progress = 'progress',
  Translation = 'translation',
}

export interface QRChunkMeta {
  v: number;
  id: string;
  i: number;
  t: number;
  d: string;
  c: string;
  type: QRContentType;
}

export interface QRChunk {
  index: number;
  total: number;
  packageId: string;
  data: string;
}

export interface QRScannedChunk {
  meta: QRChunkMeta;
  receivedAt: number;
}

export interface QRReconstruction {
  packageId: string;
  totalChunks: number;
  receivedChunks: number[];
  data: string[];
}

export interface QRPackage {
  id: string;
  type: QRContentType;
  content: unknown;
  checksum: string;
  totalChunks: number;
}

export interface QRScanResult {
  status: 'complete' | 'partial' | 'duplicate' | 'invalid';
  packageId?: string;
  type?: QRContentType;
  content?: unknown;
  progress?: { received: number; total: number };
  error?: string;
}

export interface QRStore {
  [packageId: string]: {
    chunks: (QRChunkMeta | null)[];
    type: QRContentType;
    createdAt: number;
  };
}
