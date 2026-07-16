import { randomBytes, createCipheriv, createDecipheriv } from 'node:crypto';

import { env, requireEnv } from '../config/env.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

export function getMasterKeyBuffer() {
  requireEnv(['MASTER_KEY']);
  const buffer = Buffer.from(env.MASTER_KEY, 'hex');
  if (buffer.length !== 32) {
    throw new Error('MASTER_KEY must be a 32-byte value hex-encoded (64 hex characters)');
  }
  return buffer;
}

export function encrypt(plaintext, masterKeyBuffer) {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, masterKeyBuffer, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString('base64'), authTag.toString('base64'), ciphertext.toString('base64')].join(':');
}

export function decrypt(stored, masterKeyBuffer) {
  const [ivB64, authTagB64, ciphertextB64] = stored.split(':');
  if (!ivB64 || !authTagB64 || !ciphertextB64) {
    throw new Error('Malformed encrypted payload');
  }
  const iv = Buffer.from(ivB64, 'base64');
  const authTag = Buffer.from(authTagB64, 'base64');
  const ciphertext = Buffer.from(ciphertextB64, 'base64');

  const decipher = createDecipheriv(ALGORITHM, masterKeyBuffer, iv);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plaintext.toString('utf8');
}
