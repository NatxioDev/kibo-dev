create schema if not exists private;

revoke all on schema private from public;
revoke all on schema private from anon, authenticated;

create type public.shared_expense_status as enum ('active', 'voided');
create type public.share_status as enum ('pending', 'classified', 'disputed', 'voided');
create type public.debt_entry_kind as enum ('share', 'payment', 'void');
create type public.settlement_status as enum ('pending', 'confirmed', 'rejected');
create type public.settlement_initiator as enum ('debtor', 'creditor');

create table public.shared_expenses (
  id uuid primary key default gen_random_uuid(),
  payer_id uuid not null references public.profiles (id) on delete cascade,
  total_amount numeric(12, 2) not null,
  currency text not null,
  date date not null,
  merchant text,
  description text,
  status public.shared_expense_status not null default 'active',
  group_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint shared_expenses_total_positive check (total_amount > 0),
  constraint shared_expenses_currency check (currency in ('BOB', 'USD')),
  constraint shared_expenses_merchant_length check (
    merchant is null or char_length(merchant) <= 80
  ),
  constraint shared_expenses_description_length check (
    description is null or char_length(description) <= 280
  )
);

create table public.shared_expense_shares (
  id uuid primary key default gen_random_uuid(),
  shared_expense_id uuid not null references public.shared_expenses (id) on delete restrict,
  user_id uuid not null references public.profiles (id) on delete cascade,
  amount numeric(12, 2) not null,
  consumes boolean not null default true,
  status public.share_status not null default 'pending',
  category_name_snapshot text,
  transaction_id uuid references public.transactions (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint shared_expense_shares_amount_non_negative check (amount >= 0)
);

create unique index shared_expense_shares_active_user_idx
  on public.shared_expense_shares (shared_expense_id, user_id)
  where status <> 'voided';

create index shared_expense_shares_user_status_idx
  on public.shared_expense_shares (user_id, status);

create table public.debt_entries (
  id uuid primary key default gen_random_uuid(),
  debtor_id uuid not null references public.profiles (id) on delete cascade,
  creditor_id uuid not null references public.profiles (id) on delete cascade,
  amount numeric(12, 2) not null,
  currency text not null,
  kind public.debt_entry_kind not null,
  shared_expense_id uuid references public.shared_expenses (id) on delete restrict,
  settlement_id uuid,
  reverses_entry_id uuid references public.debt_entries (id) on delete restrict,
  group_id uuid,
  created_at timestamptz not null default now(),
  created_by uuid not null references public.profiles (id) on delete cascade,
  constraint debt_entries_amount_positive check (amount > 0),
  constraint debt_entries_currency check (currency in ('BOB', 'USD')),
  constraint debt_entries_not_self check (debtor_id <> creditor_id)
);

create index debt_entries_pair_idx
  on public.debt_entries (debtor_id, creditor_id, currency);

create index debt_entries_expense_idx
  on public.debt_entries (shared_expense_id);

create table public.settlements (
  id uuid primary key default gen_random_uuid(),
  debtor_id uuid not null references public.profiles (id) on delete cascade,
  creditor_id uuid not null references public.profiles (id) on delete cascade,
  amount numeric(12, 2) not null,
  currency text not null,
  status public.settlement_status not null default 'pending',
  initiated_by public.settlement_initiator not null,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  constraint settlements_amount_positive check (amount > 0),
  constraint settlements_currency check (currency in ('BOB', 'USD')),
  constraint settlements_not_self check (debtor_id <> creditor_id)
);

alter table public.debt_entries
  add constraint debt_entries_settlement_id_fkey
  foreign key (settlement_id) references public.settlements (id) on delete restrict;

create index settlements_pair_status_idx
  on public.settlements (debtor_id, creditor_id, status);

alter table public.shared_expenses enable row level security;
alter table public.shared_expense_shares enable row level security;
alter table public.debt_entries enable row level security;
alter table public.settlements enable row level security;

create or replace function private.can_read_shared_expense(p_expense_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.shared_expenses as expense
    where expense.id = p_expense_id
      and (
        expense.payer_id = (select auth.uid())
        or exists (
          select 1
          from public.shared_expense_shares as share
          where share.shared_expense_id = expense.id
            and share.user_id = (select auth.uid())
        )
      )
  );
$$;

create policy "Participants can read shared expenses"
  on public.shared_expenses for select
  to authenticated
  using (private.can_read_shared_expense(id));

create policy "Participants can read shares"
  on public.shared_expense_shares for select
  to authenticated
  using (private.can_read_shared_expense(shared_expense_id));

create policy "Parties can read debt entries"
  on public.debt_entries for select
  to authenticated
  using ((select auth.uid()) in (debtor_id, creditor_id));

create policy "Parties can read settlements"
  on public.settlements for select
  to authenticated
  using ((select auth.uid()) in (debtor_id, creditor_id));

create or replace function private.prevent_debt_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'debt entries are append-only' using errcode = 'P0001';
end;
$$;

create trigger debt_entries_append_only
  before update or delete on public.debt_entries
  for each row execute function private.prevent_debt_mutation();

create or replace function private.money_cents(p_amount numeric)
returns bigint
language sql
immutable
set search_path = ''
as $$
  select pg_catalog.round(coalesce(p_amount, 0) * 100)::bigint;
$$;

create or replace function private.are_friends(p_a uuid, p_b uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.friendships
    where status = 'accepted'
      and (
        (requester_id = p_a and addressee_id = p_b)
        or (requester_id = p_b and addressee_id = p_a)
      )
  );
$$;

create or replace function private.net_debtor_owes(
  p_debtor uuid,
  p_creditor uuid,
  p_currency text
)
returns numeric
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(sum(
    case
      when debtor_id = p_debtor and creditor_id = p_creditor then amount
      when debtor_id = p_creditor and creditor_id = p_debtor then -amount
      else 0
    end
  ), 0)
  from public.debt_entries
  where currency = p_currency
    and (
      (debtor_id = p_debtor and creditor_id = p_creditor)
      or (debtor_id = p_creditor and creditor_id = p_debtor)
    );
$$;

create or replace function private.disputed_debt(
  p_debtor uuid,
  p_creditor uuid,
  p_currency text
)
returns numeric
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(sum(share.amount), 0)
  from public.shared_expense_shares as share
  join public.shared_expenses as expense
    on expense.id = share.shared_expense_id
  where share.user_id = p_debtor
    and expense.payer_id = p_creditor
    and share.user_id <> expense.payer_id
    and share.status = 'disputed'
    and expense.status = 'active'
    and expense.currency = p_currency;
$$;

create or replace function private.pending_settlement_total(
  p_debtor uuid,
  p_creditor uuid,
  p_currency text
)
returns numeric
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(sum(amount), 0)
  from public.settlements
  where debtor_id = p_debtor
    and creditor_id = p_creditor
    and currency = p_currency
    and status = 'pending';
$$;

-- Positive result: how much p_debtor can still pay p_creditor.
create or replace function private.settleable_payment(
  p_debtor uuid,
  p_creditor uuid,
  p_currency text
)
returns numeric
language sql
stable
security definer
set search_path = ''
as $$
  select greatest(
    0,
    private.net_debtor_owes(p_debtor, p_creditor, p_currency)
      - private.disputed_debt(p_debtor, p_creditor, p_currency)
      - private.pending_settlement_total(p_debtor, p_creditor, p_currency)
  );
$$;

create or replace function private.split_amount_locked(
  p_expense_id uuid,
  p_party_ids uuid[]
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.shared_expenses as expense
    join public.settlements as settlement
      on settlement.currency = expense.currency
     and settlement.status = 'confirmed'
     and settlement.confirmed_at >= expense.created_at
     and (
       (settlement.debtor_id = expense.payer_id and settlement.creditor_id = any(p_party_ids))
       or (settlement.creditor_id = expense.payer_id and settlement.debtor_id = any(p_party_ids))
     )
    where expense.id = p_expense_id
  );
$$;

create or replace function private.normalize_split(
  p_uid uuid,
  p_total numeric,
  p_currency text,
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
  v_item jsonb;
  v_user uuid;
  v_amount numeric;
  v_ids uuid[] := '{}';
  v_sum bigint := 0;
  v_clean jsonb := '[]'::jsonb;
  v_category_name text;
begin
  if p_uid is null then
    raise exception 'Debes iniciar sesión.' using errcode = 'P0001';
  end if;

  if p_currency not in ('BOB', 'USD') then
    raise exception 'Selecciona una moneda.' using errcode = 'P0001';
  end if;

  if private.money_cents(p_total) <= 0 then
    raise exception 'El monto tiene que ser mayor que 0.' using errcode = 'P0001';
  end if;

  if p_payer_amount is null or p_payer_amount < 0 then
    raise exception 'Tu parte no puede ser negativa.' using errcode = 'P0001';
  end if;

  if p_payer_consumes and private.money_cents(p_payer_amount) <= 0 then
    raise exception 'Si también consumiste, tu parte tiene que ser mayor que 0.' using errcode = 'P0001';
  end if;

  if p_participants is null or jsonb_typeof(p_participants) <> 'array' then
    raise exception 'Elige al menos un amigo.' using errcode = 'P0001';
  end if;

  if jsonb_array_length(p_participants) < 1 then
    raise exception 'Elige al menos un amigo.' using errcode = 'P0001';
  end if;

  if jsonb_array_length(p_participants) > 30 then
    raise exception 'Puedes dividir con hasta 30 amigos.' using errcode = 'P0001';
  end if;

  if p_category_id is not null then
    select name into v_category_name
    from public.categories
    where id = p_category_id
      and user_id = p_uid
      and type = 'EXPENSE';

    if v_category_name is null then
      raise exception 'Elige una categoría tuya de gastos.' using errcode = 'P0001';
    end if;
  end if;

  if p_payment_method_id is not null then
    perform 1
    from public.payment_methods
    where id = p_payment_method_id
      and user_id = p_uid;

    if not found then
      raise exception 'El método de pago no es válido.' using errcode = 'P0001';
    end if;
  end if;

  for v_item in
    select value from jsonb_array_elements(p_participants)
  loop
    if coalesce(v_item->>'user_id', '') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
      raise exception 'Hay un amigo que no es válido.' using errcode = 'P0001';
    end if;

    v_user := (v_item->>'user_id')::uuid;
    v_amount := round(coalesce((v_item->>'amount')::numeric, -1), 2);

    if v_user = p_uid then
      raise exception 'No puedes dividir un gasto contigo.' using errcode = 'P0001';
    end if;

    if v_user = any(v_ids) then
      raise exception 'No repitas a la misma persona.' using errcode = 'P0001';
    end if;

    if v_amount <= 0 then
      raise exception 'Cada parte tiene que ser mayor que 0.' using errcode = 'P0001';
    end if;

    if not private.are_friends(p_uid, v_user) then
      raise exception 'Solo puedes dividir con amigos aceptados.' using errcode = 'P0001';
    end if;

    v_ids := v_ids || v_user;
    v_sum := v_sum + private.money_cents(v_amount);
    v_clean := v_clean || jsonb_build_array(jsonb_build_object('user_id', v_user, 'amount', v_amount));
  end loop;

  v_sum := v_sum + private.money_cents(round(p_payer_amount, 2));

  if v_sum <> private.money_cents(p_total) then
    raise exception 'La suma de las partes tiene que ser el total.' using errcode = 'P0001';
  end if;

  return jsonb_build_object(
    'category_name', v_category_name,
    'payer_amount', round(p_payer_amount, 2),
    'participants', v_clean,
    'party_ids', to_jsonb(v_ids)
  );
end;
$$;

create or replace function private.insert_split_parts(
  p_expense_id uuid,
  p_uid uuid,
  p_currency text,
  p_date date,
  p_merchant text,
  p_description text,
  p_payer_consumes boolean,
  p_payer_amount numeric,
  p_category_id uuid,
  p_payment_method_id uuid,
  p_category_name text,
  p_participants jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tx_id uuid;
  v_item jsonb;
begin
  if private.money_cents(p_payer_amount) > 0 then
    insert into public.transactions (
      user_id,
      category_id,
      payment_method_id,
      type,
      amount,
      currency,
      date,
      merchant,
      description,
      source,
      status
    ) values (
      p_uid,
      p_category_id,
      p_payment_method_id,
      'EXPENSE',
      round(p_payer_amount, 2),
      p_currency,
      p_date,
      p_merchant,
      p_description,
      'MANUAL',
      'CONFIRMED'
    )
    returning id into v_tx_id;
  end if;

  insert into public.shared_expense_shares (
    shared_expense_id,
    user_id,
    amount,
    consumes,
    status,
    category_name_snapshot,
    transaction_id
  ) values (
    p_expense_id,
    p_uid,
    round(p_payer_amount, 2),
    p_payer_consumes,
    'classified',
    p_category_name,
    v_tx_id
  );

  for v_item in
    select value from jsonb_array_elements(p_participants)
  loop
    insert into public.shared_expense_shares (
      shared_expense_id,
      user_id,
      amount,
      consumes,
      status,
      category_name_snapshot
    ) values (
      p_expense_id,
      (v_item->>'user_id')::uuid,
      (v_item->>'amount')::numeric,
      true,
      'pending',
      p_category_name
    );

    insert into public.debt_entries (
      debtor_id,
      creditor_id,
      amount,
      currency,
      kind,
      shared_expense_id,
      created_by
    ) values (
      (v_item->>'user_id')::uuid,
      p_uid,
      (v_item->>'amount')::numeric,
      p_currency,
      'share',
      p_expense_id,
      p_uid
    );
  end loop;

  return v_tx_id;
end;
$$;

create or replace function private.void_split_parts(p_expense_id uuid, p_uid uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tx_ids uuid[];
begin
  insert into public.debt_entries (
    debtor_id,
    creditor_id,
    amount,
    currency,
    kind,
    shared_expense_id,
    reverses_entry_id,
    created_by
  )
  select
    entry.creditor_id,
    entry.debtor_id,
    entry.amount,
    entry.currency,
    'void',
    entry.shared_expense_id,
    entry.id,
    p_uid
  from public.debt_entries as entry
  where entry.shared_expense_id = p_expense_id
    and entry.kind = 'share'
    and not exists (
      select 1
      from public.debt_entries as reversal
      where reversal.reverses_entry_id = entry.id
    );

  select coalesce(array_agg(transaction_id), '{}')
  into v_tx_ids
  from public.shared_expense_shares
  where shared_expense_id = p_expense_id
    and status <> 'voided'
    and transaction_id is not null;

  update public.shared_expense_shares
  set status = 'voided',
      transaction_id = null,
      updated_at = now()
  where shared_expense_id = p_expense_id
    and status <> 'voided';

  if cardinality(v_tx_ids) > 0 then
    delete from public.transactions
    where id = any(v_tx_ids);
  end if;
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

  return jsonb_build_object('expense_id', v_expense_id, 'transaction_id', v_tx_id);
end;
$$;

create or replace function public.replace_shared_expense(
  p_expense_id uuid,
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

  select * into v_expense
  from public.shared_expenses
  where id = p_expense_id
  for update;

  if v_expense.id is null or v_expense.status <> 'active' then
    raise exception 'Ese gasto compartido ya no está activo.' using errcode = 'P0001';
  end if;

  if v_expense.payer_id <> v_uid then
    raise exception 'Solo quien pagó puede cambiar este gasto.' using errcode = 'P0001';
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

  select coalesce(array_agg(user_id), '{}')
  into v_parties
  from public.shared_expense_shares
  where shared_expense_id = p_expense_id
    and status <> 'voided'
    and user_id <> v_uid;

  v_parties := v_parties || coalesce(
    (
      select array_agg(value::uuid)
      from jsonb_array_elements_text(v_norm->'party_ids') as value
    ),
    '{}'
  );

  if private.split_amount_locked(p_expense_id, v_parties) then
    raise exception 'Ya hay un pago confirmado con esta persona. No puedes cambiar el monto.' using errcode = 'P0001';
  end if;

  perform private.void_split_parts(p_expense_id, v_uid);

  update public.shared_expenses
  set total_amount = round(p_total, 2),
      currency = p_currency,
      date = p_date,
      merchant = v_merchant,
      description = v_description,
      updated_at = now()
  where id = p_expense_id;

  v_tx_id := private.insert_split_parts(
    p_expense_id,
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

  return jsonb_build_object('expense_id', p_expense_id, 'transaction_id', v_tx_id);
end;
$$;

create or replace function public.update_shared_expense_details(
  p_expense_id uuid,
  p_date date,
  p_merchant text,
  p_description text,
  p_category_id uuid,
  p_payment_method_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
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

  select * into v_expense
  from public.shared_expenses
  where id = p_expense_id
  for update;

  if v_expense.id is null or v_expense.status <> 'active' then
    raise exception 'Ese gasto compartido ya no está activo.' using errcode = 'P0001';
  end if;

  if v_expense.payer_id <> v_uid then
    raise exception 'Solo quien pagó puede cambiar este gasto.' using errcode = 'P0001';
  end if;

  if p_category_id is not null then
    select name into v_category_name
    from public.categories
    where id = p_category_id
      and user_id = v_uid
      and type = 'EXPENSE';

    if v_category_name is null then
      raise exception 'Elige una categoría tuya de gastos.' using errcode = 'P0001';
    end if;
  end if;

  if p_payment_method_id is not null then
    perform 1
    from public.payment_methods
    where id = p_payment_method_id
      and user_id = v_uid;

    if not found then
      raise exception 'El método de pago no es válido.' using errcode = 'P0001';
    end if;
  end if;

  update public.shared_expenses
  set date = p_date,
      merchant = v_merchant,
      description = v_description,
      updated_at = now()
  where id = p_expense_id;

  select transaction_id into v_tx_id
  from public.shared_expense_shares
  where shared_expense_id = p_expense_id
    and user_id = v_uid
    and status = 'classified';

  if v_tx_id is not null then
    update public.transactions
    set category_id = p_category_id,
        payment_method_id = p_payment_method_id,
        date = p_date,
        merchant = v_merchant,
        description = v_description,
        updated_at = now()
    where id = v_tx_id
      and user_id = v_uid;
  end if;

  update public.shared_expense_shares
  set category_name_snapshot = v_category_name,
      updated_at = now()
  where shared_expense_id = p_expense_id
    and user_id = v_uid
    and status = 'classified';

  update public.shared_expense_shares
  set category_name_snapshot = v_category_name,
      updated_at = now()
  where shared_expense_id = p_expense_id
    and status = 'pending';
end;
$$;

create or replace function public.void_shared_expense(p_expense_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_expense public.shared_expenses;
  v_parties uuid[];
begin
  if v_uid is null then
    raise exception 'Debes iniciar sesión.' using errcode = 'P0001';
  end if;

  select * into v_expense
  from public.shared_expenses
  where id = p_expense_id
  for update;

  if v_expense.id is null or v_expense.status <> 'active' then
    raise exception 'Ese gasto compartido ya no está activo.' using errcode = 'P0001';
  end if;

  if v_expense.payer_id <> v_uid then
    raise exception 'Solo quien pagó puede eliminar este gasto.' using errcode = 'P0001';
  end if;

  select coalesce(array_agg(user_id), '{}')
  into v_parties
  from public.shared_expense_shares
  where shared_expense_id = p_expense_id
    and status <> 'voided'
    and user_id <> v_uid;

  if private.split_amount_locked(p_expense_id, v_parties) then
    raise exception 'Ya hay un pago confirmado con esta persona. No puedes eliminar el gasto.' using errcode = 'P0001';
  end if;

  perform private.void_split_parts(p_expense_id, v_uid);

  update public.shared_expenses
  set status = 'voided',
      updated_at = now()
  where id = p_expense_id;
end;
$$;

create or replace function public.classify_share(
  p_share_id uuid,
  p_category_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
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

  select * into v_share
  from public.shared_expense_shares
  where id = p_share_id
  for update;

  if v_share.id is null or v_share.user_id <> v_uid then
    raise exception 'No encontramos esa parte del gasto.' using errcode = 'P0001';
  end if;

  if v_share.status not in ('pending', 'disputed') then
    raise exception 'Esa parte ya está clasificada.' using errcode = 'P0001';
  end if;

  select * into v_expense
  from public.shared_expenses
  where id = v_share.shared_expense_id;

  if v_expense.status <> 'active' then
    raise exception 'Ese gasto compartido ya no está activo.' using errcode = 'P0001';
  end if;

  perform 1
  from public.categories
  where id = p_category_id
    and user_id = v_uid
    and type = 'EXPENSE'
    and is_active = true;

  if not found then
    raise exception 'Elige una categoría tuya de gastos.' using errcode = 'P0001';
  end if;

  insert into public.transactions (
    user_id,
    category_id,
    payment_method_id,
    type,
    amount,
    currency,
    date,
    merchant,
    description,
    source,
    status
  ) values (
    v_uid,
    p_category_id,
    null,
    'EXPENSE',
    v_share.amount,
    v_expense.currency,
    v_expense.date,
    v_expense.merchant,
    v_expense.description,
    'MANUAL',
    'CONFIRMED'
  )
  returning id into v_tx_id;

  update public.shared_expense_shares
  set status = 'classified',
      transaction_id = v_tx_id,
      updated_at = now()
  where id = p_share_id;

  return v_tx_id;
end;
$$;

create or replace function public.dispute_share(p_share_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_share public.shared_expense_shares;
begin
  if v_uid is null then
    raise exception 'Debes iniciar sesión.' using errcode = 'P0001';
  end if;

  select * into v_share
  from public.shared_expense_shares
  where id = p_share_id
  for update;

  if v_share.id is null or v_share.user_id <> v_uid or v_share.status <> 'pending' then
    raise exception 'Solo puedes marcar como no reconocido un gasto pendiente.' using errcode = 'P0001';
  end if;

  perform 1
  from public.shared_expenses
  where id = v_share.shared_expense_id
    and status = 'active';

  if not found then
    raise exception 'Ese gasto compartido ya no está activo.' using errcode = 'P0001';
  end if;

  update public.shared_expense_shares
  set status = 'disputed',
      updated_at = now()
  where id = p_share_id;
end;
$$;

create or replace function public.withdraw_share_dispute(p_share_id uuid)
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

  update public.shared_expense_shares
  set status = 'pending',
      updated_at = now()
  where id = p_share_id
    and user_id = v_uid
    and status = 'disputed';

  if not found then
    raise exception 'Esa parte no está en revisión.' using errcode = 'P0001';
  end if;
end;
$$;

create or replace function private.assert_settlement_amount(
  p_debtor uuid,
  p_creditor uuid,
  p_amount numeric,
  p_currency text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
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
$$;

create or replace function private.add_payment_entry(
  p_debtor uuid,
  p_creditor uuid,
  p_amount numeric,
  p_currency text,
  p_settlement_id uuid,
  p_actor uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.debt_entries (
    debtor_id,
    creditor_id,
    amount,
    currency,
    kind,
    settlement_id,
    created_by
  ) values (
    p_creditor,
    p_debtor,
    round(p_amount, 2),
    p_currency,
    'payment',
    p_settlement_id,
    p_actor
  );
end;
$$;

create or replace function public.request_settlement(
  p_creditor_id uuid,
  p_amount numeric,
  p_currency text
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

  return v_id;
end;
$$;

create or replace function public.confirm_settlement(p_settlement_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_row public.settlements;
  v_room numeric;
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
end;
$$;

create or replace function public.reject_settlement(p_settlement_id uuid)
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

  update public.settlements
  set status = 'rejected'
  where id = p_settlement_id
    and creditor_id = v_uid
    and status = 'pending';

  if not found then
    raise exception 'No hay un pago pendiente para rechazar.' using errcode = 'P0001';
  end if;
end;
$$;

create or replace function public.record_received_payment(
  p_debtor_id uuid,
  p_amount numeric,
  p_currency text
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

  return v_id;
end;
$$;

revoke all on function public.create_shared_expense(numeric, text, date, text, text, boolean, numeric, uuid, uuid, jsonb) from public;
revoke all on function public.replace_shared_expense(uuid, numeric, text, date, text, text, boolean, numeric, uuid, uuid, jsonb) from public;
revoke all on function public.update_shared_expense_details(uuid, date, text, text, uuid, uuid) from public;
revoke all on function public.void_shared_expense(uuid) from public;
revoke all on function public.classify_share(uuid, uuid) from public;
revoke all on function public.dispute_share(uuid) from public;
revoke all on function public.withdraw_share_dispute(uuid) from public;
revoke all on function public.request_settlement(uuid, numeric, text) from public;
revoke all on function public.confirm_settlement(uuid) from public;
revoke all on function public.reject_settlement(uuid) from public;
revoke all on function public.record_received_payment(uuid, numeric, text) from public;

grant execute on function public.create_shared_expense(numeric, text, date, text, text, boolean, numeric, uuid, uuid, jsonb) to authenticated;
grant execute on function public.replace_shared_expense(uuid, numeric, text, date, text, text, boolean, numeric, uuid, uuid, jsonb) to authenticated;
grant execute on function public.update_shared_expense_details(uuid, date, text, text, uuid, uuid) to authenticated;
grant execute on function public.void_shared_expense(uuid) to authenticated;
grant execute on function public.classify_share(uuid, uuid) to authenticated;
grant execute on function public.dispute_share(uuid) to authenticated;
grant execute on function public.withdraw_share_dispute(uuid) to authenticated;
grant execute on function public.request_settlement(uuid, numeric, text) to authenticated;
grant execute on function public.confirm_settlement(uuid) to authenticated;
grant execute on function public.reject_settlement(uuid) to authenticated;
grant execute on function public.record_received_payment(uuid, numeric, text) to authenticated;

revoke all on all functions in schema private from public, anon, authenticated;

grant execute on function private.can_read_shared_expense(uuid) to authenticated;

notify pgrst, 'reload schema';

revoke insert, update, delete, truncate on public.shared_expenses from anon, authenticated;
revoke insert, update, delete, truncate on public.shared_expense_shares from anon, authenticated;
revoke insert, update, delete, truncate on public.debt_entries from anon, authenticated;
revoke insert, update, delete, truncate on public.settlements from anon, authenticated;
