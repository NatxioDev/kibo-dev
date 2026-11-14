create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type = any (array['BUG'::text, 'IDEA'::text, 'OTHER'::text])),
  message text not null check (char_length(trim(message)) >= 10),
  page text null,
  created_at timestamptz not null default now()
);

create index feedback_user_id_created_at_idx on public.feedback (user_id, created_at desc);

alter table public.feedback enable row level security;

create policy "Users can create own feedback"
  on public.feedback
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can view own feedback"
  on public.feedback
  for select
  to authenticated
  using ((select auth.uid()) = user_id);
