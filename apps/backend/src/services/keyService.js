import { env } from '../config/env.js';
import { getSupabaseAdmin } from '../lib/supabaseAdmin.js';
import { encrypt, decrypt, getMasterKeyBuffer } from '../lib/crypto.js';
import { createAnthropicClient } from '../lib/anthropicClient.js';

function last4(plaintextKey) {
  return plaintextKey.slice(-4);
}

export async function getKeyStatus(userId) {
  const { data, error } = await getSupabaseAdmin()
    .from('profiles')
    .select('anthropic_key_last4')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;

  return { hasKey: Boolean(data?.anthropic_key_last4), last4: data?.anthropic_key_last4 ?? null };
}

export async function saveKey(userId, plaintextKey) {
  const client = createAnthropicClient({ apiKey: plaintextKey, mock: env.ANTHROPIC_MOCK_MODE });
  const validation = await client.validateApiKey(plaintextKey);

  if (!validation.valid) {
    const err = new Error('invalid_anthropic_key');
    err.status = 422;
    err.publicMessage = 'invalid_anthropic_key';
    throw err;
  }

  const encrypted = encrypt(plaintextKey, getMasterKeyBuffer());

  const { error } = await getSupabaseAdmin()
    .from('profiles')
    .upsert(
      { user_id: userId, anthropic_key_enc: encrypted, anthropic_key_last4: last4(plaintextKey) },
      { onConflict: 'user_id' },
    );

  if (error) throw error;

  return { hasKey: true, last4: last4(plaintextKey) };
}

export async function deleteKey(userId) {
  const { error } = await getSupabaseAdmin()
    .from('profiles')
    .update({ anthropic_key_enc: null, anthropic_key_last4: null })
    .eq('user_id', userId);

  if (error) throw error;

  return { hasKey: false, last4: null };
}

export async function getDecryptedApiKey(userId) {
  const { data, error } = await getSupabaseAdmin()
    .from('profiles')
    .select('anthropic_key_enc')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  if (!data?.anthropic_key_enc) {
    const err = new Error('no_anthropic_key');
    err.status = 422;
    err.publicMessage = 'no_anthropic_key';
    throw err;
  }

  return decrypt(data.anthropic_key_enc, getMasterKeyBuffer());
}
