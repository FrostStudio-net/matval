create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz default now()
);

create table if not exists public.meal_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text default 'Matarplan',
  plan_data jsonb not null,
  selected_shop text,
  total_price numeric,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.meal_plans enable row level security;

create policy "Users can view own profile"
on public.profiles
for select
using (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles
for update
using (auth.uid() = id);

create policy "Users can insert own profile"
on public.profiles
for insert
with check (auth.uid() = id);

create policy "Users can view own meal plans"
on public.meal_plans
for select
using (auth.uid() = user_id);

create policy "Users can insert own meal plans"
on public.meal_plans
for insert
with check (auth.uid() = user_id);

create policy "Users can update own meal plans"
on public.meal_plans
for update
using (auth.uid() = user_id);

create policy "Users can delete own meal plans"
on public.meal_plans
for delete
using (auth.uid() = user_id);

create table if not exists public.store_price_snapshots (
  id uuid primary key default gen_random_uuid(),
  store text,
  source_name text not null,
  source_type text not null check (source_type in ('store', 'reference', 'estimated')),
  product_name text not null,
  normalized_product_name text not null,
  barcode text null,
  external_product_id text null,
  price numeric not null,
  unit_price numeric null,
  size_label text null,
  category text null,
  observed_at timestamptz null,
  fetched_at timestamptz default now(),
  confidence text not null check (confidence in ('high', 'medium', 'low')),
  raw_data jsonb null
);

create table if not exists public.price_import_runs (
  id uuid primary key default gen_random_uuid(),
  source_name text not null,
  source_type text not null check (source_type in ('store', 'reference', 'estimated')),
  started_at timestamptz default now(),
  finished_at timestamptz null,
  status text,
  items_imported integer default 0,
  error_message text null
);

alter table public.store_price_snapshots enable row level security;
alter table public.price_import_runs enable row level security;
