-- ============================================
-- Jewelshot® — Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- ── Profiles ────────────────────────────────
-- Extends auth.users with app-specific data.
-- Auto-created on signup via trigger.

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  credits integer not null default 0,
  plan text not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Users can read their own profile (credits, plan, etc.)
-- Write access is intentionally omitted: credit deduction/addition and plan changes
-- are done exclusively via SECURITY DEFINER RPCs (deduct_user_credit,
-- grant_purchase_credits, refund_user_credit) using the service role key.
-- This prevents any client-side manipulation of credits or plan fields.
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Prompts ─────────────────────────────────
-- Prompt templates managed by admin.

create table public.prompts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  template text not null,
  reference_image_url text,
  category text not null default 'genel',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.prompts enable row level security;

create policy "Anyone can read active prompts"
  on public.prompts for select
  using (is_active = true);

-- ── Generations ─────────────────────────────
-- Image generation history.

create table public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  prompt_id uuid references public.prompts(id) on delete set null,
  input_image_url text not null,
  output_image_url text,
  prompt_text text not null,
  status text not null default 'pending',
  fal_request_id text,
  credits_used integer not null default 1,
  created_at timestamptz not null default now()
);

alter table public.generations enable row level security;

create policy "Users can read own generations"
  on public.generations for select
  using (auth.uid() = user_id);

create policy "Users can insert own generations"
  on public.generations for insert
  with check (auth.uid() = user_id);

create policy "Users can update own generations"
  on public.generations for update
  using (auth.uid() = user_id);

-- ── Credit Transactions ─────────────────────
-- Tracks credit purchases, usage, and refunds.

create table public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount integer not null,
  type text not null,
  description text,
  reference_id text,
  created_at timestamptz not null default now()
);

alter table public.credit_transactions enable row level security;

create policy "Users can read own transactions"
  on public.credit_transactions for select
  using (auth.uid() = user_id);

-- ── Payments ────────────────────────────────
-- Tracks Creem.io checkout sessions and completed payments.

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  creem_checkout_id text unique not null,
  amount numeric not null,
  currency text not null default 'TRY',
  credits_purchased integer not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.payments enable row level security;

create policy "Users can read own payments"
  on public.payments for select
  using (auth.uid() = user_id);

-- ── Indexes ─────────────────────────────────

create index idx_generations_user_id on public.generations(user_id);
create index idx_generations_created_at on public.generations(created_at desc);
create index idx_credit_transactions_user_id on public.credit_transactions(user_id);
create index idx_prompts_category on public.prompts(category);

-- ── Updated_at trigger ──────────────────────

create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

create trigger prompts_updated_at
  before update on public.prompts
  for each row execute function public.update_updated_at();

create trigger payments_updated_at
  before update on public.payments
  for each row execute function public.update_updated_at();
