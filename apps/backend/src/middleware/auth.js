import { createClient } from '@supabase/supabase-js';

import { env, requireEnv } from '../config/env.js';
import { asyncHandler } from '../utils/asyncHandler.js';

let authClient;

function getAuthClient() {
  if (!authClient) {
    requireEnv(['SUPABASE_URL', 'SUPABASE_ANON_KEY']);
    authClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return authClient;
}

export const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : null;

  if (!token) {
    return res.status(401).json({ error: 'missing_authorization' });
  }

  const { data, error } = await getAuthClient().auth.getUser(token);

  if (error || !data?.user) {
    return res.status(401).json({ error: 'invalid_token' });
  }

  req.user = { id: data.user.id, email: data.user.email };
  req.accessToken = token;
  next();
});
