-- El deep link del cobro apunta al detalle del gasto (KIBO-108).
-- Antes abría la página del amigo; ahora abre la vista de solo lectura del gasto.

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
      '/friends/expenses/' || p_expense_id::text,
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
