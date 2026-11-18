-- Notificaciones de pagos entre amigos (KIBO-111).
-- Sin montos en el push: el detalle se ve dentro de la app.
-- Devuelven los ids de las notificaciones creadas para que el servidor las entregue.

create or replace function private.notification_actor_name(p_uid uuid)
returns text
language sql
security definer
set search_path = ''
stable
as $$
  select coalesce(nullif(btrim(profile.display_name), ''), profile.username, 'Alguien')
  from public.profiles as profile
  where profile.id = p_uid;
$$;

-- Cambian el tipo de retorno: hay que recrearlas, no alcanza con create or replace.
drop function if exists public.request_settlement(uuid, numeric, text);
drop function if exists public.confirm_settlement(uuid);
drop function if exists public.reject_settlement(uuid);
drop function if exists public.record_received_payment(uuid, numeric, text);

create or replace function public.request_settlement(
  p_creditor_id uuid,
  p_amount numeric,
  p_currency text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_id uuid;
  v_notification_ids uuid[] := '{}';
  v_notification uuid;
begin
  if v_uid is null then
    raise exception 'Debes iniciar sesión.' using errcode = 'P0001';
  end if;

  perform private.assert_settlement_amount(v_uid, p_creditor_id, p_amount, p_currency);

  insert into public.settlements (
    debtor_id,
    creditor_id,
    amount,
    currency,
    status,
    initiated_by
  ) values (
    v_uid,
    p_creditor_id,
    round(p_amount, 2),
    p_currency,
    'pending',
    'debtor'
  )
  returning id into v_id;

  v_notification := private.enqueue_notification(
    p_creditor_id,
    v_uid,
    'settlement.requested',
    'payments',
    'Te pagaron',
    private.notification_actor_name(v_uid) || ' dice que te pagó.',
    '/friends/' || v_uid::text,
    jsonb_build_object('settlementId', v_id),
    'settlement-' || v_id::text,
    'settlement.requested:' || v_id::text
  );

  if v_notification is not null then
    v_notification_ids := array_append(v_notification_ids, v_notification);
  end if;

  return jsonb_build_object(
    'settlement_id', v_id,
    'notification_ids', to_jsonb(v_notification_ids)
  );
end;
$$;

create or replace function public.confirm_settlement(p_settlement_id uuid)
returns uuid[]
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_row public.settlements;
  v_room numeric;
  v_notification_ids uuid[] := '{}';
  v_notification uuid;
begin
  if v_uid is null then
    raise exception 'Debes iniciar sesión.' using errcode = 'P0001';
  end if;

  select * into v_row
  from public.settlements
  where id = p_settlement_id
  for update;

  if v_row.id is null or v_row.creditor_id <> v_uid or v_row.status <> 'pending' then
    raise exception 'No hay un pago pendiente para confirmar.' using errcode = 'P0001';
  end if;

  v_room := private.net_debtor_owes(v_row.debtor_id, v_row.creditor_id, v_row.currency)
    - private.disputed_debt(v_row.debtor_id, v_row.creditor_id, v_row.currency)
    - (
      private.pending_settlement_total(v_row.debtor_id, v_row.creditor_id, v_row.currency)
      - v_row.amount
    );

  if private.money_cents(v_row.amount) > private.money_cents(v_room) then
    raise exception 'Ese pago ya no coincide con el saldo. Recházalo y pide uno nuevo.' using errcode = 'P0001';
  end if;

  update public.settlements
  set status = 'confirmed',
      confirmed_at = now()
  where id = p_settlement_id;

  perform private.add_payment_entry(
    v_row.debtor_id,
    v_row.creditor_id,
    v_row.amount,
    v_row.currency,
    p_settlement_id,
    v_uid
  );

  v_notification := private.enqueue_notification(
    v_row.debtor_id,
    v_uid,
    'settlement.confirmed',
    'payments',
    'Pago confirmado',
    private.notification_actor_name(v_uid) || ' confirmó tu pago.',
    '/friends/' || v_uid::text,
    jsonb_build_object('settlementId', p_settlement_id),
    'settlement-' || p_settlement_id::text,
    'settlement.confirmed:' || p_settlement_id::text
  );

  if v_notification is not null then
    v_notification_ids := array_append(v_notification_ids, v_notification);
  end if;

  return v_notification_ids;
end;
$$;

create or replace function public.reject_settlement(p_settlement_id uuid)
returns uuid[]
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_debtor_id uuid;
  v_notification_ids uuid[] := '{}';
  v_notification uuid;
begin
  if v_uid is null then
    raise exception 'Debes iniciar sesión.' using errcode = 'P0001';
  end if;

  update public.settlements
  set status = 'rejected'
  where id = p_settlement_id
    and creditor_id = v_uid
    and status = 'pending'
  returning debtor_id into v_debtor_id;

  if v_debtor_id is null then
    raise exception 'No hay un pago pendiente para rechazar.' using errcode = 'P0001';
  end if;

  v_notification := private.enqueue_notification(
    v_debtor_id,
    v_uid,
    'settlement.rejected',
    'payments',
    'Pago rechazado',
    private.notification_actor_name(v_uid) || ' rechazó tu pago.',
    '/friends/' || v_uid::text,
    jsonb_build_object('settlementId', p_settlement_id),
    'settlement-' || p_settlement_id::text,
    'settlement.rejected:' || p_settlement_id::text
  );

  if v_notification is not null then
    v_notification_ids := array_append(v_notification_ids, v_notification);
  end if;

  return v_notification_ids;
end;
$$;

create or replace function public.record_received_payment(
  p_debtor_id uuid,
  p_amount numeric,
  p_currency text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_id uuid;
  v_notification_ids uuid[] := '{}';
  v_notification uuid;
begin
  if v_uid is null then
    raise exception 'Debes iniciar sesión.' using errcode = 'P0001';
  end if;

  perform private.assert_settlement_amount(p_debtor_id, v_uid, p_amount, p_currency);

  insert into public.settlements (
    debtor_id,
    creditor_id,
    amount,
    currency,
    status,
    initiated_by,
    confirmed_at
  ) values (
    p_debtor_id,
    v_uid,
    round(p_amount, 2),
    p_currency,
    'confirmed',
    'creditor',
    now()
  )
  returning id into v_id;

  perform private.add_payment_entry(p_debtor_id, v_uid, p_amount, p_currency, v_id, v_uid);

  v_notification := private.enqueue_notification(
    p_debtor_id,
    v_uid,
    'settlement.confirmed',
    'payments',
    'Pago registrado',
    private.notification_actor_name(v_uid) || ' registró tu pago.',
    '/friends/' || v_uid::text,
    jsonb_build_object('settlementId', v_id),
    'settlement-' || v_id::text,
    'settlement.received:' || v_id::text
  );

  if v_notification is not null then
    v_notification_ids := array_append(v_notification_ids, v_notification);
  end if;

  return jsonb_build_object(
    'settlement_id', v_id,
    'notification_ids', to_jsonb(v_notification_ids)
  );
end;
$$;

revoke all on function private.notification_actor_name(uuid) from public, anon, authenticated;

revoke all on function public.request_settlement(uuid, numeric, text) from public;
revoke all on function public.confirm_settlement(uuid) from public;
revoke all on function public.reject_settlement(uuid) from public;
revoke all on function public.record_received_payment(uuid, numeric, text) from public;

grant execute on function public.request_settlement(uuid, numeric, text) to authenticated;
grant execute on function public.confirm_settlement(uuid) to authenticated;
grant execute on function public.reject_settlement(uuid) to authenticated;
grant execute on function public.record_received_payment(uuid, numeric, text) to authenticated;

notify pgrst, 'reload schema';
