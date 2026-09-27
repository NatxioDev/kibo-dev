create type public.friendship_status as enum ('pending', 'accepted');

create table public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null default auth.uid()
    references public.profiles (id) on delete cascade,
  addressee_id uuid not null
    references public.profiles (id) on delete cascade,
  status public.friendship_status not null default 'pending',
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  constraint friendships_not_self check (requester_id <> addressee_id)
);

create unique index friendships_pair_key on public.friendships (
  least(requester_id, addressee_id),
  greatest(requester_id, addressee_id)
);

create index friendships_requester_id_idx on public.friendships (requester_id);
create index friendships_addressee_id_idx on public.friendships (addressee_id);

alter table public.friendships enable row level security;

create policy "Participants can read their friendships"
  on public.friendships for select
  to authenticated
  using ((select auth.uid()) in (requester_id, addressee_id));

create policy "Users can send friend requests"
  on public.friendships for insert
  to authenticated
  with check ((select auth.uid()) = requester_id and status = 'pending');

create policy "Addressees can accept friend requests"
  on public.friendships for update
  to authenticated
  using ((select auth.uid()) = addressee_id and status = 'pending')
  with check ((select auth.uid()) = addressee_id and status = 'accepted');

create policy "Participants can delete their friendships"
  on public.friendships for delete
  to authenticated
  using ((select auth.uid()) in (requester_id, addressee_id));

create or replace function private.handle_friendship_write()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.created_at := now();
    new.responded_at := null;
    return new;
  end if;

  if new.requester_id <> old.requester_id
     or new.addressee_id <> old.addressee_id
     or new.created_at <> old.created_at then
    raise exception 'friendship participants cannot be changed' using errcode = 'P0001';
  end if;

  if new.status is distinct from old.status then
    new.responded_at := now();
  else
    new.responded_at := old.responded_at;
  end if;

  return new;
end;
$$;

create trigger on_friendship_write
  before insert or update on public.friendships
  for each row execute function private.handle_friendship_write();
