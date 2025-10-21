/**
 * Encryption Service for API Keys and Sensitive Data
 * Uses AES-256-GCM for encryption
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly saltLength = 32;
  private readonly tagLength = 16;
  private masterKey: Buffer;

  constructor(masterPassword?: string) {
    const password = masterPassword || process.env.ENCRYPTION_KEY || this.generateSecureKey();
    // Derive a key from the master password
    const salt = process.env.ENCRYPTION_SALT || this.generateSecureKey();
    this.masterKey = scryptSync(password, salt, this.keyLength);
  }

  /**
   * Encrypt sensitive data
   */
  encrypt(plaintext: string): string {
    try {
      // Generate random IV
      const iv = randomBytes(this.ivLength);

      // Create cipher
      const cipher = createCipheriv(this.algorithm, this.masterKey, iv);

      // Encrypt data
      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // Get authentication tag
      const tag = cipher.getAuthTag();

      // Combine IV + encrypted data + tag
      const combined = Buffer.concat([
        iv,
        Buffer.from(encrypted, 'hex'),
        tag
      ]);

      // Return as base64
      return combined.toString('base64');
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypt sensitive data
   */
  decrypt(ciphertext: string): string {
    try {
      // Decode from base64
      const combined = Buffer.from(ciphertext, 'base64');

      // Extract IV, encrypted data, and tag
      const iv = combined.subarray(0, this.ivLength);
      const tag = combined.subarray(combined.length - this.tagLength);
      const encrypted = combined.subarray(this.ivLength, combined.length - this.tagLength);

      // Create decipher
      const decipher = createDecipheriv(this.algorithm, this.masterKey, iv);
      decipher.setAuthTag(tag);

      // Decrypt data
      let decrypted = decipher.update(encrypted.toString('hex'), 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * Encrypt an object's fields
   */
  encryptObject(obj: Record<string, any>): Record<string, string> {
    const encrypted: Record<string, string> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== null && value !== undefined) {
        encrypted[key] = this.encrypt(String(value));
      }
    }
    return encrypted;
  }

  /**
   * Decrypt an object's fields
   */
  decryptObject(obj: Record<string, string>): Record<string, string> {
    const decrypted: Record<string, string> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value) {
        try {
          decrypted[key] = this.decrypt(value);
        } catch (error) {
          console.error(`Failed to decrypt field ${key}:`, error.message);
          decrypted[key] = '[DECRYPTION_FAILED]';
        }
      }
    }
    return decrypted;
  }

  /**
   * Generate a secure random key
   */
  private generateSecureKey(): string {
    return randomBytes(this.saltLength).toString('hex');
  }

  /**
   * Hash sensitive data (one-way)
   */
  hash(data: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Mask sensitive data for display
   */
  mask(data: string, visibleChars: number = 4): string {
    if (!data || data.length <= visibleChars) {
      return '****';
    }
    const masked = '*'.repeat(Math.max(8, data.length - visibleChars));
    const visible = data.slice(-visibleChars);
    return `${masked}${visible}`;
  }
}

// Singleton instance
let encryptionServiceInstance: EncryptionService | null = null;

export function getEncryptionService(): EncryptionService {
  if (!encryptionServiceInstance) {
    encryptionServiceInstance = new EncryptionService();
  }
  return encryptionServiceInstance;
}
