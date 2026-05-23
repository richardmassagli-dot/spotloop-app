-- Einmal in Supabase → SQL Editor ausführen (nach Migration 004_bootstrap_dev.sql)
-- Ersetze die E-Mail durch deine Login-Adresse:

insert into public.app_bootstrap_emails (email)
values ('deine@email.de')
on conflict (email) do nothing;
