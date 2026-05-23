-- Spotloop Social (friends, collections, polls, moments) — einmal im SQL Editor ausführen

-- ─── Friend graph ─────────────────────────────────────────────────
create table if not exists public.friend_requests (
  id          uuid primary key default gen_random_uuid(),
  from_user   uuid not null references auth.users(id) on delete cascade,
  to_user     uuid not null references auth.users(id) on delete cascade,
  status      text not null default 'pending'
    check (status in ('pending', 'accepted', 'declined')),
  created_at  timestamptz not null default now(),
  unique (from_user, to_user)
);

create table if not exists public.friendships (
  id          uuid primary key default gen_random_uuid(),
  user_a      uuid not null references auth.users(id) on delete cascade,
  user_b      uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_a, user_b),
  check (user_a < user_b)
);

-- ─── Collections ────────────────────────────────────────────────────
create table if not exists public.collections (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  emoji       text default '✨',
  visibility  text not null default 'private'
    check (visibility in ('private', 'friends')),
  created_at  timestamptz not null default now()
);

create table if not exists public.collection_spots (
  collection_id uuid not null references public.collections(id) on delete cascade,
  spot_id       uuid not null references public.spots(id) on delete cascade,
  note          text,
  added_at      timestamptz not null default now(),
  primary key (collection_id, spot_id)
);

-- ─── Group polls ──────────────────────────────────────────────────
create table if not exists public.group_polls (
  id          uuid primary key default gen_random_uuid(),
  creator_id  uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  status      text not null default 'open' check (status in ('open', 'closed')),
  winner_spot_id uuid references public.spots(id),
  created_at  timestamptz not null default now(),
  closes_at   timestamptz
);

create table if not exists public.group_poll_options (
  id          uuid primary key default gen_random_uuid(),
  poll_id     uuid not null references public.group_polls(id) on delete cascade,
  spot_id     uuid not null references public.spots(id) on delete cascade,
  sort_order  int not null default 0
);

create table if not exists public.group_poll_votes (
  poll_id     uuid not null references public.group_polls(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  option_id   uuid not null references public.group_poll_options(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (poll_id, user_id)
);

create table if not exists public.poll_invites (
  poll_id     uuid not null references public.group_polls(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  primary key (poll_id, user_id)
);

-- ─── Food moments & activity ────────────────────────────────────────
create table if not exists public.food_moments (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  spot_id     uuid not null references public.spots(id) on delete cascade,
  photo_url   text,
  caption     text,
  dish        text,
  rating      int check (rating is null or (rating >= 1 and rating <= 5)),
  visibility  text not null default 'friends'
    check (visibility in ('private', 'friends', 'public')),
  created_at  timestamptz not null default now()
);

create table if not exists public.spot_shares (
  id          uuid primary key default gen_random_uuid(),
  from_user   uuid not null references auth.users(id) on delete cascade,
  to_user     uuid references auth.users(id) on delete cascade,
  spot_id     uuid not null references public.spots(id) on delete cascade,
  message     text,
  created_at  timestamptz not null default now()
);

create table if not exists public.social_preferences (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  show_activity       boolean not null default true,
  show_visited_spots  boolean not null default true,
  show_on_social_map  boolean not null default true,
  moments_visibility  text not null default 'friends',
  collections_default text not null default 'private',
  updated_at  timestamptz not null default now()
);

-- ─── RLS (minimal — expand in production) ─────────────────────────
alter table public.friend_requests enable row level security;
alter table public.friendships enable row level security;
alter table public.collections enable row level security;
alter table public.collection_spots enable row level security;
alter table public.group_polls enable row level security;
alter table public.group_poll_options enable row level security;
alter table public.group_poll_votes enable row level security;
alter table public.poll_invites enable row level security;
alter table public.food_moments enable row level security;
alter table public.spot_shares enable row level security;
alter table public.social_preferences enable row level security;

create policy "friend_requests_own" on public.friend_requests
  for all using (auth.uid() = from_user or auth.uid() = to_user);

create policy "friendships_own" on public.friendships
  for select using (auth.uid() = user_a or auth.uid() = user_b);

create policy "collections_own" on public.collections
  for all using (auth.uid() = owner_id);

create policy "collection_spots_owner" on public.collection_spots
  for all using (
    collection_id in (select id from public.collections where owner_id = auth.uid())
  );

create policy "polls_participant" on public.group_polls
  for select using (
    creator_id = auth.uid()
    or id in (select poll_id from public.poll_invites where user_id = auth.uid())
  );

create policy "polls_create" on public.group_polls
  for insert with check (auth.uid() = creator_id);

create policy "moments_read" on public.food_moments
  for select using (
    user_id = auth.uid()
    or visibility = 'public'
    or (visibility = 'friends' and user_id in (
      select user_b from public.friendships where user_a = auth.uid()
      union select user_a from public.friendships where user_b = auth.uid()
    ))
  );

create policy "moments_write" on public.food_moments
  for insert with check (auth.uid() = user_id);

create policy "social_prefs_own" on public.social_preferences
  for all using (auth.uid() = user_id);
