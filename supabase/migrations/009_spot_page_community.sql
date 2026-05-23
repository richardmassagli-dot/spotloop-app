-- Spot page customization + VIP community

alter table public.spots
  add column if not exists page_config jsonb not null default '{}'::jsonb;

create table if not exists public.spot_vip_guests (
  id            uuid primary key default gen_random_uuid(),
  spot_id       uuid not null references public.spots(id) on delete cascade,
  display_name  text not null,
  email         text,
  tier          text not null default 'stammgast'
    check (tier in ('stammgast', 'vip')),
  visits        int not null default 0,
  vip_reward    text default 'VIP Reward',
  bonus_points  int not null default 2,
  note          text,
  created_at    timestamptz not null default now()
);

create index if not exists idx_spot_vip_spot on public.spot_vip_guests(spot_id);

alter table public.spot_vip_guests enable row level security;

create policy "spot_vip_merchant" on public.spot_vip_guests
  for all using (
    spot_id in (select id from public.spots where merchant_id = auth.uid())
  );
