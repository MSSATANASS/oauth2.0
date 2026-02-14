import { encrypt, decrypt } from './encryption';

describe('Encryption Utility', () => {
  it('should encrypt and decrypt a string correctly', () => {
    const originalText = 'Hello World';
    const encrypted = encrypt(originalText);
    const decrypted = decrypt(encrypted);
    
    expect(encrypted).not.toBe(originalText);
    expect(decrypted).toBe(originalText);
  });

  it('should return empty string for empty input', () => {
    expect(encrypt('')).toBe('');
    expect(decrypt('')).toBe('');
  });

  it('should return original text if not in encrypted format', () => {
    const plainText = 'NotEncrypted';
    expect(decrypt(plainText)).toBe(plainText);
  });
});
