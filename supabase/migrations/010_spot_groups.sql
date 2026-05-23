-- Spot-Gruppen: Hauptmarke, Standorte, Untergruppen, Community-, Event- und Reward-Gruppen

create table if not exists public.spot_groups (
  id            uuid primary key default gen_random_uuid(),
  merchant_id   uuid not null references auth.users(id) on delete cascade,
  parent_id     uuid references public.spot_groups(id) on delete cascade,
  type          text not null check (type in (
    'brand', 'location', 'subgroup', 'community', 'event', 'reward'
  )),
  name          text not null,
  slug          text,
  emoji         text default '🏪',
  description   text default '',
  config        jsonb not null default '{}'::jsonb,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

create index if not exists idx_spot_groups_merchant on public.spot_groups(merchant_id);
create index if not exists idx_spot_groups_parent on public.spot_groups(parent_id);
create index if not exists idx_spot_groups_type on public.spot_groups(type);

create table if not exists public.spot_group_members (
  id          uuid primary key default gen_random_uuid(),
  group_id    uuid not null references public.spot_groups(id) on delete cascade,
  spot_id     uuid not null references public.spots(id) on delete cascade,
  is_primary  boolean not null default false,
  created_at  timestamptz not null default now(),
  unique (group_id, spot_id)
);

create index if not exists idx_spot_group_members_spot on public.spot_group_members(spot_id);
create index if not exists idx_spot_group_members_group on public.spot_group_members(group_id);

alter table public.spot_groups enable row level security;
alter table public.spot_group_members enable row level security;

-- Gäste & Merchants: aktive Gruppen lesen
drop policy if exists "spot_groups_select" on public.spot_groups;
create policy "spot_groups_select" on public.spot_groups
  for select using (is_active = true or merchant_id = auth.uid());

drop policy if exists "spot_groups_manage" on public.spot_groups;
create policy "spot_groups_manage" on public.spot_groups
  for all using (merchant_id = auth.uid())
  with check (merchant_id = auth.uid());

drop policy if exists "spot_group_members_select" on public.spot_group_members;
create policy "spot_group_members_select" on public.spot_group_members
  for select using (
    group_id in (select id from public.spot_groups where is_active = true or merchant_id = auth.uid())
  );

drop policy if exists "spot_group_members_manage" on public.spot_group_members;
create policy "spot_group_members_manage" on public.spot_group_members
  for all using (
    group_id in (select id from public.spot_groups where merchant_id = auth.uid())
  )
  with check (
    group_id in (select id from public.spot_groups where merchant_id = auth.uid())
  );
