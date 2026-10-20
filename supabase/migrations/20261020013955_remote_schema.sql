SET local check_function_bodies = off;

CREATE OR REPLACE FUNCTION private.add_payment_entry (
  p_debtor        uuid,
  p_creditor      uuid,
  p_amount        numeric,
  p_currency      text,
  p_settlement_id uuid,
  p_actor         uuid
)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
begin
  insert into public.debt_entries (debtor_id, creditor_id, amount, currency, kind, settlement_id, created_by)
  values (p_creditor, p_debtor, round(p_amount, 2), p_currency, 'payment', p_settlement_id, p_actor);
end;
$function$;

CREATE OR REPLACE FUNCTION private.assert_settlement_amount (
  p_debtor   uuid,
  p_creditor uuid,
  p_amount   numeric,
  p_currency text
)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
declare
  v_settleable numeric;
begin
  if p_currency not in ('BOB', 'USD') then
    raise exception 'Selecciona una moneda.' using errcode = 'P0001';
  end if;
  if p_debtor = p_creditor then
    raise exception 'No puedes saldar una deuda contigo.' using errcode = 'P0001';
  end if;
  if private.money_cents(p_amount) <= 0 then
    raise exception 'El monto del pago tiene que ser mayor que 0.' using errcode = 'P0001';
  end if;
  v_settleable := private.settleable_payment(p_debtor, p_creditor, p_currency);
  if private.money_cents(p_amount) > private.money_cents(v_settleable) then
    raise exception 'Ese monto supera lo que se puede saldar. Si hay una parte en revisión, no entra en el pago.' using errcode = 'P0001';
  end if;
end;
$function$;

CREATE OR REPLACE FUNCTION public.classify_share (
  p_share_id    uuid,
  p_category_id uuid
)
  RETURNS uuid
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
declare
  v_uid uuid := auth.uid();
  v_share public.shared_expense_shares;
  v_expense public.shared_expenses;
  v_tx_id uuid;
begin
  if v_uid is null then
    raise exception 'Debes iniciar sesión.' using errcode = 'P0001';
  end if;
  if p_category_id is null then
    raise exception 'Elige una de tus categorías.' using errcode = 'P0001';
  end if;
  select * into v_share from public.shared_expense_shares where id = p_share_id for update;
  if v_share.id is null or v_share.user_id <> v_uid then
    raise exception 'No encontramos esa parte del gasto.' using errcode = 'P0001';
  end if;
  if v_share.status not in ('pending', 'disputed') then
    raise exception 'Esa parte ya está clasificada.' using errcode = 'P0001';
  end if;
  select * into v_expense from public.shared_expenses where id = v_share.shared_expense_id;
  if v_expense.status <> 'active' then
    raise exception 'Ese gasto compartido ya no está activo.' using errcode = 'P0001';
  end if;
  perform 1 from public.categories where id = p_category_id and user_id = v_uid and type = 'EXPENSE' and is_active = true;
  if not found then
    raise exception 'Elige una categoría tuya de gastos.' using errcode = 'P0001';
  end if;
  insert into public.transactions (user_id, category_id, payment_method_id, type, amount, currency, date, merchant, description, source, status)
  values (v_uid, p_category_id, null, 'EXPENSE', v_share.amount, v_expense.currency, v_expense.date, v_expense.merchant, v_expense.description, 'MANUAL', 'CONFIRMED')
  returning id into v_tx_id;
  update public.shared_expense_shares set status = 'classified', transaction_id = v_tx_id, updated_at = now() where id = p_share_id;
  return v_tx_id;
end;
$function$;

CREATE OR REPLACE FUNCTION public.confirm_settlement (
  p_settlement_id uuid
)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
declare
  v_uid uuid := auth.uid();
  v_row public.settlements;
  v_room numeric;
begin
  if v_uid is null then
    raise exception 'Debes iniciar sesión.' using errcode = 'P0001';
  end if;
  select * into v_row from public.settlements where id = p_settlement_id for update;
  if v_row.id is null or v_row.creditor_id <> v_uid or v_row.status <> 'pending' then
    raise exception 'No hay un pago pendiente para confirmar.' using errcode = 'P0001';
  end if;
  v_room := private.net_debtor_owes(v_row.debtor_id, v_row.creditor_id, v_row.currency)
    - private.disputed_debt(v_row.debtor_id, v_row.creditor_id, v_row.currency)
    - (private.pending_settlement_total(v_row.debtor_id, v_row.creditor_id, v_row.currency) - v_row.amount);
  if private.money_cents(v_row.amount) > private.money_cents(v_room) then
    raise exception 'Ese pago ya no coincide con el saldo. Recházalo y pide uno nuevo.' using errcode = 'P0001';
  end if;
  update public.settlements set status = 'confirmed', confirmed_at = now() where id = p_settlement_id;
  perform private.add_payment_entry(v_row.debtor_id, v_row.creditor_id, v_row.amount, v_row.currency, p_settlement_id, v_uid);
end;
$function$;

CREATE OR REPLACE FUNCTION public.create_shared_expense (
  p_total             numeric,
  p_currency          text,
  p_date              date,
  p_merchant          text,
  p_description       text,
  p_payer_consumes    boolean,
  p_payer_amount      numeric,
  p_category_id       uuid,
  p_payment_method_id uuid,
  p_participants      jsonb
)
  RETURNS jsonb
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
declare
  v_uid uuid := auth.uid();
  v_norm jsonb;
  v_expense_id uuid;
  v_tx_id uuid;
  v_merchant text := nullif(btrim(p_merchant), '');
  v_description text := nullif(btrim(p_description), '');
begin
  if v_merchant is not null and char_length(v_merchant) > 80 then
    raise exception 'El comercio admite como máximo 80 caracteres.' using errcode = 'P0001';
  end if;
  if v_description is not null and char_length(v_description) > 280 then
    raise exception 'La nota admite como máximo 280 caracteres.' using errcode = 'P0001';
  end if;
  if p_date is null then
    raise exception 'La fecha es obligatoria.' using errcode = 'P0001';
  end if;
  v_norm := private.normalize_split(v_uid, p_total, p_currency, p_payer_consumes, p_payer_amount, p_category_id, p_payment_method_id, p_participants);
  insert into public.shared_expenses (payer_id, total_amount, currency, date, merchant, description)
  values (v_uid, round(p_total, 2), p_currency, p_date, v_merchant, v_description)
  returning id into v_expense_id;
  v_tx_id := private.insert_split_parts(v_expense_id, v_uid, p_currency, p_date, v_merchant, v_description, p_payer_consumes, (v_norm->>'payer_amount')::numeric, p_category_id, p_payment_method_id, v_norm->>'category_name', v_norm->'participants');
  return jsonb_build_object('expense_id', v_expense_id, 'transaction_id', v_tx_id);
end;
$function$;

CREATE OR REPLACE FUNCTION public.dispute_share (
  p_share_id uuid
)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
declare
  v_uid uuid := auth.uid();
  v_share public.shared_expense_shares;
begin
  if v_uid is null then
    raise exception 'Debes iniciar sesión.' using errcode = 'P0001';
  end if;
  select * into v_share from public.shared_expense_shares where id = p_share_id for update;
  if v_share.id is null or v_share.user_id <> v_uid or v_share.status <> 'pending' then
    raise exception 'Solo puedes marcar como no reconocido un gasto pendiente.' using errcode = 'P0001';
  end if;
  perform 1 from public.shared_expenses where id = v_share.shared_expense_id and status = 'active';
  if not found then
    raise exception 'Ese gasto compartido ya no está activo.' using errcode = 'P0001';
  end if;
  update public.shared_expense_shares set status = 'disputed', updated_at = now() where id = p_share_id;
end;
$function$;

CREATE OR REPLACE FUNCTION public.record_received_payment (
  p_debtor_id uuid,
  p_amount    numeric,
  p_currency  text
)
  RETURNS uuid
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
declare
  v_uid uuid := auth.uid();
  v_id uuid;
begin
  if v_uid is null then
    raise exception 'Debes iniciar sesión.' using errcode = 'P0001';
  end if;
  perform private.assert_settlement_amount(p_debtor_id, v_uid, p_amount, p_currency);
  insert into public.settlements (debtor_id, creditor_id, amount, currency, status, initiated_by, confirmed_at)
  values (p_debtor_id, v_uid, round(p_amount, 2), p_currency, 'confirmed', 'creditor', now())
  returning id into v_id;
  perform private.add_payment_entry(p_debtor_id, v_uid, p_amount, p_currency, v_id, v_uid);
  return v_id;
end;
$function$;

CREATE OR REPLACE FUNCTION public.reject_settlement (
  p_settlement_id uuid
)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Debes iniciar sesión.' using errcode = 'P0001';
  end if;
  update public.settlements set status = 'rejected' where id = p_settlement_id and creditor_id = v_uid and status = 'pending';
  if not found then
    raise exception 'No hay un pago pendiente para rechazar.' using errcode = 'P0001';
  end if;
end;
$function$;

CREATE OR REPLACE FUNCTION public.replace_shared_expense (
  p_expense_id        uuid,
  p_total             numeric,
  p_currency          text,
  p_date              date,
  p_merchant          text,
  p_description       text,
  p_payer_consumes    boolean,
  p_payer_amount      numeric,
  p_category_id       uuid,
  p_payment_method_id uuid,
  p_participants      jsonb
)
  RETURNS jsonb
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
declare
  v_uid uuid := auth.uid();
  v_expense public.shared_expenses;
  v_norm jsonb;
  v_parties uuid[];
  v_tx_id uuid;
  v_merchant text := nullif(btrim(p_merchant), '');
  v_description text := nullif(btrim(p_description), '');
begin
  if v_uid is null then
    raise exception 'Debes iniciar sesión.' using errcode = 'P0001';
  end if;
  if v_merchant is not null and char_length(v_merchant) > 80 then
    raise exception 'El comercio admite como máximo 80 caracteres.' using errcode = 'P0001';
  end if;
  if v_description is not null and char_length(v_description) > 280 then
    raise exception 'La nota admite como máximo 280 caracteres.' using errcode = 'P0001';
  end if;
  if p_date is null then
    raise exception 'La fecha es obligatoria.' using errcode = 'P0001';
  end if;
  select * into v_expense from public.shared_expenses where id = p_expense_id for update;
  if v_expense.id is null or v_expense.status <> 'active' then
    raise exception 'Ese gasto compartido ya no está activo.' using errcode = 'P0001';
  end if;
  if v_expense.payer_id <> v_uid then
    raise exception 'Solo quien pagó puede cambiar este gasto.' using errcode = 'P0001';
  end if;
  v_norm := private.normalize_split(v_uid, p_total, p_currency, p_payer_consumes, p_payer_amount, p_category_id, p_payment_method_id, p_participants);
  select coalesce(array_agg(user_id), '{}') into v_parties
  from public.shared_expense_shares
  where shared_expense_id = p_expense_id and status <> 'voided' and user_id <> v_uid;
  v_parties := v_parties || coalesce((select array_agg(value::uuid) from jsonb_array_elements_text(v_norm->'party_ids') as value), '{}');
  if private.split_amount_locked(p_expense_id, v_parties) then
    raise exception 'Ya hay un pago confirmado con esta persona. No puedes cambiar el monto.' using errcode = 'P0001';
  end if;
  perform private.void_split_parts(p_expense_id, v_uid);
  update public.shared_expenses
  set total_amount = round(p_total, 2), currency = p_currency, date = p_date, merchant = v_merchant, description = v_description, updated_at = now()
  where id = p_expense_id;
  v_tx_id := private.insert_split_parts(p_expense_id, v_uid, p_currency, p_date, v_merchant, v_description, p_payer_consumes, (v_norm->>'payer_amount')::numeric, p_category_id, p_payment_method_id, v_norm->>'category_name', v_norm->'participants');
  return jsonb_build_object('expense_id', p_expense_id, 'transaction_id', v_tx_id);
end;
$function$;

CREATE OR REPLACE FUNCTION public.request_settlement (
  p_creditor_id uuid,
  p_amount      numeric,
  p_currency    text
)
  RETURNS uuid
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
declare
  v_uid uuid := auth.uid();
  v_id uuid;
begin
  if v_uid is null then
    raise exception 'Debes iniciar sesión.' using errcode = 'P0001';
  end if;
  perform private.assert_settlement_amount(v_uid, p_creditor_id, p_amount, p_currency);
  insert into public.settlements (debtor_id, creditor_id, amount, currency, status, initiated_by)
  values (v_uid, p_creditor_id, round(p_amount, 2), p_currency, 'pending', 'debtor')
  returning id into v_id;
  return v_id;
end;
$function$;

CREATE OR REPLACE FUNCTION public.update_shared_expense_details (
  p_expense_id        uuid,
  p_date              date,
  p_merchant          text,
  p_description       text,
  p_category_id       uuid,
  p_payment_method_id uuid
)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
declare
  v_uid uuid := auth.uid();
  v_expense public.shared_expenses;
  v_category_name text;
  v_tx_id uuid;
  v_merchant text := nullif(btrim(p_merchant), '');
  v_description text := nullif(btrim(p_description), '');
begin
  if v_uid is null then
    raise exception 'Debes iniciar sesión.' using errcode = 'P0001';
  end if;
  if p_date is null then
    raise exception 'La fecha es obligatoria.' using errcode = 'P0001';
  end if;
  if v_merchant is not null and char_length(v_merchant) > 80 then
    raise exception 'El comercio admite como máximo 80 caracteres.' using errcode = 'P0001';
  end if;
  if v_description is not null and char_length(v_description) > 280 then
    raise exception 'La nota admite como máximo 280 caracteres.' using errcode = 'P0001';
  end if;
  select * into v_expense from public.shared_expenses where id = p_expense_id for update;
  if v_expense.id is null or v_expense.status <> 'active' then
    raise exception 'Ese gasto compartido ya no está activo.' using errcode = 'P0001';
  end if;
  if v_expense.payer_id <> v_uid then
    raise exception 'Solo quien pagó puede cambiar este gasto.' using errcode = 'P0001';
  end if;
  if p_category_id is not null then
    select name into v_category_name from public.categories where id = p_category_id and user_id = v_uid and type = 'EXPENSE';
    if v_category_name is null then
      raise exception 'Elige una categoría tuya de gastos.' using errcode = 'P0001';
    end if;
  end if;
  if p_payment_method_id is not null then
    perform 1 from public.payment_methods where id = p_payment_method_id and user_id = v_uid;
    if not found then
      raise exception 'El método de pago no es válido.' using errcode = 'P0001';
    end if;
  end if;
  update public.shared_expenses set date = p_date, merchant = v_merchant, description = v_description, updated_at = now() where id = p_expense_id;
  select transaction_id into v_tx_id from public.shared_expense_shares where shared_expense_id = p_expense_id and user_id = v_uid and status = 'classified';
  if v_tx_id is not null then
    update public.transactions set category_id = p_category_id, payment_method_id = p_payment_method_id, date = p_date, merchant = v_merchant, description = v_description, updated_at = now() where id = v_tx_id and user_id = v_uid;
  end if;
  update public.shared_expense_shares set category_name_snapshot = v_category_name, updated_at = now() where shared_expense_id = p_expense_id and user_id = v_uid and status = 'classified';
  update public.shared_expense_shares set category_name_snapshot = v_category_name, updated_at = now() where shared_expense_id = p_expense_id and status = 'pending';
end;
$function$;

CREATE OR REPLACE FUNCTION public.void_shared_expense (
  p_expense_id uuid
)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
declare
  v_uid uuid := auth.uid();
  v_expense public.shared_expenses;
  v_parties uuid[];
begin
  if v_uid is null then
    raise exception 'Debes iniciar sesión.' using errcode = 'P0001';
  end if;
  select * into v_expense from public.shared_expenses where id = p_expense_id for update;
  if v_expense.id is null or v_expense.status <> 'active' then
    raise exception 'Ese gasto compartido ya no está activo.' using errcode = 'P0001';
  end if;
  if v_expense.payer_id <> v_uid then
    raise exception 'Solo quien pagó puede eliminar este gasto.' using errcode = 'P0001';
  end if;
  select coalesce(array_agg(user_id), '{}') into v_parties from public.shared_expense_shares where shared_expense_id = p_expense_id and status <> 'voided' and user_id <> v_uid;
  if private.split_amount_locked(p_expense_id, v_parties) then
    raise exception 'Ya hay un pago confirmado con esta persona. No puedes eliminar el gasto.' using errcode = 'P0001';
  end if;
  perform private.void_split_parts(p_expense_id, v_uid);
  update public.shared_expenses set status = 'voided', updated_at = now() where id = p_expense_id;
end;
$function$;

CREATE OR REPLACE FUNCTION public.withdraw_share_dispute (
  p_share_id uuid
)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Debes iniciar sesión.' using errcode = 'P0001';
  end if;
  update public.shared_expense_shares set status = 'pending', updated_at = now() where id = p_share_id and user_id = v_uid and status = 'disputed';
  if not found then
    raise exception 'Esa parte no está en revisión.' using errcode = 'P0001';
  end if;
end;
$function$;

