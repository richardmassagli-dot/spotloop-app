-- Dev/bootstrap: erlaubte E-Mails können sich Admin-Rechte holen und eigenen Spot freischalten.
-- Einmal in SQL Editor: insert into public.app_bootstrap_emails (email) values ('deine@email.de');

create table if not exists public.app_bootstrap_emails (
  email text primary key
);

alter table public.app_bootstrap_emails enable row level security;

create policy "bootstrap_emails_no_public"
  on public.app_bootstrap_emails
  for all
  using (false);

create or replace function public._bootstrap_email_allowed()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.app_bootstrap_emails b
    where lower(b.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

grant execute on function public._bootstrap_email_allowed() to authenticated;

create or replace function public.bootstrap_grant_admin()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  if not public._bootstrap_email_allowed() then
    raise exception 'email not in bootstrap list' using errcode = '42501';
  end if;

  update auth.users
  set
    raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || '{"is_admin": true}'::jsonb,
    raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"is_admin": true}'::jsonb
  where id = uid;
end;
$$;

grant execute on function public.bootstrap_grant_admin() to authenticated;

create or replace function public.bootstrap_approve_own_spot()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;
  if not public._bootstrap_email_allowed() then
    raise exception 'email not in bootstrap list' using errcode = '42501';
  end if;

  update public.spots
  set
    verification_status = 'verified',
    verified_at = coalesce(verified_at, now())
  where id = auth.uid()
    and merchant_id = auth.uid();
end;
$$;

grant execute on function public.bootstrap_approve_own_spot() to authenticated;
