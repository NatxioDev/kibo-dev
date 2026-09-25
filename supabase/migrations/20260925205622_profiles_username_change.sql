alter table public.profiles add column username_changed_at timestamptz;

create or replace function private.handle_profile_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.username is distinct from old.username then
    if old.username is not null
       and coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then
      raise exception 'username cannot be changed' using errcode = 'P0001';
    end if;
    new.username_changed_at := now();
  else
    new.username_changed_at := old.username_changed_at;
  end if;

  new.updated_at := now();
  return new;
end;
$$;
