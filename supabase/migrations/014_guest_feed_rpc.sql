-- Gast-Feed: Kampagnen/Posts lesen (unabhängig von RLS-Policy 013)
-- Im Supabase SQL Editor ausführen, wenn Gäste Posts/Kampagnen nicht sehen.

-- Updates eines Spots (Spot-Detail „Updates“-Tab)
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

-- My Spots + Glocke: gefolgte Spots + Stempelkarten
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
