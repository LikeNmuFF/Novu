export { crc32 } from './crc32';
export { compressJSON, decompressJSON } from './compress';
export { createChunks, createReconstruction, isComplete, isSingleChunk } from './chunk';
export {
  createQRPackage,
  processQRScan,
  getQRProgress,
  clearQRPackage,
  clearAllQRSessions,
} from './package';

export {
  QRContentType,
  QR_FORMAT_VERSION,
  MAX_QR_CHUNK_SIZE,
} from '../../types/qr';

export type {
  QRChunkMeta,
  QRChunk,
  QRScannedChunk,
  QRReconstruction,
  QRPackage,
  QRScanResult,
  QRStore,
} from '../../types/qr';
