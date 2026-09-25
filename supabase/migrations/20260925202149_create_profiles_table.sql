create extension if not exists citext with schema extensions;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username extensions.citext unique,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_format check (
    username is null or username::text ~ '^[a-z0-9_]{3,20}$'
  ),
  constraint profiles_username_not_reserved check (
    username is null or username::text not in (
      'admin', 'kibo', 'settings', 'login', 'onboarding', 'api', 'auth', 'support'
    )
  ),
  constraint profiles_display_name_length check (
    display_name is null or char_length(display_name) between 1 and 50
  )
);

alter table public.profiles enable row level security;

create policy "Authenticated users can read profiles"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create or replace function private.handle_profile_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.username is not null and new.username is distinct from old.username then
    raise exception 'username cannot be changed' using errcode = 'P0001';
  end if;

  new.updated_at := now();
  return new;
end;
$$;

create trigger on_profile_update
  before update on public.profiles
  for each row execute function private.handle_profile_update();

create or replace function private.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    left(coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      split_part(new.email, '@', 1)
    ), 50),
    coalesce(
      new.raw_user_meta_data ->> 'avatar_url',
      new.raw_user_meta_data ->> 'picture'
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute function private.handle_new_user_profile();

insert into public.profiles (id, display_name, avatar_url)
select
  u.id,
  left(coalesce(
    nullif(u.raw_user_meta_data ->> 'full_name', ''),
    nullif(u.raw_user_meta_data ->> 'name', ''),
    split_part(u.email, '@', 1)
  ), 50),
  coalesce(
    u.raw_user_meta_data ->> 'avatar_url',
    u.raw_user_meta_data ->> 'picture'
  )
from auth.users u
on conflict (id) do nothing;
