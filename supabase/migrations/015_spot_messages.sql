-- Gast ↔ Spot Nachrichten (Merchant-Inbox + Antworten)

create table if not exists public.spot_messages (
  id              uuid primary key default gen_random_uuid(),
  spot_id         uuid not null references public.spots(id) on delete cascade,
  guest_user_id   uuid not null references auth.users(id) on delete cascade,
  thread_id       uuid not null,
  sender          text not null check (sender in ('guest', 'merchant')),
  body            text not null check (char_length(trim(body)) > 0),
  merchant_read   boolean not null default false,
  guest_read      boolean not null default false,
  created_at      timestamptz not null default now()
);

create index if not exists idx_spot_messages_spot on public.spot_messages(spot_id, created_at desc);
create index if not exists idx_spot_messages_thread on public.spot_messages(thread_id, created_at asc);
create index if not exists idx_spot_messages_guest on public.spot_messages(guest_user_id, created_at desc);

alter table public.spot_messages enable row level security;

-- Gast: eigene Threads lesen + erste Nachricht / Antwort im Thread
create policy "spot_messages_guest_select" on public.spot_messages
  for select using (guest_user_id = auth.uid());

create policy "spot_messages_guest_insert" on public.spot_messages
  for insert with check (
    sender = 'guest'
    and guest_user_id = auth.uid()
    and spot_id in (
      select id from public.spots
      where verification_status = 'verified' and is_active = true
    )
  );

create policy "spot_messages_guest_update_read" on public.spot_messages
  for update using (guest_user_id = auth.uid())
  with check (guest_user_id = auth.uid());

-- Merchant: alle Nachrichten am eigenen Spot
create policy "spot_messages_merchant_select" on public.spot_messages
  for select using (
    spot_id in (select id from public.spots where merchant_id = auth.uid())
  );

create policy "spot_messages_merchant_insert" on public.spot_messages
  for insert with check (
    sender = 'merchant'
    and spot_id in (select id from public.spots where merchant_id = auth.uid())
  );

create policy "spot_messages_merchant_update_read" on public.spot_messages
  for update using (
    spot_id in (select id from public.spots where merchant_id = auth.uid())
  );
