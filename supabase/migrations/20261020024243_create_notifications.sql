create schema if not exists private;

-- Categorías y tipos de notificación.
-- budget_alerts y marketing se agregan después (KIBO-103 y la feature de presupuestos).
create type public.notification_category as enum (
  'shared_expenses',
  'payments',
  'releases',
  'marketing'
);

create type public.notification_type as enum (
  'shared_expense.created',
  'shared_expense.updated',
  'shared_expense.voided',
  'settlement.requested',
  'settlement.confirmed',
  'settlement.rejected',
  'release.published',
  'marketing.campaign'
);

-- Estado de la entrega push de una notificación.
-- sending / sent / failed los produce la Edge Function send-push (KIBO-100).
create type public.push_status as enum (
  'skipped',
  'pending',
  'sending',
  'sent',
  'failed'
);

create type public.push_platform as enum ('android', 'ios', 'desktop', 'unknown');

-- Fuente de verdad de las notificaciones. El push es solo un canal de entrega.
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete set null,
  type public.notification_type not null,
  category public.notification_category not null,
  title text not null,
  body text not null,
  url text not null,
  data jsonb not null default '{}'::jsonb,
  tag text not null,
  dedupe_key text not null,
  read_at timestamptz,
  push_status public.push_status not null default 'skipped',
  push_next_attempt_at timestamptz,
  created_at timestamptz not null default now(),
  constraint notifications_url_relative check (url ~ '^/[^/]'),
  constraint notifications_title_length check (char_length(title) between 1 and 80),
  constraint notifications_body_length check (char_length(body) between 1 and 240),
  constraint notifications_tag_length check (char_length(tag) between 1 and 200),
  constraint notifications_dedupe_key_length check (char_length(dedupe_key) between 1 and 200),
  constraint notifications_data_object check (jsonb_typeof(data) = 'object')
);

create unique index notifications_user_dedupe_key
  on public.notifications (user_id, dedupe_key);

create index notifications_user_created_idx
  on public.notifications (user_id, created_at desc, id desc);

create index notifications_user_unread_idx
  on public.notifications (user_id)
  where read_at is null;

-- Una fila por dispositivo suscrito.
create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  platform public.push_platform not null default 'unknown',
  user_agent text,
  vapid_key_id text not null default 'v1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_used_at timestamptz,
  last_seen_at timestamptz not null default now(),
  failure_count smallint not null default 0,
  constraint push_subscriptions_endpoint_https check (endpoint ~ '^https://'),
  constraint push_subscriptions_ua_length check (
    user_agent is null or char_length(user_agent) <= 512
  )
);

create unique index push_subscriptions_endpoint_key
  on public.push_subscriptions (endpoint);

create index push_subscriptions_user_id_idx
  on public.push_subscriptions (user_id);

-- Preferencias de notificación: una fila por usuario.
-- Las columnas controlan el push; la notificación in-app de las categorías
-- transaccionales siempre se crea. Marketing es opt-in y nace en false.
create table public.notification_preferences (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  shared_expenses boolean not null default true,
  payments boolean not null default true,
  budget_alerts boolean not null default true,
  releases boolean not null default true,
  marketing boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.notifications enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.notification_preferences enable row level security;

create policy "Users can read own notifications"
  on public.notifications for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can read own push subscriptions"
  on public.push_subscriptions for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can delete own push subscriptions"
  on public.push_subscriptions for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can read own notification preferences"
  on public.notification_preferences for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can update own notification preferences"
  on public.notification_preferences for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Fila de preferencias al crear el perfil y backfill de los existentes.
create or replace function private.handle_new_profile_notification_preferences()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.notification_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create trigger on_profile_created_notification_preferences
  after insert on public.profiles
  for each row execute function private.handle_new_profile_notification_preferences();

insert into public.notification_preferences (user_id)
select id from public.profiles
on conflict (user_id) do nothing;

-- Escritor único de notificaciones. Se llama desde la RPC de negocio en la
-- misma transacción que el evento, nunca desde un trigger genérico.
create or replace function private.enqueue_notification(
  p_user_id uuid,
  p_actor_id uuid,
  p_type public.notification_type,
  p_category public.notification_category,
  p_title text,
  p_body text,
  p_url text,
  p_data jsonb,
  p_tag text,
  p_dedupe_key text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_prefs public.notification_preferences;
  v_push boolean;
  v_id uuid;
begin
  -- Nunca se auto-notifica al actor.
  if p_user_id is null or p_user_id = p_actor_id then
    return null;
  end if;

  select * into v_prefs
  from public.notification_preferences
  where user_id = p_user_id;

  v_push := case p_category
    when 'shared_expenses' then coalesce(v_prefs.shared_expenses, true)
    when 'payments' then coalesce(v_prefs.payments, true)
    when 'releases' then coalesce(v_prefs.releases, true)
    when 'marketing' then coalesce(v_prefs.marketing, false)
  end;

  -- Marketing sin opt-in no crea ni la fila ni el push.
  if p_category = 'marketing' and not v_push then
    return null;
  end if;

  insert into public.notifications (
    user_id,
    actor_id,
    type,
    category,
    title,
    body,
    url,
    data,
    tag,
    dedupe_key,
    push_status,
    push_next_attempt_at
  )
  values (
    p_user_id,
    p_actor_id,
    p_type,
    p_category,
    p_title,
    p_body,
    p_url,
    coalesce(p_data, '{}'::jsonb),
    p_tag,
    p_dedupe_key,
    case
      when v_push and exists (
        select 1 from public.push_subscriptions where user_id = p_user_id
      ) then 'pending'::public.push_status
      else 'skipped'::public.push_status
    end,
    case when v_push then now() end
  )
  on conflict (user_id, dedupe_key) do nothing
  returning id into v_id;

  -- null si la notificación ya existía.
  return v_id;
end;
$$;

create or replace function public.mark_notifications_read(p_ids uuid[])
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_count integer;
begin
  if v_uid is null then
    raise exception 'Debes iniciar sesión.' using errcode = 'P0001';
  end if;

  if p_ids is null or cardinality(p_ids) = 0 then
    return 0;
  end if;

  update public.notifications
  set read_at = now()
  where id = any(p_ids)
    and user_id = v_uid
    and read_at is null;

  get diagnostics v_count = row_count;

  return v_count;
end;
$$;

create or replace function public.mark_all_notifications_read()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_count integer;
begin
  if v_uid is null then
    raise exception 'Debes iniciar sesión.' using errcode = 'P0001';
  end if;

  update public.notifications
  set read_at = now()
  where user_id = v_uid
    and read_at is null;

  get diagnostics v_count = row_count;

  return v_count;
end;
$$;

create or replace function public.update_notification_preferences(
  p_shared_expenses boolean,
  p_payments boolean,
  p_releases boolean
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_row public.notification_preferences;
begin
  if v_uid is null then
    raise exception 'Debes iniciar sesión.' using errcode = 'P0001';
  end if;

  if p_shared_expenses is null or p_payments is null or p_releases is null then
    raise exception 'Revisa tus preferencias de notificación.' using errcode = 'P0001';
  end if;

  insert into public.notification_preferences (
    user_id,
    shared_expenses,
    payments,
    releases,
    updated_at
  )
  values (
    v_uid,
    p_shared_expenses,
    p_payments,
    p_releases,
    now()
  )
  on conflict (user_id) do update
    set shared_expenses = excluded.shared_expenses,
        payments = excluded.payments,
        releases = excluded.releases,
        updated_at = now()
  returning * into v_row;

  return to_jsonb(v_row);
end;
$$;

revoke all on function public.mark_notifications_read(uuid[]) from public;
revoke all on function public.mark_all_notifications_read() from public;
revoke all on function public.update_notification_preferences(boolean, boolean, boolean) from public;

grant execute on function public.mark_notifications_read(uuid[]) to authenticated;
grant execute on function public.mark_all_notifications_read() to authenticated;
grant execute on function public.update_notification_preferences(boolean, boolean, boolean) to authenticated;

revoke all on all functions in schema private from public, anon, authenticated;

notify pgrst, 'reload schema';

revoke insert, update, delete, truncate on public.notifications from anon, authenticated;
revoke insert, update, truncate on public.push_subscriptions from anon, authenticated;
revoke insert, delete, truncate on public.notification_preferences from anon, authenticated;
revoke update on public.notification_preferences from anon, authenticated;
