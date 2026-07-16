-- 0002_fix_key_column_privileges.sql
--
-- 0001_init.sql tried to lock down anthropic_key_enc with:
--   revoke select (anthropic_key_enc) on public.profiles from authenticated, anon;
-- This does NOT work: Postgres only tracks REVOKE of a column-level grant if one was
-- explicitly GRANTed at the column level. Supabase's default privileges grant
-- table-level SELECT/INSERT/UPDATE (covering every column, including
-- anthropic_key_enc/anthropic_key_last4) to authenticated/anon, and a column-level
-- REVOKE cannot override a table-level GRANT. Net effect: the column was still fully
-- readable/writable by any authenticated user's own row via the anon-key+JWT client —
-- confirmed live (querying anthropic_key_enc through PostgREST with the anon key
-- returned 200 OK instead of a permission error).
--
-- Fix: revoke the table-level privileges entirely for these roles, then re-grant only
-- the specific columns they should ever see or write. anthropic_key_enc and
-- anthropic_key_last4 are omitted from every grant below — only the service_role
-- client (apps/backend/src/lib/supabaseAdmin.js), which bypasses grants altogether,
-- touches them.

revoke select, insert, update on public.profiles from authenticated, anon;

grant select (id, user_id, profile_json, created_at, updated_at)
  on public.profiles to authenticated;

grant insert (user_id, profile_json)
  on public.profiles to authenticated;

grant update (user_id, profile_json)
  on public.profiles to authenticated;
