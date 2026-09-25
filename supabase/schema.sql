-- Kelvjessia — real database schema
-- ===================================================================
-- Run this whole file once in the Supabase SQL Editor for this project
-- (Dashboard → SQL Editor → New query → paste → Run). It's written to
-- be safe to re-run (drops/recreates policies and triggers, uses
-- `if not exists` on tables) so you can paste it again after edits.
--
-- What this replaces:
--   - src/lib/mock-data.ts        (MOCK_HISTORY, MOCK_ACTIVE_TRIP,
--                                   MOCK_NOTIFICATIONS, MOCK_WALLET_*)
--   - src/lib/admin-data.ts       (OPS_TRIPS)
--   - the "everything lives in the URL query string" booking flow
--
-- What stays as-is (deliberately NOT moved into the DB this pass):
--   - src/lib/routes-data.ts's DESTINATIONS/fares — a `destinations`
--     table is seeded below so dispatchers can eventually edit fares
--     from the DB instead of a redeploy, but the app still reads the
--     static file for now. Swapping every synchronous getDestination()
--     call to an async DB read touches ~10 files for comparatively
--     little user-facing benefit right now — worth its own follow-up.
-- ===================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------
-- profiles — one row per auth.users row. Holds the role (passenger /
-- driver / dispatcher / admin) that admin-auth.ts's env allowlist was
-- always meant to be replaced by, plus the notification toggles from
-- Profile → Notification settings (so those switches persist instead
-- of resetting to their defaults on every page load).
-- ---------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  affiliate_id text,
  default_pickup text,
  role text not null default 'passenger'
    check (role in ('passenger', 'driver', 'dispatcher', 'admin')),
  notify_trip_updates boolean not null default true,
  notify_delivery_updates boolean not null default true,
  notify_promotional boolean not null default false,
  notify_sms boolean not null default true,
  created_at timestamptz not null default now()
);

-- Safe to re-run: adds these two columns if an earlier version of this
-- script already created the table without them.
alter table profiles add column if not exists affiliate_id text;
alter table profiles add column if not exists default_pickup text;

-- Auto-creates a profile row the moment someone signs up, so the app
-- never has to special-case "no profile row yet".
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------
-- destinations — seed of the current DESTINATIONS array in
-- src/lib/routes-data.ts, kept in sync manually for now (see note
-- above). Lets a future admin screen edit fares without a redeploy.
-- ---------------------------------------------------------------
create table if not exists destinations (
  slug text primary key,
  city text not null,
  fare_naira integer not null,
  package_fare_naira integer not null,
  duration_minutes integer not null,
  lat double precision not null,
  lng double precision not null
);

insert into destinations (slug, city, fare_naira, package_fare_naira, duration_minutes, lat, lng) values
  ('festac',    'Festac',    3500, 2900, 100, 6.4649, 3.2836),
  ('maryland',  'Maryland',  3200, 2600, 80,  6.5698, 3.3670),
  ('ago',       'Ago',       3500, 2900, 95,  6.4726, 3.2996),
  ('surulere',  'Surulere',  3400, 2800, 90,  6.4991, 3.3548),
  ('falomo',    'Falomo',    3000, 2500, 70,  6.4522, 3.4341),
  ('lekki',     'Lekki',     2600, 2100, 55,  6.4698, 3.5852),
  ('ajah',      'Ajah',      2200, 1800, 40,  6.4667, 3.5833),
  ('sangotedo', 'Sangotedo', 2000, 1600, 30,  6.4560, 3.6270)
on conflict (slug) do update set
  city = excluded.city,
  fare_naira = excluded.fare_naira,
  package_fare_naira = excluded.package_fare_naira,
  duration_minutes = excluded.duration_minutes,
  lat = excluded.lat,
  lng = excluded.lng;

-- ---------------------------------------------------------------
-- bookings — the real replacement for "pass everything via URL
-- params". One row per seat or package booking. Also carries the
-- live-tracking fields (trip_status/progress_percent/current_lat/lng)
-- directly on the booking, since this app dispatches per-booking
-- rather than batching several bookings onto one tracked bus run —
-- a dispatcher updates these fields from /admin, and Track Trip
-- subscribes to them via Realtime.
-- ---------------------------------------------------------------
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  reference text not null unique,

  kind text not null check (kind in ('seat', 'package')),
  destination_slug text not null,
  direction text not null default 'outbound' check (direction in ('outbound', 'return')),
  from_city text not null,
  to_city text not null,

  -- seat-booking fields
  seats text[],
  passengers integer,
  day text,
  date text,
  time text,

  -- package-booking fields
  description text,
  category text,
  declared_value_naira integer,
  size_id text,
  fragile boolean,
  recipient_name text,
  recipient_phone text,

  pickup_point text,
  dropoff_point text,

  amount_naira integer not null,
  paid_status text not null default 'paid' check (paid_status in ('paid', 'pickup', 'wallet')),
  payment_method text,

  -- dispatch / live tracking — set by /admin, read by Track Trip
  bus_plate text,
  driver_name text,
  driver_phone text,
  trip_status text not null default 'scheduled'
    check (trip_status in ('scheduled', 'boarding', 'in_transit', 'delayed', 'arrived', 'cancelled')),
  progress_percent integer not null default 0,
  current_lat double precision,
  current_lng double precision,
  note text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bookings_user_id_idx on bookings (user_id);
create index if not exists bookings_reference_idx on bookings (reference);

create or replace function touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists bookings_touch_updated_at on bookings;
create trigger bookings_touch_updated_at
  before update on bookings
  for each row execute function touch_updated_at();

-- ---------------------------------------------------------------
-- notifications — real per-user notifications, replacing
-- MOCK_NOTIFICATIONS. A trigger below adds one automatically the
-- moment a booking is created, so "Notifications" always has
-- something real to show without any extra app code.
-- ---------------------------------------------------------------
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category text not null default 'trip' check (category in ('trip', 'delivery', 'offer')),
  title text not null,
  body text not null,
  href text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_id_idx on notifications (user_id);

create or replace function notify_on_booking_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into notifications (user_id, category, title, body, href)
  values (
    new.user_id,
    case when new.kind = 'package' then 'delivery' else 'trip' end,
    case when new.kind = 'package' then 'Package booked' else 'Seat booked' end,
    new.from_city || ' → ' || new.to_city || ' · Ref ' || new.reference,
    '/track?reference=' || new.reference
  );
  return new;
end;
$$;

drop trigger if exists on_booking_created on bookings;
create trigger on_booking_created
  after insert on bookings
  for each row execute function notify_on_booking_created();

-- ---------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------

-- SECURITY DEFINER helper so bookings/notifications policies can
-- check "is this user staff?" without querying profiles from inside
-- a profiles policy (which would recurse).
create or replace function is_staff()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role in ('dispatcher', 'admin')
  );
$$;

alter table profiles enable row level security;
alter table destinations enable row level security;
alter table bookings enable row level security;
alter table notifications enable row level security;

drop policy if exists "profiles: read own" on profiles;
create policy "profiles: read own" on profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles: update own" on profiles;
create policy "profiles: update own" on profiles
  for update using (auth.uid() = id);

drop policy if exists "destinations: readable by signed-in users" on destinations;
create policy "destinations: readable by signed-in users" on destinations
  for select using (auth.role() = 'authenticated');

drop policy if exists "bookings: read own or staff" on bookings;
create policy "bookings: read own or staff" on bookings
  for select using (auth.uid() = user_id or is_staff());

drop policy if exists "bookings: insert own" on bookings;
create policy "bookings: insert own" on bookings
  for insert with check (auth.uid() = user_id);

drop policy if exists "bookings: staff can update" on bookings;
create policy "bookings: staff can update" on bookings
  for update using (is_staff());

drop policy if exists "notifications: read own" on notifications;
create policy "notifications: read own" on notifications
  for select using (auth.uid() = user_id);

drop policy if exists "notifications: mark own read" on notifications;
create policy "notifications: mark own read" on notifications
  for update using (auth.uid() = user_id);

-- ---------------------------------------------------------------
-- Realtime — Track Trip subscribes to UPDATEs on its own booking row
-- (dispatcher moves the bus in /admin → passenger's map moves live).
-- ---------------------------------------------------------------
alter publication supabase_realtime add table bookings;
