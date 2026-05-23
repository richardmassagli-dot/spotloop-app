-- ═══════════════════════════════════════════════════════════════════
-- CHECK-IN FIX (einmalig im Supabase SQL Editor ausführen)
-- https://supabase.com/dashboard/project/jhyxufqmcwxhvwwkqhnt/sql/new
-- ═══════════════════════════════════════════════════════════════════

-- ── 019: guest_checkin RPC + Stempel-Policies ──
create or replace function public.guest_checkin(p_spot_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  spot_row public.spots%rowtype;
  stamp_row public.stamps%rowtype;
  max_pts int;
  new_pts int;
begin
  if uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  select * into spot_row
  from public.spots
  where id = p_spot_id
    and is_active = true
    and verification_status in ('verified', 'pending');

  if not found then
    raise exception 'Spot nicht für Check-in freigegeben (inaktiv oder abgelehnt).'
      using errcode = '42501';
  end if;

  max_pts := coalesce(spot_row.max_points, 10);

  select * into stamp_row
  from public.stamps
  where user_id = uid and spot_id = p_spot_id;

  if not found then
    insert into public.stamps (user_id, spot_id, points)
    values (uid, p_spot_id, 1)
    returning * into stamp_row;
  else
    new_pts := least(stamp_row.points + 1, max_pts);
    update public.stamps
    set points = new_pts, updated_at = now()
    where id = stamp_row.id
    returning * into stamp_row;
  end if;

  perform public.increment_checkins(p_spot_id);
  insert into public.checkins (user_id, spot_id) values (uid, p_spot_id);

  return jsonb_build_object(
    'id', stamp_row.id,
    'user_id', stamp_row.user_id,
    'spot_id', stamp_row.spot_id,
    'points', stamp_row.points,
    'max_points', max_pts,
    'reward_text', spot_row.reward_text,
    'reward_ready', stamp_row.points >= max_pts
  );
end;
$$;

grant execute on function public.guest_checkin(uuid) to authenticated;

drop policy if exists "stamps_insert_own" on public.stamps;
create policy "stamps_insert_own" on public.stamps
  for insert with check (
    user_id = auth.uid()
    and spot_id in (
      select id from public.spots
      where is_active = true
        and verification_status in ('verified', 'pending')
    )
  );

drop policy if exists "checkins_insert_own" on public.checkins;
create policy "checkins_insert_own" on public.checkins
  for insert with check (
    user_id = auth.uid()
    and spot_id in (
      select id from public.spots
      where is_active = true
        and verification_status in ('verified', 'pending')
    )
  );

-- ── 020: Spot lesen für Check-in (auch pending) ──
drop policy if exists "spots_select_public" on public.spots;
create policy "spots_select_public" on public.spots
  for select using (
    merchant_id = auth.uid()
    or (
      is_active = true
      and verification_status in ('verified', 'pending')
    )
  );

create or replace function public.get_spot_checkin(p_spot_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  row public.spots%rowtype;
begin
  select * into row
  from public.spots
  where id = p_spot_id
    and is_active = true
    and verification_status in ('verified', 'pending');

  if not found then
    return null;
  end if;

  return jsonb_build_object(
    'id', row.id,
    'merchant_id', row.merchant_id,
    'name', row.name,
    'category', row.category,
    'area', row.area,
    'emoji', row.emoji,
    'bg_color', row.bg_color,
    'max_points', row.max_points,
    'reward_text', row.reward_text,
    'current_action', row.current_action,
    'verification_status', row.verification_status,
    'is_active', row.is_active,
    'total_checkins', row.total_checkins
  );
end;
$$;

grant execute on function public.get_spot_checkin(uuid) to authenticated;
grant execute on function public.get_spot_checkin(uuid) to anon;

-- Optional: alle aktiven pending-Spots für Check-in freischalten
update public.spots
set verification_status = 'verified', verified_at = coalesce(verified_at, now())
where verification_status = 'pending' and is_active = true;
