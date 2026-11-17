-- Hao yangu realtors: UNDO supabase-listing-expiry.sql
-- Use this if listings are missing from the public site after the expiry SQL, or if you no longer want the 30-day period.
-- Nothing in your listings is ever deleted by the expiry system, so undoing it loses no listing.
--
-- PART A is the quick fix (run it first). It stops hiding expired listings straight away, in one second.
-- PART B removes the expiry system completely (the countdown, the Renew buttons and the table of end dates).
-- If you remove it, publish the site files from BEFORE the expiry update too, or the dashboards will simply show no countdown
-- (the site handles a missing table without errors, so this is safe either way).
--
-- BEFORE you run supabase-listing-expiry.sql on the live site, make a private copy of the listings.
-- Do NOT make the copy in the "public" schema: copies there are open to the website's public key by default.
-- Use a private schema instead:
--    create schema if not exists backup;
--    create table backup.listings_20261117 as select * from public.listings;
-- (change the date in the name to today's). To look at it later: select * from backup.listings_20261117;

-- ---------------------------------------------------------------- PART A: show everything again
begin;
drop policy if exists listings_hide_expired_anon on public.listings;
drop policy if exists listings_hide_expired_members on public.listings;
commit;

-- ---------------------------------------------------------------- PART B: remove the expiry system
-- (run Part A first; run this part only if you want it gone completely)
begin;
drop policy if exists listings_hide_expired_anon on public.listings;
drop policy if exists listings_hide_expired_members on public.listings;
drop trigger if exists hy_listing_expiry_sync on public.listings;
drop function if exists public.hy_listing_expiry_sync();
drop function if exists public.hy_renew_expiring(integer);
drop function if exists public.hy_renew_listing(bigint);
drop function if exists public.hy_listing_expired(bigint);
drop table if exists public.listing_expiry;
commit;

-- ---------------------------------------------------------------- IF YOU MADE A COPY IN THE PUBLIC SCHEMA EARLIER
-- If you already ran "create table listings_backup as select * from listings;" (in the public schema), lock it now:
--    alter table public.listings_backup enable row level security;
--    revoke all on table public.listings_backup from anon, authenticated;
-- Then move it somewhere private if you want to keep it:
--    create schema if not exists backup;
--    alter table public.listings_backup set schema backup;
