-- 0001_init.sql
-- AI Resume Builder — Phase 1 schema, RLS, indexes

create extension if not exists "pgcrypto"; -- provides gen_random_uuid()

-- ============================================================
-- profiles
-- ============================================================
create table if not exists public.profiles (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null unique references auth.users(id) on delete cascade,
  profile_json        jsonb not null default '{}'::jsonb,
  anthropic_key_enc   text,               -- "<ivB64>:<authTagB64>:<ciphertextB64>", AES-256-GCM
  anthropic_key_last4 text,               -- plaintext last 4 chars only, for display; not sensitive
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists idx_profiles_profile_json_gin
  on public.profiles using gin (profile_json);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = user_id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = user_id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "profiles_delete_own" on public.profiles
  for delete using (auth.uid() = user_id);

-- Defense in depth: RLS scopes rows, not columns. Even though only the owning
-- user can select their own row, the encrypted key must never be readable
-- from any client-facing role (per spec: "never selectable from any
-- client-readable path"). A column-level REVOKE cannot override the broader
-- table-level GRANT that Supabase's default privileges set up, so the table-level
-- grant is revoked outright and only the specific columns anon/authenticated should
-- ever touch are re-granted. anthropic_key_enc and anthropic_key_last4 are
-- deliberately excluded from every grant below — the backend reads/writes them
-- exclusively via the service_role client (see apps/backend/src/lib/supabaseAdmin.js),
-- which bypasses grants entirely.
revoke select, insert, update on public.profiles from authenticated, anon;

grant select (id, user_id, profile_json, created_at, updated_at)
  on public.profiles to authenticated;

grant insert (user_id, profile_json)
  on public.profiles to authenticated;

grant update (user_id, profile_json)
  on public.profiles to authenticated;

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- ============================================================
-- generations
-- ============================================================
create table if not exists public.generations (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  jd_text        text not null,
  steering_json  jsonb not null default '{}'::jsonb,
  result_json    jsonb,
  render_engine  text not null default 'html' check (render_engine in ('html', 'latex')),
  flags_json     jsonb not null default '[]'::jsonb,
  created_at     timestamptz not null default now()
);

create index if not exists idx_generations_user_created
  on public.generations (user_id, created_at desc);

create index if not exists idx_generations_result_json_gin
  on public.generations using gin (result_json);

alter table public.generations enable row level security;

create policy "generations_select_own" on public.generations
  for select using (auth.uid() = user_id);

create policy "generations_insert_own" on public.generations
  for insert with check (auth.uid() = user_id);

create policy "generations_update_own" on public.generations
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "generations_delete_own" on public.generations
  for delete using (auth.uid() = user_id);
