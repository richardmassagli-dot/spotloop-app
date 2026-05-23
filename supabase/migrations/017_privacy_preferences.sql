-- Member privacy preferences (DSGVO / privacy-by-design)
create table if not exists public.user_privacy_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  share_spend_with_spots boolean not null default false,
  allow_personalized_campaigns boolean not null default true,
  share_loyalty_insights boolean not null default true,
  loyalty_active boolean not null default true,
  prefs jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_privacy_preferences enable row level security;

create policy "Users read own privacy prefs"
  on public.user_privacy_preferences for select
  using (auth.uid() = user_id);

create policy "Users upsert own privacy prefs"
  on public.user_privacy_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users update own privacy prefs"
  on public.user_privacy_preferences for update
  using (auth.uid() = user_id);

-- Merchants never read raw prefs; only RPC/views with aggregates (future).
