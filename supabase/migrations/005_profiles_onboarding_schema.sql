-- Migration 005: make profile/onboarding schema match the app.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null default '',
  last_name text not null default '',
  phone text,
  plan text not null default 'livre',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists first_name text not null default '';
alter table public.profiles add column if not exists last_name text not null default '';
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists plan text not null default 'livre';
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

create table if not exists public.onboarding (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  phone text,
  journey_stage text not null,
  location jsonb,
  destination_country text,
  destination_country_code text,
  destination_city text,
  arrival_month integer,
  arrival_year integer,
  pregnancy text not null,
  family_status text,
  has_children boolean,
  child_ages jsonb,
  language_level text,
  wants_language_tips boolean,
  main_goal text,
  planning_maturity text,
  visa_intent text,
  financial_prep text[],
  first_accommodation text,
  banking_setup text[],
  visa_status text,
  bank_account text,
  work_type text,
  remittance text,
  housing text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.onboarding add column if not exists phone text;
alter table public.onboarding add column if not exists journey_stage text;
alter table public.onboarding add column if not exists location jsonb;
alter table public.onboarding add column if not exists destination_country text;
alter table public.onboarding add column if not exists destination_country_code text;
alter table public.onboarding add column if not exists destination_city text;
alter table public.onboarding add column if not exists arrival_month integer;
alter table public.onboarding add column if not exists arrival_year integer;
alter table public.onboarding add column if not exists pregnancy text;
alter table public.onboarding add column if not exists family_status text;
alter table public.onboarding add column if not exists has_children boolean;
alter table public.onboarding add column if not exists child_ages jsonb;
alter table public.onboarding add column if not exists language_level text;
alter table public.onboarding add column if not exists wants_language_tips boolean;
alter table public.onboarding add column if not exists main_goal text;
alter table public.onboarding add column if not exists planning_maturity text;
alter table public.onboarding add column if not exists visa_intent text;
alter table public.onboarding add column if not exists financial_prep text[];
alter table public.onboarding add column if not exists first_accommodation text;
alter table public.onboarding add column if not exists banking_setup text[];
alter table public.onboarding add column if not exists visa_status text;
alter table public.onboarding add column if not exists bank_account text;
alter table public.onboarding add column if not exists work_type text;
alter table public.onboarding add column if not exists remittance text;
alter table public.onboarding add column if not exists housing text;
alter table public.onboarding add column if not exists created_at timestamptz not null default now();
alter table public.onboarding add column if not exists updated_at timestamptz not null default now();

create unique index if not exists onboarding_user_id_unique
  on public.onboarding (user_id);

alter table public.profiles enable row level security;
alter table public.onboarding enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'users read own profile'
  ) then
    create policy "users read own profile"
      on public.profiles
      for select
      using (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'users insert own profile'
  ) then
    create policy "users insert own profile"
      on public.profiles
      for insert
      with check (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'users update own profile'
  ) then
    create policy "users update own profile"
      on public.profiles
      for update
      using (auth.uid() = id)
      with check (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'onboarding' and policyname = 'users manage own onboarding'
  ) then
    create policy "users manage own onboarding"
      on public.onboarding
      for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    null
  )
  on conflict (id) do nothing;

  insert into public.checklist_items (user_id, item_key, title, description, done, sort_order) values
    (new.id, 'doc-passport', 'Passaporte valido', 'Verifique a validade minima', false, 0),
    (new.id, 'doc-visa', 'Visto ou autorizacao de residencia', null, false, 1),
    (new.id, 'tax-cpf', 'Manter CPF regular na Receita Federal', null, true, 2),
    (new.id, 'tax-drei', 'Declaracao de Saida Definitiva', null, false, 3),
    (new.id, 'consul', 'Cadastro no consulado brasileiro', null, false, 4),
    (new.id, 'health', 'Seguro saude local', null, false, 5),
    (new.id, 'bank', 'Abrir conta bancaria local', null, false, 6),
    (new.id, 'remit', 'Configurar app de remessas', null, false, 7)
  on conflict (user_id, item_key) do nothing;

  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'on_auth_user_created'
  ) then
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute function public.handle_new_user();
  end if;
end;
$$;
