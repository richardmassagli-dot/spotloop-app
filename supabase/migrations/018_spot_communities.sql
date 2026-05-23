-- Spot-Communities: Clubs für loyale Members (privacy-first, Einladung + Zustimmung)

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

-- Merchant: eigene Spot-Communities verwalten
drop policy if exists "spot_communities_merchant" on public.spot_communities;
create policy "spot_communities_merchant" on public.spot_communities
  for all using (
    spot_id in (select id from public.spots where merchant_id = auth.uid())
  );

-- Gast: Communities des Spots lesen (öffentliche Infos)
drop policy if exists "spot_communities_guest_read" on public.spot_communities;
create policy "spot_communities_guest_read" on public.spot_communities
  for select using (is_active = true);

-- Merchant: Mitglieder am eigenen Spot verwalten
drop policy if exists "community_members_merchant" on public.spot_community_members;
create policy "community_members_merchant" on public.spot_community_members
  for all using (
    community_id in (
      select c.id from public.spot_communities c
      join public.spots s on s.id = c.spot_id
      where s.merchant_id = auth.uid()
    )
  );

-- Gast: eigene Mitgliedschaften
drop policy if exists "community_members_guest_select" on public.spot_community_members;
create policy "community_members_guest_select" on public.spot_community_members
  for select using (user_id = auth.uid());

drop policy if exists "community_members_guest_update" on public.spot_community_members;
create policy "community_members_guest_update" on public.spot_community_members
  for update using (user_id = auth.uid())
  with check (user_id = auth.uid());
