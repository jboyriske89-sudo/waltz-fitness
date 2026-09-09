-- WALTZ Fitness database schema
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  paid_access boolean not null default false,
  stripe_customer_id text,
  stripe_checkout_session_id text,
  profile_json jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  program_json jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  completed_json jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workout_key text not null,
  exercise_key text not null,
  set_number integer not null,
  weight numeric,
  reps integer,
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  unique(user_id, workout_key, exercise_key, set_number)
);

alter table public.profiles enable row level security;
alter table public.programs enable row level security;
alter table public.progress enable row level security;
alter table public.workout_sets enable row level security;

create policy "Users read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "Paid users read own program" on public.programs for select using (
  auth.uid() = user_id and exists(select 1 from public.profiles p where p.id=auth.uid() and p.paid_access=true)
);
create policy "Users insert own program" on public.programs for insert with check (auth.uid() = user_id);
create policy "Users update own program" on public.programs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Paid users read own progress" on public.progress for select using (
  auth.uid() = user_id and exists(select 1 from public.profiles p where p.id=auth.uid() and p.paid_access=true)
);
create policy "Paid users write own progress" on public.progress for all using (
  auth.uid() = user_id and exists(select 1 from public.profiles p where p.id=auth.uid() and p.paid_access=true)
) with check (
  auth.uid() = user_id and exists(select 1 from public.profiles p where p.id=auth.uid() and p.paid_access=true)
);

create policy "Paid users manage own workout sets" on public.workout_sets for all using (
  auth.uid() = user_id and exists(select 1 from public.profiles p where p.id=auth.uid() and p.paid_access=true)
) with check (
  auth.uid() = user_id and exists(select 1 from public.profiles p where p.id=auth.uid() and p.paid_access=true)
);
