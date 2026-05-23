-- Händler dürfen Posts/Kampagnen für den eigenen Spot speichern (auch vor Freischaltung)

drop policy if exists "campaigns_insert_merchant" on public.campaigns;

create policy "campaigns_insert_merchant" on public.campaigns
  for insert with check (
    spot_id in (
      select id from public.spots
      where merchant_id = auth.uid()
    )
  );
