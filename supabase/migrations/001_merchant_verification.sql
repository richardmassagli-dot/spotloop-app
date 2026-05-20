-- Merchant verification (run in Supabase SQL Editor if schema.sql was already applied)

alter table public.spots
  add column if not exists verification_status text not null default 'pending'
    check (verification_status in ('pending', 'verified', 'rejected')),
  add column if not exists verification_note text,
  add column if not exists verified_at timestamptz;

create index if not exists idx_spots_verification on public.spots(verification_status);

-- Prevent merchants from self-approving
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

-- Replace spot read policy: guests only see verified active spots
drop policy if exists "spots_select_active" on public.spots;
create policy "spots_select_public" on public.spots
  for select using (
    merchant_id = auth.uid()
    or (is_active = true and verification_status = 'verified')
  );

drop policy if exists "spots_insert_own" on public.spots;
create policy "spots_insert_own" on public.spots
  for insert with check (
    merchant_id = auth.uid()
    and id = auth.uid()
    and verification_status = 'pending'
  );

-- Stamps/check-ins only at verified spots
drop policy if exists "stamps_insert_own" on public.stamps;
create policy "stamps_insert_own" on public.stamps
  for insert with check (
    user_id = auth.uid()
    and spot_id in (
      select id from public.spots
      where verification_status = 'verified' and is_active = true
    )
  );

drop policy if exists "checkins_insert_own" on public.checkins;
create policy "checkins_insert_own" on public.checkins
  for insert with check (
    user_id = auth.uid()
    and spot_id in (
      select id from public.spots
      where verification_status = 'verified' and is_active = true
    )
  );

drop policy if exists "campaigns_insert_merchant" on public.campaigns;
create policy "campaigns_insert_merchant" on public.campaigns
  for insert with check (
    spot_id in (
      select id from public.spots
      where merchant_id = auth.uid() and verification_status = 'verified'
    )
  );

-- Existing rows: keep visible if already live (optional — new installs use pending)
update public.spots
set verification_status = 'verified', verified_at = coalesce(verified_at, now())
where verification_status = 'pending' and is_active = true and total_checkins > 0;
