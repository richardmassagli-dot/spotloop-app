-- Robustere is_app_admin: JSON-Boolean true im JWT, nicht nur ->> Text
-- Einmal im SQL Editor ausführen (nach 002_admin_approve_spot.sql).

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
