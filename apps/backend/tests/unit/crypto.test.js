import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';

import { encrypt, decrypt } from '../../src/lib/crypto.js';

function testKey() {
  return randomBytes(32);
}

test('encrypt/decrypt round-trip returns the original plaintext', () => {
  const key = testKey();
  const plaintext = 'sk-ant-super-secret-key-value';
  const stored = encrypt(plaintext, key);
  assert.equal(decrypt(stored, key), plaintext);
});

test('encrypting the same plaintext twice yields different ciphertext (unique IV)', () => {
  const key = testKey();
  const plaintext = 'sk-ant-same-value';
  const a = encrypt(plaintext, key);
  const b = encrypt(plaintext, key);
  assert.notEqual(a, b);
  assert.equal(decrypt(a, key), plaintext);
  assert.equal(decrypt(b, key), plaintext);
});

test('tampering with the stored ciphertext causes decrypt to throw', () => {
  const key = testKey();
  const stored = encrypt('sk-ant-value', key);
  const [iv, authTag, ciphertext] = stored.split(':');
  const tamperedBuffer = Buffer.from(ciphertext, 'base64');
  tamperedBuffer[0] ^= 0xff;
  const tampered = [iv, authTag, tamperedBuffer.toString('base64')].join(':');
  assert.throws(() => decrypt(tampered, key));
});

test('decrypting with the wrong key throws', () => {
  const key = testKey();
  const wrongKey = testKey();
  const stored = encrypt('sk-ant-value', key);
  assert.throws(() => decrypt(stored, wrongKey));
});
