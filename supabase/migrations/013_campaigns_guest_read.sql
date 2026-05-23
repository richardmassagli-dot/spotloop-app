-- Follower dürfen Kampagnen/Posts von Spots lesen, denen sie folgen

drop policy if exists "campaigns_select_follower" on public.campaigns;

create policy "campaigns_select_follower" on public.campaigns
  for select using (
    spot_id in (
      select spot_id from public.follows
      where user_id = auth.uid()
    )
  );
