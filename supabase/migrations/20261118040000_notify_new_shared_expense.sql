-- Notifica a cada deudor cuando se crea un gasto compartido (KIBO-101).
-- Sin monto en el texto ni en `data`: el push solo avisa que hay un cobro nuevo.

create or replace function private.notify_new_shared_expense(
  p_expense_id uuid,
  p_payer_id uuid
)
returns uuid[]
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_payer_name text;
  v_ids uuid[] := '{}';
  v_share record;
  v_id uuid;
begin
  select coalesce(nullif(btrim(profile.display_name), ''), profile.username)
  into v_payer_name
  from public.profiles as profile
  where profile.id = p_payer_id;

  -- Solo deudores reales: ni el que crea el gasto ni shares en cero.
  for v_share in
    select share.id, share.user_id
    from public.shared_expense_shares as share
    where share.shared_expense_id = p_expense_id
      and share.user_id <> p_payer_id
      and share.amount > 0
      and share.status <> 'voided'
  loop
    v_id := private.enqueue_notification(
      v_share.user_id,
      p_payer_id,
      'shared_expense.created',
      'shared_expenses',
      'Nuevo cobro',
      coalesce(v_payer_name, 'Alguien') || ' te creó un cobro.',
      '/friends/' || p_payer_id::text,
      jsonb_build_object('expenseId', p_expense_id, 'shareId', v_share.id),
      'shared-expense-' || v_share.id::text,
      'shared_expense.created:' || v_share.id::text
    );

    if v_id is not null then
      v_ids := array_append(v_ids, v_id);
    end if;
  end loop;

  return v_ids;
end;
$$;

create or replace function public.create_shared_expense(
  p_total numeric,
  p_currency text,
  p_date date,
  p_merchant text,
  p_description text,
  p_payer_consumes boolean,
  p_payer_amount numeric,
  p_category_id uuid,
  p_payment_method_id uuid,
  p_participants jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_norm jsonb;
  v_expense_id uuid;
  v_tx_id uuid;
  v_notification_ids uuid[];
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

  v_norm := private.normalize_split(
    v_uid,
    p_total,
    p_currency,
    p_payer_consumes,
    p_payer_amount,
    p_category_id,
    p_payment_method_id,
    p_participants
  );

  insert into public.shared_expenses (
    payer_id,
    total_amount,
    currency,
    date,
    merchant,
    description
  ) values (
    v_uid,
    round(p_total, 2),
    p_currency,
    p_date,
    v_merchant,
    v_description
  )
  returning id into v_expense_id;

  v_tx_id := private.insert_split_parts(
    v_expense_id,
    v_uid,
    p_currency,
    p_date,
    v_merchant,
    v_description,
    p_payer_consumes,
    (v_norm->>'payer_amount')::numeric,
    p_category_id,
    p_payment_method_id,
    v_norm->>'category_name',
    v_norm->'participants'
  );

  -- Misma transacción que el gasto: si no hay notificación, no hay gasto.
  v_notification_ids := private.notify_new_shared_expense(v_expense_id, v_uid);

  return jsonb_build_object(
    'expense_id', v_expense_id,
    'transaction_id', v_tx_id,
    'notification_ids', to_jsonb(v_notification_ids)
  );
end;
$$;
