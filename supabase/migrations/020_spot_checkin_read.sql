-- Gäste dürfen Spots für Check-in lesen (auch „pending“), nicht nur in Discover

drop policy if exists "spots_select_public" on public.spots;
create policy "spots_select_public" on public.spots
  for select using (
    merchant_id = auth.uid()
    or (
      is_active = true
      and verification_status in ('verified', 'pending')
    )
  );

-- Spot-Metadaten für Check-in (falls RLS-Join scheitert)
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
