import { encrypt, decrypt } from '@/lib/encryption';

describe('Encryption', () => {
  it('should encrypt and decrypt a string correctly', () => {
    const original = 'my-secret-token';
    const encrypted = encrypt(original);
    const decrypted = decrypt(encrypted);
    
    expect(encrypted).not.toBe(original);
    expect(decrypted).toBe(original);
  });
});