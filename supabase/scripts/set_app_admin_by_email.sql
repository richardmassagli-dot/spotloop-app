-- Set is_admin in raw_user_meta_data for password login (read by client as user_metadata).
-- Replace YOUR_EMAIL with the exact address you use to log in (case-insensitive match).
-- Run in Supabase SQL Editor as a privileged user.

UPDATE auth.users
SET raw_user_meta_data =
  COALESCE(raw_user_meta_data, '{}'::jsonb)
  || jsonb_build_object('is_admin', true)
WHERE lower(email) = lower(trim('YOUR_EMAIL'))
RETURNING id, email;

-- Erwartung: genau eine Zeile. Keine Zeile → E-Mail passt zu keinem auth.users-Eintrag.
-- Danach in der App neu anmelden, damit das JWT den Claim enthält.
