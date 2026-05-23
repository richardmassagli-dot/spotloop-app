-- Koordinaten für Karte / Discover (fehlt oft bei älterem Setup aus SUPABASE_SETUP.md)
alter table public.spots
  add column if not exists lat double precision,
  add column if not exists lng double precision;
