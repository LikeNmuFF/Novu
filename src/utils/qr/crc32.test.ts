import { crc32 } from './crc32';

describe('crc32', () => {
  it('should generate consistent checksums', () => {
    const input = 'Hello Basilan';
    const output = crc32(input);
    expect(output).toBe(crc32(input));
    expect(output).toHaveLength(8);
  });

  it('should generate different checksums for different strings', () => {
    const input1 = 'Hello Basilan';
    const input2 = 'Hello Zamboanga';
    expect(crc32(input1)).not.toBe(crc32(input2));
  });

  it('should match known CRC32 values', () => {
    // CRC32 for "123456789" is cbf43926
    expect(crc32('123456789')).toBe('cbf43926');
  });
});
