create or replace function private.handle_new_user_defaults()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  insert into public.categories (user_id, name, type, icon)
  values
    (new.id, 'Alimentación', 'EXPENSE', '🍔'),
    (new.id, 'Transporte', 'EXPENSE', '🚗'),
    (new.id, 'Vivienda', 'EXPENSE', '🏠'),
    (new.id, 'Entretenimiento', 'EXPENSE', '🎮'),
    (new.id, 'Salud', 'EXPENSE', '🏥'),
    (new.id, 'Educación', 'EXPENSE', '📚'),
    (new.id, 'Compras', 'EXPENSE', '🛍️'),
    (new.id, 'Otros', 'EXPENSE', '📦'),
    (new.id, 'Salario', 'INCOME', '💰'),
    (new.id, 'Freelance', 'INCOME', '💻'),
    (new.id, 'Otros ingresos', 'INCOME', '💵');

  insert into public.payment_methods (user_id, name)
  values
    (new.id, 'Efectivo'),
    (new.id, 'Tarjeta de débito'),
    (new.id, 'Tarjeta de crédito'),
    (new.id, 'Transferencia');

  return new;
end;
$function$;

update public.categories
set icon = case name
  when 'Alimentación' then '🍔'
  when 'Transporte' then '🚗'
  when 'Vivienda' then '🏠'
  when 'Entretenimiento' then '🎮'
  when 'Salud' then '🏥'
  when 'Educación' then '📚'
  when 'Compras' then '🛍️'
  when 'Otros' then '📦'
  when 'Salario' then '💰'
  when 'Freelance' then '💻'
  when 'Otros ingresos' then '💵'
  else icon
end
where icon is null;
