-- Follower-Tabelle (Gast folgt einem Spot) — einmal im SQL Editor ausführen

create table if not exists public.follows (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  spot_id     uuid not null references public.spots(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, spot_id)
);

create index if not exists idx_follows_user on public.follows(user_id);
create index if not exists idx_follows_spot on public.follows(spot_id);

-- Zähler auf spots (Anzeige im Dashboard)
create or replace function public.increment_followers(spot_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.spots set followers = followers + 1 where id = spot_id;
end;
$$;

create or replace function public.decrement_followers(spot_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.spots set followers = greatest(followers - 1, 0) where id = spot_id;
end;
$$;

grant execute on function public.increment_followers(uuid) to authenticated;
grant execute on function public.decrement_followers(uuid) to authenticated;

alter table public.follows enable row level security;

drop policy if exists "follows_select_own" on public.follows;
drop policy if exists "follows_insert_own" on public.follows;
drop policy if exists "follows_delete_own" on public.follows;
drop policy if exists "follows_select_merchant" on public.follows;
drop policy if exists "Eigene Follows" on public.follows;

-- Gast: eigene Follows sehen / anlegen / entfernen
create policy "follows_select_own" on public.follows
  for select using (user_id = auth.uid());

create policy "follows_insert_own" on public.follows
  for insert with check (user_id = auth.uid());

create policy "follows_delete_own" on public.follows
  for delete using (user_id = auth.uid());

-- Händler: Follower seines Spots in der App / Table Editor (eingeloggt)
create policy "follows_select_merchant" on public.follows
  for select using (
    spot_id in (select id from public.spots where merchant_id = auth.uid())
  );
