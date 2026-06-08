import pako from 'pako';
import { crc32 } from './crc32';

function toBase64(bytes: Uint8Array): string {
  const chars: string[] = [];
  for (let i = 0; i < bytes.length; i++) {
    chars.push(String.fromCharCode(bytes[i]));
  }
  return btoa(chars.join(''));
}

function fromBase64(base64: string): Uint8Array {
  const binaryStr = atob(base64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return bytes;
}

export function compressJSON<T>(data: T): { compressed: string; checksum: string } {
  const jsonStr = JSON.stringify(data);
  const checksum = crc32(jsonStr);
  const compressed = toBase64(pako.deflate(jsonStr, { level: 9 }));
  return { compressed, checksum };
}

export function decompressJSON<T>(compressed: string, expectedChecksum?: string): T {
  const binary = fromBase64(compressed);
  const jsonStr = pako.inflate(binary, { to: 'string' });
  if (expectedChecksum) {
    const actualChecksum = crc32(jsonStr);
    if (actualChecksum !== expectedChecksum) {
      throw new Error(
        `Checksum mismatch: expected ${expectedChecksum}, got ${actualChecksum}`
      );
    }
  }
  return JSON.parse(jsonStr) as T;
}
