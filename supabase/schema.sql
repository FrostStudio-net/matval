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
