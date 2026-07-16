import { getSupabaseForUser } from '../lib/supabaseForRequest.js';

export async function getProfile(userId, accessToken) {
  const { data, error } = await getSupabaseForUser(accessToken)
    .from('profiles')
    .select('profile_json')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;

  return data?.profile_json ?? null;
}

export async function saveProfile(userId, accessToken, profileJson) {
  const { error } = await getSupabaseForUser(accessToken)
    .from('profiles')
    .upsert({ user_id: userId, profile_json: profileJson }, { onConflict: 'user_id' });

  if (error) throw error;

  return profileJson;
}
