-- Kampagnen-Bild (URL oder komprimiertes Data-URL)

alter table public.campaigns
  add column if not exists image_url text;
