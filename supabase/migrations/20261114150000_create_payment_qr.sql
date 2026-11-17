-- Un QR de cobro por usuario (KIBO-80).
-- Kibo guarda la imagen tal cual. No la genera, no la decodifica y no la modifica.
-- La ven el dueño y quienes tienen una deuda abierta con él.

create table public.payment_qrs (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  object_path text not null,
  label text,
  mime text not null,
  size_bytes integer not null,
  sha256 text not null,
  manual_expires_on date,
  consent_version text not null,
  consent_accepted_at timestamptz not null,
  uploaded_at timestamptz not null default pg_catalog.now(),
  replaced_at timestamptz,
  revision integer not null default 1,
  updated_at timestamptz not null default pg_catalog.now(),
  constraint payment_qrs_label_length check (
    label is null or (char_length(label) between 1 and 40 and label !~ '[\n\r]')
  ),
  constraint payment_qrs_mime check (mime in ('image/png', 'image/jpeg', 'image/webp')),
  constraint payment_qrs_size check (size_bytes > 0 and size_bytes <= 2097152),
  constraint payment_qrs_sha256 check (sha256 ~ '^[a-f0-9]{64}$'),
  constraint payment_qrs_revision_positive check (revision > 0),
  constraint payment_qrs_consent_version check (char_length(consent_version) between 1 and 40),
  constraint payment_qrs_path_owner check (
    object_path ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(png|jpg|webp)$'
    and split_part(object_path, '/', 1) = user_id::text
  ),
  constraint payment_qrs_expires_year check (
    manual_expires_on is null
    or (
      extract(year from manual_expires_on) between 2000 and 2100
    )
  )
);

comment on table public.payment_qrs is
  'Imagen de QR de cobro subida por el usuario. Una fila por persona. El archivo vive en el bucket privado payment-qr.';

create table public.payment_qr_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null,
  label text,
  mime text,
  size_bytes integer,
  sha256 text,
  manual_expires_on date,
  object_path text,
  revision integer,
  created_at timestamptz not null default pg_catalog.now(),
  constraint payment_qr_events_kind check (kind in ('uploaded', 'replaced', 'deleted'))
);

comment on table public.payment_qr_events is
  'Auditoría del QR sin la imagen: quién, cuándo y el hash. No conserva el archivo.';

create index payment_qr_events_user_created_idx
  on public.payment_qr_events (user_id, created_at desc);

create table public.payment_qr_notices (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  viewer_id uuid not null references public.profiles (id) on delete cascade,
  revision integer not null,
  kind text not null,
  created_at timestamptz not null default pg_catalog.now(),
  seen_at timestamptz,
  constraint payment_qr_notices_kind check (kind in ('replaced', 'deleted')),
  constraint payment_qr_notices_not_self check (owner_id <> viewer_id),
  constraint payment_qr_notices_once unique (owner_id, viewer_id, revision, kind)
);

create index payment_qr_notices_viewer_unseen_idx
  on public.payment_qr_notices (viewer_id, owner_id)
  where seen_at is null;

comment on table public.payment_qr_notices is
  'Aviso a quienes tienen una deuda abierta cuando el dueño reemplaza o elimina su QR.';

create table public.payment_qr_purge_queue (
  id uuid primary key default gen_random_uuid(),
  object_path text not null,
  user_id uuid,
  reason text not null,
  created_at timestamptz not null default pg_catalog.now(),
  purged_at timestamptz,
  constraint payment_qr_purge_queue_reason check (reason in ('replaced', 'deleted'))
);

create index payment_qr_purge_queue_pending_idx
  on public.payment_qr_purge_queue (created_at)
  where purged_at is null;

comment on table public.payment_qr_purge_queue is
  'Rutas pendientes de borrar por la API de Storage. El SQL no borra el archivo: solo anota la ruta.';

alter table public.payment_qrs enable row level security;
alter table public.payment_qr_events enable row level security;
alter table public.payment_qr_notices enable row level security;
alter table public.payment_qr_purge_queue enable row level security;

create or replace function private.has_open_debt_toward(
  p_debtor uuid,
  p_creditor uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_debtor is not null
    and p_creditor is not null
    and p_debtor <> p_creditor
    and (
      private.net_debtor_owes(p_debtor, p_creditor, 'BOB') > 0
      or private.net_debtor_owes(p_debtor, p_creditor, 'USD') > 0
    );
$$;

create or replace function public.can_see_payment_qr(p_owner uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_owner is not null
    and (select auth.uid()) is not null
    and (
      p_owner = (select auth.uid())
      or private.has_open_debt_toward((select auth.uid()), p_owner)
    );
$$;

create or replace function public.payment_qr_object_visible(p_name text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_folder text;
begin
  if (select auth.uid()) is null or p_name is null then
    return false;
  end if;

  v_folder := (storage.foldername(p_name))[1];
  if v_folder is null
    or v_folder !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    return false;
  end if;

  return public.can_see_payment_qr(v_folder::uuid);
end;
$$;

create policy "Owner and open debtors can read payment qr rows"
  on public.payment_qrs
  for select
  to authenticated
  using (public.can_see_payment_qr(user_id));

create policy "Owner can read own payment qr events"
  on public.payment_qr_events
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Viewer can read own payment qr notices"
  on public.payment_qr_notices
  for select
  to authenticated
  using ((select auth.uid()) = viewer_id);

-- Sin policies de escritura: solo las funciones security definer modifican estas tablas.
-- La cola de purga no tiene policies: el cliente no la lee. El service role la drena.

revoke insert, update, delete, truncate on public.payment_qrs from anon, authenticated;
revoke insert, update, delete, truncate on public.payment_qr_events from anon, authenticated;
revoke insert, update, delete, truncate on public.payment_qr_notices from anon, authenticated;
revoke all on public.payment_qr_purge_queue from anon, authenticated;

grant select on public.payment_qrs to authenticated;
grant select on public.payment_qr_events to authenticated;
grant select on public.payment_qr_notices to authenticated;
grant select, insert, update, delete on public.payment_qr_purge_queue to service_role;

create or replace function private.enqueue_payment_qr_purge()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    insert into public.payment_qr_purge_queue (object_path, user_id, reason)
    values (old.object_path, old.user_id, 'deleted');
    return old;
  end if;

  if tg_op = 'UPDATE' and new.object_path is distinct from old.object_path then
    insert into public.payment_qr_purge_queue (object_path, user_id, reason)
    values (old.object_path, old.user_id, 'replaced');
  end if;

  return new;
end;
$$;

create trigger payment_qrs_enqueue_purge
  before update or delete on public.payment_qrs
  for each row execute function private.enqueue_payment_qr_purge();

create or replace function private.notify_payment_qr_debtors(
  p_owner uuid,
  p_revision integer,
  p_kind text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.payment_qr_notices (owner_id, viewer_id, revision, kind)
  select p_owner, party.other_id, p_revision, p_kind
  from (
    select distinct
      case
        when entry.debtor_id = p_owner then entry.creditor_id
        else entry.debtor_id
      end as other_id
    from public.debt_entries as entry
    where entry.debtor_id = p_owner or entry.creditor_id = p_owner
  ) as party
  where party.other_id is not null
    and party.other_id <> p_owner
    and private.has_open_debt_toward(party.other_id, p_owner)
  on conflict (owner_id, viewer_id, revision, kind) do nothing;
end;
$$;

create or replace function private.assert_payment_qr_expiry(p_date date)
returns void
language plpgsql
set search_path = ''
as $$
begin
  if p_date is not null
    and (
      extract(year from p_date) < 2000
      or extract(year from p_date) > 2100
    ) then
    raise exception 'La fecha de vigencia no es válida.' using errcode = 'P0001';
  end if;
end;
$$;

create or replace function private.normalize_payment_qr_label(p_label text)
returns text
language plpgsql
set search_path = ''
as $$
declare
  v_label text := nullif(btrim(coalesce(p_label, '')), '');
begin
  if v_label is null then
    return null;
  end if;

  if char_length(v_label) > 40 or v_label ~ '[\n\r]' then
    raise exception 'La etiqueta puede tener hasta 40 caracteres.' using errcode = 'P0001';
  end if;

  return v_label;
end;
$$;

create or replace function public.save_payment_qr(
  p_object_path text,
  p_label text,
  p_mime text,
  p_size_bytes integer,
  p_sha256 text,
  p_manual_expires_on date,
  p_consent_version text,
  p_consent boolean
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_existing public.payment_qrs%rowtype;
  v_label text;
  v_revision integer;
  v_previous text;
  v_had_qr boolean;
begin
  if v_uid is null then
    raise exception 'Debes iniciar sesión.' using errcode = 'P0001';
  end if;

  if p_consent_version is null or char_length(btrim(p_consent_version)) = 0 then
    raise exception 'CONSENT_REQUIRED' using errcode = 'P0001';
  end if;

  v_label := private.normalize_payment_qr_label(p_label);
  perform private.assert_payment_qr_expiry(p_manual_expires_on);

  select * into v_existing
  from public.payment_qrs
  where user_id = v_uid;
  v_had_qr := found;

  if p_object_path is null then
    if not v_had_qr then
      raise exception 'Primero sube una imagen.' using errcode = 'P0001';
    end if;

    if v_existing.consent_version is distinct from p_consent_version
      and coalesce(p_consent, false) is not true then
      raise exception 'CONSENT_REQUIRED' using errcode = 'P0001';
    end if;

    update public.payment_qrs
    set label = v_label,
        manual_expires_on = p_manual_expires_on,
        consent_version = case
          when coalesce(p_consent, false)
            and consent_version is distinct from p_consent_version
          then p_consent_version
          else consent_version
        end,
        consent_accepted_at = case
          when coalesce(p_consent, false)
            and consent_version is distinct from p_consent_version
          then pg_catalog.now()
          else consent_accepted_at
        end,
        updated_at = pg_catalog.now()
    where user_id = v_uid;

    return jsonb_build_object('replaced', false, 'previous_path', null);
  end if;

  if p_object_path !~ (
    '^' || v_uid::text || '/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(png|jpg|webp)$'
  ) then
    raise exception 'INVALID_PATH' using errcode = 'P0001';
  end if;

  if p_mime not in ('image/png', 'image/jpeg', 'image/webp')
    or p_size_bytes is null
    or p_size_bytes <= 0
    or p_size_bytes > 2097152
    or p_sha256 is null
    or p_sha256 !~ '^[a-f0-9]{64}$' then
    raise exception 'INVALID_FILE' using errcode = 'P0001';
  end if;

  if (
    select count(*)
    from public.payment_qr_events
    where user_id = v_uid
      and kind in ('uploaded', 'replaced')
      and created_at > pg_catalog.now() - interval '1 hour'
  ) >= 10 then
    raise exception 'RATE_LIMIT' using errcode = 'P0001';
  end if;

  if v_had_qr then
    if not exists (
      select 1
      from auth.users
      where id = v_uid
        and last_sign_in_at is not null
        and last_sign_in_at > pg_catalog.now() - interval '10 minutes'
    ) then
      raise exception 'REAUTH_REQUIRED' using errcode = 'P0001';
    end if;
  end if;

  if not v_had_qr then
    if coalesce(p_consent, false) is not true then
      raise exception 'CONSENT_REQUIRED' using errcode = 'P0001';
    end if;
  elsif v_existing.consent_version is distinct from p_consent_version
    and coalesce(p_consent, false) is not true then
    raise exception 'CONSENT_REQUIRED' using errcode = 'P0001';
  end if;

  if not v_had_qr then
    insert into public.payment_qrs (
      user_id,
      object_path,
      label,
      mime,
      size_bytes,
      sha256,
      manual_expires_on,
      consent_version,
      consent_accepted_at,
      uploaded_at,
      revision,
      updated_at
    ) values (
      v_uid,
      p_object_path,
      v_label,
      p_mime,
      p_size_bytes,
      p_sha256,
      p_manual_expires_on,
      p_consent_version,
      pg_catalog.now(),
      pg_catalog.now(),
      1,
      pg_catalog.now()
    );

    insert into public.payment_qr_events (
      user_id, kind, label, mime, size_bytes, sha256, manual_expires_on, object_path, revision
    ) values (
      v_uid, 'uploaded', v_label, p_mime, p_size_bytes, p_sha256,
      p_manual_expires_on, p_object_path, 1
    );

    return jsonb_build_object('replaced', false, 'previous_path', null);
  end if;

  v_previous := v_existing.object_path;
  v_revision := v_existing.revision + 1;

  update public.payment_qrs
  set object_path = p_object_path,
      label = v_label,
      mime = p_mime,
      size_bytes = p_size_bytes,
      sha256 = p_sha256,
      manual_expires_on = p_manual_expires_on,
      consent_version = case
        when consent_version is distinct from p_consent_version then p_consent_version
        else consent_version
      end,
      consent_accepted_at = case
        when consent_version is distinct from p_consent_version then pg_catalog.now()
        else consent_accepted_at
      end,
      replaced_at = pg_catalog.now(),
      revision = v_revision,
      updated_at = pg_catalog.now()
  where user_id = v_uid;

  insert into public.payment_qr_events (
    user_id, kind, label, mime, size_bytes, sha256, manual_expires_on, object_path, revision
  ) values (
    v_uid, 'replaced', v_label, p_mime, p_size_bytes, p_sha256,
    p_manual_expires_on, p_object_path, v_revision
  );

  perform private.notify_payment_qr_debtors(v_uid, v_revision, 'replaced');

  return jsonb_build_object('replaced', true, 'previous_path', v_previous);
end;
$$;

create or replace function public.delete_payment_qr()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_existing public.payment_qrs%rowtype;
begin
  if v_uid is null then
    raise exception 'Debes iniciar sesión.' using errcode = 'P0001';
  end if;

  select * into v_existing
  from public.payment_qrs
  where user_id = v_uid;

  if not found then
    raise exception 'No hay un QR para eliminar.' using errcode = 'P0001';
  end if;

  insert into public.payment_qr_events (
    user_id, kind, label, mime, size_bytes, sha256, manual_expires_on, object_path, revision
  ) values (
    v_uid,
    'deleted',
    v_existing.label,
    v_existing.mime,
    v_existing.size_bytes,
    v_existing.sha256,
    v_existing.manual_expires_on,
    v_existing.object_path,
    v_existing.revision
  );

  perform private.notify_payment_qr_debtors(v_uid, v_existing.revision, 'deleted');

  delete from public.payment_qrs where user_id = v_uid;

  return v_existing.object_path;
end;
$$;

create or replace function public.acknowledge_payment_qr_notice(p_owner uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Debes iniciar sesión.' using errcode = 'P0001';
  end if;

  update public.payment_qr_notices
  set seen_at = pg_catalog.now()
  where owner_id = p_owner
    and viewer_id = v_uid
    and seen_at is null;
end;
$$;

create or replace function public.list_orphan_payment_qr_objects()
returns text[]
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (
      select array_agg(object.name)
      from (
        select storage_object.name
        from storage.objects as storage_object
        where storage_object.bucket_id = 'payment-qr'
          and storage_object.created_at < pg_catalog.now() - interval '24 hours'
          and not exists (
            select 1
            from public.payment_qrs as qr
            where qr.object_path = storage_object.name
          )
        order by storage_object.created_at
        limit 50
      ) as object
    ),
    '{}'::text[]
  );
$$;

revoke all on function public.can_see_payment_qr(uuid) from public;
revoke all on function public.payment_qr_object_visible(text) from public;
revoke all on function public.save_payment_qr(text, text, text, integer, text, date, text, boolean) from public;
revoke all on function public.delete_payment_qr() from public;
revoke all on function public.acknowledge_payment_qr_notice(uuid) from public;
revoke all on function public.list_orphan_payment_qr_objects() from public;

grant execute on function public.can_see_payment_qr(uuid) to authenticated;
grant execute on function public.payment_qr_object_visible(text) to authenticated;
grant execute on function public.save_payment_qr(text, text, text, integer, text, date, text, boolean) to authenticated;
grant execute on function public.delete_payment_qr() to authenticated;
grant execute on function public.acknowledge_payment_qr_notice(uuid) to authenticated;
grant execute on function public.list_orphan_payment_qr_objects() to service_role;

revoke all on function private.has_open_debt_toward(uuid, uuid) from public, anon, authenticated;
revoke all on function private.enqueue_payment_qr_purge() from public, anon, authenticated;
revoke all on function private.notify_payment_qr_debtors(uuid, integer, text) from public, anon, authenticated;
revoke all on function private.assert_payment_qr_expiry(date) from public, anon, authenticated;
revoke all on function private.normalize_payment_qr_label(text) from public, anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'payment-qr',
  'payment-qr',
  false,
  2097152,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "Owner and open debtors read payment qr objects"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'payment-qr'
    and public.payment_qr_object_visible(name)
  );

create policy "Owner uploads payment qr objects"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'payment-qr'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(png|jpg|webp)$'
  );

create policy "Owner deletes payment qr objects"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'payment-qr'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

notify pgrst, 'reload schema';
