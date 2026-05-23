-- Social profiles + missing RLS + friend lookup by email

create table if not exists public.social_profiles (
  user_id           uuid primary key references auth.users(id) on delete cascade,
  display_name      text not null,
  avatar_initials   text,
  color             text default '#1B4FD8',
  updated_at        timestamptz not null default now()
);

alter table public.social_profiles enable row level security;

create policy "social_profiles_read" on public.social_profiles
  for select using (true);

create policy "social_profiles_upsert_own" on public.social_profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Friend request by email (security definer — only returns id)
create or replace function public.find_user_id_by_email(p_email text)
returns uuid
language sql
security definer
set search_path = public
as $$
  select id from auth.users where lower(email) = lower(trim(p_email)) limit 1;
$$;

revoke all on function public.find_user_id_by_email(text) from public;
grant execute on function public.find_user_id_by_email(text) to authenticated;

-- Friendships: insert/delete for participants
create policy "friendships_insert" on public.friendships
  for insert with check (auth.uid() = user_a or auth.uid() = user_b);

create policy "friendships_delete" on public.friendships
  for delete using (auth.uid() = user_a or auth.uid() = user_b);

create policy "friend_requests_update" on public.friend_requests
  for update using (auth.uid() = to_user);

create policy "friend_requests_insert" on public.friend_requests
  for insert with check (auth.uid() = from_user);

-- Poll options & votes
create policy "poll_options_read" on public.group_poll_options
  for select using (
    poll_id in (
      select id from public.group_polls where creator_id = auth.uid()
      union select poll_id from public.poll_invites where user_id = auth.uid()
    )
  );

create policy "poll_options_insert" on public.group_poll_options
  for insert with check (
    poll_id in (select id from public.group_polls where creator_id = auth.uid())
  );

create policy "poll_votes_read" on public.group_poll_votes
  for select using (
    poll_id in (
      select id from public.group_polls where creator_id = auth.uid()
      union select poll_id from public.poll_invites where user_id = auth.uid()
    )
  );

create policy "poll_votes_upsert" on public.group_poll_votes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "poll_invites_read" on public.poll_invites
  for select using (user_id = auth.uid() or poll_id in (
    select id from public.group_polls where creator_id = auth.uid()
  ));

create policy "poll_invites_insert" on public.poll_invites
  for insert with check (
    poll_id in (select id from public.group_polls where creator_id = auth.uid())
  );

create policy "spot_shares_own" on public.spot_shares
  for all using (auth.uid() = from_user or auth.uid() = to_user);

-- Collections visible to friends
create policy "collections_friends_read" on public.collections
  for select using (
    owner_id = auth.uid()
    or (
      visibility = 'friends'
      and owner_id in (
        select user_b from public.friendships where user_a = auth.uid()
        union select user_a from public.friendships where user_b = auth.uid()
      )
    )
  );
