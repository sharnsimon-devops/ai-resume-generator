import { createClient } from '@supabase/supabase-js';

import { env, requireEnv } from '../config/env.js';

export function getSupabaseForUser(accessToken) {
  requireEnv(['SUPABASE_URL', 'SUPABASE_ANON_KEY']);

  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
