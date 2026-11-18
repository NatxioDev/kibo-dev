-- Web Push (KIBO-98): alta y baja de subscriptions por dispositivo.
-- `push_subscriptions` ya existe; el cliente no puede insertar/actualizar
-- directo, así que todo pasa por estas RPC.

create or replace function public.upsert_push_subscription(
  p_endpoint text,
  p_p256dh text,
  p_auth text,
  p_platform public.push_platform default 'unknown',
  p_user_agent text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_id uuid;
begin
  if v_uid is null then
    raise exception 'Debes iniciar sesión.' using errcode = 'P0001';
  end if;

  if p_endpoint is null
    or p_endpoint !~ '^https://'
    or char_length(p_endpoint) > 2048
    or coalesce(p_p256dh, '') = ''
    or coalesce(p_auth, '') = ''
  then
    raise exception 'La suscripción no es válida.' using errcode = 'P0001';
  end if;

  -- Reasignar el endpoint cubre "mismo navegador, otra cuenta" y corta los
  -- pushes de la cuenta anterior.
  insert into public.push_subscriptions (
    user_id,
    endpoint,
    p256dh,
    auth,
    platform,
    user_agent
  )
  values (
    v_uid,
    p_endpoint,
    p_p256dh,
    p_auth,
    p_platform,
    left(p_user_agent, 512)
  )
  on conflict (endpoint) do update
    set user_id = excluded.user_id,
        p256dh = excluded.p256dh,
        auth = excluded.auth,
        platform = excluded.platform,
        user_agent = excluded.user_agent,
        updated_at = now(),
        last_seen_at = now(),
        failure_count = 0
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.delete_push_subscription(p_endpoint text)
returns boolean
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

  delete from public.push_subscriptions
  where endpoint = p_endpoint and user_id = v_uid;

  return found;
end;
$$;

revoke all on function public.upsert_push_subscription(
  text, text, text, public.push_platform, text
) from public, anon, authenticated;
revoke all on function public.delete_push_subscription(text)
  from public, anon, authenticated;

grant execute on function public.upsert_push_subscription(
  text, text, text, public.push_platform, text
) to authenticated;
grant execute on function public.delete_push_subscription(text) to authenticated;

-- La baja también pasa por RPC: sin DELETE directo se cierra la única
-- escritura que quedaba abierta en la tabla.
revoke delete on public.push_subscriptions from anon, authenticated;

notify pgrst, 'reload schema';
