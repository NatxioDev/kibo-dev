create or replace function private.sync_profile_from_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  google_name text := left(coalesce(
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'name', '')
  ), 50);
  google_avatar text := coalesce(
    nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
    nullif(new.raw_user_meta_data ->> 'picture', '')
  );
begin
  update public.profiles p
  set
    avatar_url = coalesce(google_avatar, p.avatar_url),
    display_name = case
      when google_name is not null
        and (p.display_name is null
             or p.display_name = split_part(new.email, '@', 1))
        then google_name
      else p.display_name
    end
  where p.id = new.id
    and (
      p.avatar_url is distinct from coalesce(google_avatar, p.avatar_url)
      or (google_name is not null
          and (p.display_name is null
               or p.display_name = split_part(new.email, '@', 1))
          and p.display_name is distinct from google_name)
    );

  return new;
end;
$$;

create trigger on_auth_user_metadata_updated_profile
  after update of raw_user_meta_data on auth.users
  for each row
  when (old.raw_user_meta_data is distinct from new.raw_user_meta_data)
  execute function private.sync_profile_from_auth_user();

update public.profiles p
set
  avatar_url = coalesce(
    nullif(u.raw_user_meta_data ->> 'avatar_url', ''),
    nullif(u.raw_user_meta_data ->> 'picture', ''),
    p.avatar_url
  ),
  display_name = case
    when coalesce(
           nullif(u.raw_user_meta_data ->> 'full_name', ''),
           nullif(u.raw_user_meta_data ->> 'name', '')
         ) is not null
      and (p.display_name is null
           or p.display_name = split_part(u.email, '@', 1))
      then left(coalesce(
        nullif(u.raw_user_meta_data ->> 'full_name', ''),
        nullif(u.raw_user_meta_data ->> 'name', '')
      ), 50)
    else p.display_name
  end
from auth.users u
where u.id = p.id;
