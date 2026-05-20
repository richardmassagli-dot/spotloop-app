-- Nach Migration: im Supabase SQL Editor ausführen — erwartet je 1 Zeile pro Abfrage.

-- RPCs vorhanden?
select proname, prokind
from pg_proc
where pronamespace = (select oid from pg_namespace where nspname = 'public')
  and proname in ('is_app_admin', 'admin_approve_spot');

-- Admin-Select-Policy auf spots?
select schemaname, tablename, policyname, cmd, qual
from pg_policies
where tablename = 'spots'
  and policyname = 'spots_select_admin';
