-- myspot production schema (Supabase / Postgres)
-- Run once in: Supabase Dashboard → SQL → New query → Run

-- ─── Tables ───────────────────────────────────────────────────────

create table if not exists public.spots (
  id              uuid primary key references auth.users(id) on delete cascade,
  merchant_id     uuid not null references auth.users(id) on delete cascade,
  name            text not null,
  category        text,
  area            text,
  address         text,
  description     text default '',
  reward_text     text default 'Gratis Kaffee',
  max_points      int not null default 10 check (max_points > 0),
  emoji           text default '☕',
  bg_color        text default '#1B4FD8',
  lat             double precision,
  lng             double precision,
  current_action  text,
  is_active       boolean not null default true,
  verification_status text not null default 'pending'
    check (verification_status in ('pending', 'verified', 'rejected')),
  verification_note   text,
  verified_at         timestamptz,
  total_checkins  int not null default 0,
  followers       int not null default 0,
  created_at      timestamptz not null default now()
);

create index if not exists idx_spots_verification on public.spots(verification_status);

create table if not exists public.stamps (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  spot_id     uuid not null references public.spots(id) on delete cascade,
  points      int not null default 0 check (points >= 0),
  updated_at  timestamptz not null default now(),
  unique (user_id, spot_id)
);

create table if not exists public.follows (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  spot_id     uuid not null references public.spots(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, spot_id)
);

create table if not exists public.campaigns (
  id          uuid primary key default gen_random_uuid(),
  spot_id     uuid not null references public.spots(id) on delete cascade,
  type        text,
  message     text not null,
  spot_name   text,
  status      text not null default 'gesendet',
  created_at  timestamptz not null default now()
);

create table if not exists public.checkins (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  spot_id     uuid not null references public.spots(id) on delete cascade,
  created_at  timestamptz not null default now()
);

create index if not exists idx_stamps_user on public.stamps(user_id);
create index if not exists idx_stamps_spot on public.stamps(spot_id);
create index if not exists idx_follows_user on public.follows(user_id);
create index if not exists idx_checkins_spot on public.checkins(spot_id, created_at desc);

-- ─── RPC helpers ──────────────────────────────────────────────────

create or replace function public.increment_checkins(spot_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.spots
  set total_checkins = total_checkins + 1
  where id = spot_id;
end;
$$;

create or replace function public.increment_followers(spot_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.spots
  set followers = followers + 1
  where id = spot_id;
end;
$$;

create or replace function public.decrement_followers(spot_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.spots
  set followers = greatest(followers - 1, 0)
  where id = spot_id;
end;
$$;

-- Merchants cannot self-approve (admin sets status via SQL / service role)
create or replace function public.spots_guard_verification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and auth.uid() = new.merchant_id then
    if tg_op = 'INSERT' then
      new.verification_status := 'pending';
      new.verification_note := null;
      new.verified_at := null;
    elsif tg_op = 'UPDATE' then
      new.verification_status := old.verification_status;
      new.verification_note := old.verification_note;
      new.verified_at := old.verified_at;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists spots_guard_verification on public.spots;
create trigger spots_guard_verification
  before insert or update on public.spots
  for each row execute function public.spots_guard_verification();

-- ─── Row Level Security ───────────────────────────────────────────

alter table public.spots enable row level security;
alter table public.stamps enable row level security;
alter table public.follows enable row level security;
alter table public.campaigns enable row level security;
alter table public.checkins enable row level security;

-- Spots: guests only see verified + active; merchant always sees own row
create policy "spots_select_public" on public.spots
  for select using (
    merchant_id = auth.uid()
    or (is_active = true and verification_status = 'verified')
  );

create policy "spots_insert_own" on public.spots
  for insert with check (
    merchant_id = auth.uid() and id = auth.uid() and verification_status = 'pending'
  );

create policy "spots_update_own" on public.spots
  for update using (merchant_id = auth.uid());

-- Stamps: guests manage own; merchants read stamps at their spot
create policy "stamps_select_own" on public.stamps
  for select using (
    user_id = auth.uid()
    or spot_id in (select id from public.spots where merchant_id = auth.uid())
  );

create policy "stamps_insert_own" on public.stamps
  for insert with check (
    user_id = auth.uid()
    and spot_id in (
      select id from public.spots
      where verification_status = 'verified' and is_active = true
    )
  );

create policy "stamps_update_own" on public.stamps
  for update using (user_id = auth.uid());

-- Follows
create policy "follows_select_own" on public.follows
  for select using (user_id = auth.uid());

create policy "follows_insert_own" on public.follows
  for insert with check (user_id = auth.uid());

create policy "follows_delete_own" on public.follows
  for delete using (user_id = auth.uid());

-- Campaigns: merchant only
create policy "campaigns_select_merchant" on public.campaigns
  for select using (
    spot_id in (select id from public.spots where merchant_id = auth.uid())
  );

create policy "campaigns_insert_merchant" on public.campaigns
  for insert with check (
    spot_id in (
      select id from public.spots
      where merchant_id = auth.uid() and verification_status = 'verified'
    )
  );

-- Check-ins: guest inserts own; merchant reads for their spot
create policy "checkins_insert_own" on public.checkins
  for insert with check (
    user_id = auth.uid()
    and spot_id in (
      select id from public.spots
      where verification_status = 'verified' and is_active = true
    )
  );

create policy "checkins_select" on public.checkins
  for select using (
    user_id = auth.uid()
    or spot_id in (select id from public.spots where merchant_id = auth.uid())
  );

-- ─── Admin (User Metadata is_admin = true) ───────────────────────

create or replace function public.is_app_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    (auth.jwt() -> 'user_metadata' -> 'is_admin') = 'true'::jsonb
    or (auth.jwt() -> 'app_metadata' -> 'is_admin') = 'true'::jsonb
    or lower(coalesce(auth.jwt() -> 'user_metadata' ->> 'is_admin', '')) in ('true', '1', 't', 'yes')
    or lower(coalesce(auth.jwt() -> 'app_metadata' ->> 'is_admin', '')) in ('true', '1', 't', 'yes');
$$;

grant execute on function public.is_app_admin() to authenticated;

create policy "spots_select_admin" on public.spots
  for select using (public.is_app_admin());

create or replace function public.admin_approve_spot(target_spot_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_app_admin() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  update public.spots
  set
    verification_status = 'verified',
    verified_at = coalesce(verified_at, now())
  where id = target_spot_id
    and verification_status = 'pending';

  if not found then
    if exists (select 1 from public.spots where id = target_spot_id) then
      raise exception 'spot not pending' using errcode = 'P0001';
    else
      raise exception 'spot not found' using errcode = 'P0002';
    end if;
  end if;
end;
$$;

grant execute on function public.admin_approve_spot(uuid) to authenticated;

-- Realtime (enable in Dashboard → Database → Replication if needed)
-- alter publication supabase_realtime add table spots, stamps;
