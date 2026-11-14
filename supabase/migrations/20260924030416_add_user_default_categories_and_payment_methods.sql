create schema if not exists private;

create or replace function private.handle_new_user_defaults()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.categories (user_id, name, type)
  values
    (new.id, 'Alimentación', 'EXPENSE'),
    (new.id, 'Transporte', 'EXPENSE'),
    (new.id, 'Vivienda', 'EXPENSE'),
    (new.id, 'Entretenimiento', 'EXPENSE'),
    (new.id, 'Salud', 'EXPENSE'),
    (new.id, 'Educación', 'EXPENSE'),
    (new.id, 'Compras', 'EXPENSE'),
    (new.id, 'Otros', 'EXPENSE'),
    (new.id, 'Salario', 'INCOME'),
    (new.id, 'Freelance', 'INCOME'),
    (new.id, 'Otros ingresos', 'INCOME');

  insert into public.payment_methods (user_id, name)
  values
    (new.id, 'Efectivo'),
    (new.id, 'Tarjeta de débito'),
    (new.id, 'Tarjeta de crédito'),
    (new.id, 'Transferencia');

  return new;
end;
$$;

revoke all on function private.handle_new_user_defaults() from public, anon, authenticated;

drop trigger if exists on_auth_user_created_defaults on auth.users;

create trigger on_auth_user_created_defaults
  after insert on auth.users
  for each row
  execute function private.handle_new_user_defaults();
