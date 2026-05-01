-- Migration 004: checklist_items + seed on new user

create table if not exists public.checklist_items (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  item_key   text not null,
  title      text not null,
  description text,
  done       boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, item_key)
);

-- RLS
alter table public.checklist_items enable row level security;

create policy "users manage own checklist"
  on public.checklist_items
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Seed default checklist items when a new user is created.
-- Extend the existing handle_new_user trigger function.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- create profile row
  insert into public.profiles (id, first_name, last_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    null
  )
  on conflict (id) do nothing;

  -- seed default checklist
  insert into public.checklist_items (user_id, item_key, title, description, done, sort_order) values
    (new.id, 'doc-passport',  'Passaporte válido',                          'Verifique a validade (mínimo 6 meses)', false, 0),
    (new.id, 'doc-visa',      'Visto / autorização de residência',           null,                                   false, 1),
    (new.id, 'tax-cpf',       'Manter CPF regular na Receita Federal',       null,                                   true,  2),
    (new.id, 'tax-drei',      'Declaração de Saída Definitiva (se aplicável)', null,                                 false, 3),
    (new.id, 'consul',        'Cadastro no consulado brasileiro',            null,                                   false, 4),
    (new.id, 'health',        'Seguro saúde local',                          null,                                   false, 5),
    (new.id, 'bank',          'Abrir conta bancária local',                  null,                                   false, 6),
    (new.id, 'remit',         'Configurar app de remessas (Wise, Remessa Online)', null,                            false, 7)
  on conflict (user_id, item_key) do nothing;

  return new;
end;
$$;
