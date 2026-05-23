-- Einmal im Supabase SQL Editor ausführen (Projekt: jhyxufqmcwxhvwwkqhnt)
-- https://supabase.com/dashboard/project/jhyxufqmcwxhvwwkqhnt/sql/new

-- 012: Händler darf Posts/Kampagnen speichern
drop policy if exists "campaigns_insert_merchant" on public.campaigns;

create policy "campaigns_insert_merchant" on public.campaigns
  for insert with check (
    spot_id in (
      select id from public.spots
      where merchant_id = auth.uid()
    )
  );

-- 013: Follower lesen Kampagnen
drop policy if exists "campaigns_select_follower" on public.campaigns;

create policy "campaigns_select_follower" on public.campaigns
  for select using (
    spot_id in (
      select spot_id from public.follows
      where user_id = auth.uid()
    )
  );

-- 014: RPC für Gast-Feed (My Spots + Spot-Updates)
create or replace function public.get_spot_campaign_updates(p_spot_id uuid)
returns setof public.campaigns
language sql
security definer
set search_path = public
stable
as $$
  select c.*
  from public.campaigns c
  inner join public.spots s on s.id = c.spot_id
  where c.spot_id = p_spot_id
    and s.is_active = true
    and (
      s.verification_status = 'verified'
      or s.merchant_id = auth.uid()
    )
  order by c.created_at desc
  limit 40;
$$;

create or replace function public.get_guest_followed_updates()
returns setof public.campaigns
language sql
security definer
set search_path = public
stable
as $$
  select c.*
  from public.campaigns c
  where c.spot_id in (
    select f.spot_id from public.follows f where f.user_id = auth.uid()
    union
    select st.spot_id from public.stamps st where st.user_id = auth.uid()
  )
  order by c.created_at desc
  limit 80;
$$;

revoke all on function public.get_spot_campaign_updates(uuid) from public;
revoke all on function public.get_guest_followed_updates() from public;
grant execute on function public.get_spot_campaign_updates(uuid) to authenticated;
grant execute on function public.get_guest_followed_updates() to authenticated;

-- 015: Gast ↔ Spot Nachrichten (Merchant-Inbox + Antworten)
-- Vollständiges SQL: supabase/migrations/015_spot_messages.sql
