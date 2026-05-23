-- Spotloop: ausstehende Migrationen 015–017 (einmalig im SQL Editor ausführen)
-- Dashboard: https://supabase.com/dashboard/project/jhyxufqmcwxhvwwkqhnt/sql/new

-- ── 015: Spot-Nachrichten ─────────────────────────────────────────
create table if not exists public.spot_messages (
  id              uuid primary key default gen_random_uuid(),
  spot_id         uuid not null references public.spots(id) on delete cascade,
  guest_user_id   uuid not null references auth.users(id) on delete cascade,
  thread_id       uuid not null,
  sender          text not null check (sender in ('guest', 'merchant')),
  body            text not null check (char_length(trim(body)) > 0),
  merchant_read   boolean not null default false,
  guest_read      boolean not null default false,
  created_at      timestamptz not null default now()
);

create index if not exists idx_spot_messages_spot on public.spot_messages(spot_id, created_at desc);
create index if not exists idx_spot_messages_thread on public.spot_messages(thread_id, created_at asc);
create index if not exists idx_spot_messages_guest on public.spot_messages(guest_user_id, created_at desc);

alter table public.spot_messages enable row level security;

drop policy if exists "spot_messages_guest_select" on public.spot_messages;
create policy "spot_messages_guest_select" on public.spot_messages
  for select using (guest_user_id = auth.uid());

drop policy if exists "spot_messages_guest_insert" on public.spot_messages;
create policy "spot_messages_guest_insert" on public.spot_messages
  for insert with check (
    sender = 'guest'
    and guest_user_id = auth.uid()
    and spot_id in (
      select id from public.spots
      where verification_status = 'verified' and is_active = true
    )
  );

drop policy if exists "spot_messages_guest_update_read" on public.spot_messages;
create policy "spot_messages_guest_update_read" on public.spot_messages
  for update using (guest_user_id = auth.uid())
  with check (guest_user_id = auth.uid());

drop policy if exists "spot_messages_merchant_select" on public.spot_messages;
create policy "spot_messages_merchant_select" on public.spot_messages
  for select using (
    spot_id in (select id from public.spots where merchant_id = auth.uid())
  );

drop policy if exists "spot_messages_merchant_insert" on public.spot_messages;
create policy "spot_messages_merchant_insert" on public.spot_messages
  for insert with check (
    sender = 'merchant'
    and spot_id in (select id from public.spots where merchant_id = auth.uid())
  );

drop policy if exists "spot_messages_merchant_update_read" on public.spot_messages;
create policy "spot_messages_merchant_update_read" on public.spot_messages
  for update using (
    spot_id in (select id from public.spots where merchant_id = auth.uid())
  );

-- ── 016: Kampagnen-Bild ─────────────────────────────────────────
alter table public.campaigns
  add column if not exists image_url text;

-- ── 017: Privacy Preferences ────────────────────────────────────
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

drop policy if exists "Users read own privacy prefs" on public.user_privacy_preferences;
create policy "Users read own privacy prefs"
  on public.user_privacy_preferences for select
  using (auth.uid() = user_id);

drop policy if exists "Users upsert own privacy prefs" on public.user_privacy_preferences;
create policy "Users upsert own privacy prefs"
  on public.user_privacy_preferences for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users update own privacy prefs" on public.user_privacy_preferences;
create policy "Users update own privacy prefs"
  on public.user_privacy_preferences for update
  using (auth.uid() = user_id);

-- ── 018: Spot-Communities ─────────────────────────────────────────
create table if not exists public.spot_communities (
  id            uuid primary key default gen_random_uuid(),
  spot_id       uuid not null references public.spots(id) on delete cascade,
  name          text not null check (char_length(trim(name)) > 0),
  emoji         text not null default '👥',
  description   text,
  perks         jsonb not null default '[]'::jsonb,
  min_visits    int not null default 5,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

create index if not exists idx_spot_communities_spot on public.spot_communities(spot_id);

create table if not exists public.spot_community_members (
  id              uuid primary key default gen_random_uuid(),
  community_id    uuid not null references public.spot_communities(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  status          text not null default 'invited'
    check (status in ('invited', 'active', 'declined', 'left')),
  visible_to_spot boolean not null default true,
  invited_at      timestamptz not null default now(),
  joined_at       timestamptz,
  unique (community_id, user_id)
);

create index if not exists idx_community_members_user on public.spot_community_members(user_id);
create index if not exists idx_community_members_community on public.spot_community_members(community_id);

alter table public.spot_communities enable row level security;
alter table public.spot_community_members enable row level security;

drop policy if exists "spot_communities_merchant" on public.spot_communities;
create policy "spot_communities_merchant" on public.spot_communities
  for all using (
    spot_id in (select id from public.spots where merchant_id = auth.uid())
  );

drop policy if exists "spot_communities_guest_read" on public.spot_communities;
create policy "spot_communities_guest_read" on public.spot_communities
  for select using (is_active = true);

drop policy if exists "community_members_merchant" on public.spot_community_members;
create policy "community_members_merchant" on public.spot_community_members
  for all using (
    community_id in (
      select c.id from public.spot_communities c
      join public.spots s on s.id = c.spot_id
      where s.merchant_id = auth.uid()
    )
  );

drop policy if exists "community_members_guest_select" on public.spot_community_members;
create policy "community_members_guest_select" on public.spot_community_members
  for select using (user_id = auth.uid());

drop policy if exists "community_members_guest_update" on public.spot_community_members;
create policy "community_members_guest_update" on public.spot_community_members
  for update using (user_id = auth.uid())
  with check (user_id = auth.uid());
