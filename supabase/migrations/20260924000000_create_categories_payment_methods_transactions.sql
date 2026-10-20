create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  type text not null,
  icon text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_type_check check (type in ('EXPENSE', 'INCOME')),
  constraint categories_user_id_id_unique unique (user_id, id),
  constraint categories_user_name_unique unique (user_id, name)
);

create table public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payment_methods_user_id_id_unique unique (user_id, id),
  constraint payment_methods_user_name_unique unique (user_id, name)
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category_id uuid,
  payment_method_id uuid,
  type text not null,
  amount numeric(12, 2) not null,
  currency text not null default 'BOB',
  date date not null,
  merchant text,
  description text,
  source text not null,
  status text not null default 'CONFIRMED',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint transactions_type_check check (type in ('EXPENSE', 'INCOME')),
  constraint transactions_amount_positive check (amount > 0),
  constraint transactions_currency_check check (currency in ('BOB', 'USD')),
  constraint transactions_source_check check (
    source in ('MANUAL', 'IMAGE', 'TEXT', 'AUDIO')
  ),
  constraint transactions_status_check check (status in ('DRAFT', 'CONFIRMED')),
  constraint transactions_user_id_id_unique unique (user_id, id),
  constraint transactions_category_same_user
    foreign key (user_id, category_id) references public.categories (user_id, id),
  constraint transactions_payment_method_same_user
    foreign key (user_id, payment_method_id)
    references public.payment_methods (user_id, id)
);

alter table public.categories enable row level security;
alter table public.payment_methods enable row level security;
alter table public.transactions enable row level security;

create policy "Users can view own categories"
  on public.categories for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create own categories"
  on public.categories for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own categories"
  on public.categories for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own categories"
  on public.categories for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can view own payment methods"
  on public.payment_methods for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create own payment methods"
  on public.payment_methods for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own payment methods"
  on public.payment_methods for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own payment methods"
  on public.payment_methods for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can view own transactions"
  on public.transactions for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create own transactions"
  on public.transactions for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own transactions"
  on public.transactions for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own transactions"
  on public.transactions for delete
  to authenticated
  using ((select auth.uid()) = user_id);
