-- Admin: Spots verifizieren — Migration (einmal im SQL Editor ausführen)
-- Voraussetzung: Admin mit User Metadata {"is_admin": true}
-- Siehe ADMIN_VERIFICATION.md im Projektroot

create or replace function public.is_app_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    lower(coalesce(auth.jwt() -> 'user_metadata' ->> 'is_admin', '')) in ('true', '1', 't', 'yes'),
    false
  )
  or coalesce(
    lower(coalesce(auth.jwt() -> 'app_metadata' ->> 'is_admin', '')) in ('true', '1', 't', 'yes'),
    false
  );
$$;

grant execute on function public.is_app_admin() to authenticated;

drop policy if exists "spots_select_admin" on public.spots;
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
