-- Create templates table for LaTeX engine
create table templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  content text not null,
  created_at timestamptz default now() not null
);

-- Turn on Row Level Security
alter table templates enable row level security;

-- Policies
create policy "Users can insert their own templates."
  on templates for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own templates."
  on templates for select
  using (auth.uid() = user_id);

create policy "Users can update their own templates."
  on templates for update
  using (auth.uid() = user_id);

create policy "Users can delete their own templates."
  on templates for delete
  using (auth.uid() = user_id);

-- Optional: index on user_id for faster lookups
create index idx_templates_user_id on templates(user_id);
