create type public.account_type as enum (
  'SAVINGS',
  'CHECKING',
  'CASH',
  'EXPENSES',
  'OTHER'
);

create type public.account_currency as enum ('BOB', 'USD');

create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references public.profiles (id) on delete cascade,
  name text not null,
  type public.account_type not null default 'OTHER',
  currency public.account_currency not null default 'BOB',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint accounts_name_length check (
    char_length(trim(name)) between 1 and 40
  )
);

create unique index accounts_user_id_name_key
  on public.accounts (user_id, lower(trim(name)));

create index accounts_user_id_idx on public.accounts (user_id);
create index accounts_user_id_active_idx
  on public.accounts (user_id)
  where is_active = true;

alter table public.accounts enable row level security;

create policy "Users can read their own accounts"
  on public.accounts for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own accounts"
  on public.accounts for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own accounts"
  on public.accounts for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own accounts"
  on public.accounts for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create or replace function private.handle_account_write()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.created_at := now();
    new.updated_at := now();
    new.name := trim(new.name);
    return new;
  end if;

  if new.user_id <> old.user_id
     or new.created_at <> old.created_at then
    raise exception 'account ownership cannot be changed' using errcode = 'P0001';
  end if;

  new.name := trim(new.name);
  new.updated_at := now();
  return new;
end;
$$;

create trigger on_account_write
  before insert or update on public.accounts
  for each row execute function private.handle_account_write();

alter table public.transactions
  add column account_id uuid null
    references public.accounts (id) on delete restrict;

create index transactions_account_id_idx
  on public.transactions (account_id);
