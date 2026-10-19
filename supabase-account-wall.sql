-- Hao yangu realtors: account wall for listing details
-- Run this ONCE in Supabase > SQL Editor, AFTER your existing setup. It is safe to run again.
--
-- What it does
--   Visitors without an account can still read the public card of a listing
--   (title, location, price, photo, beds, baths, size, type, agency).
--   Only signed-in users can read the description, amenities, contact details
--   and the internal fields. This is enforced in the database itself, so
--   nobody can get around it by opening the browser tools or calling the API directly.
--
-- It does NOT change which rows are visible (your existing row-level policies still decide
-- that, e.g. only approved listings for the public). It only limits which COLUMNS the
-- signed-out role ("anon") can read.

begin;

-- 1. Start from a clean slate for the signed-out role on this table.
revoke select on table public.listings from anon;

-- 2. Give signed-out visitors only the public card columns.
--    Keep this list in step with PUBLIC_LISTING_COLUMNS in App.jsx and the query in _worker.js.
grant select (
  id,
  title,
  location,
  price_value,
  period,
  tag,
  beds,
  baths,
  size,
  acres,
  space_type,
  img,
  featured,
  featured_until,
  agency,
  status,
  created_at
) on table public.listings to anon;

-- 3. Signed-in users keep full access to the columns (rows are still filtered by your policies).
grant select on table public.listings to authenticated;

commit;

-- ---------------------------------------------------------------------------
-- Check it worked (optional). Run these one at a time.
--
-- a) Should list ONLY the public columns above:
--    select column_name
--    from information_schema.column_privileges
--    where table_schema = 'public' and table_name = 'listings' and grantee = 'anon'
--    and privilege_type = 'SELECT'
--    order by column_name;
--
-- b) From a signed-out browser, this must now fail with "permission denied":
--    https://YOUR-PROJECT-REF.supabase.co/rest/v1/listings?select=description,contact
--    (send the header  apikey: YOUR-ANON-KEY )
--
-- Agents: the agents table is already limited to public columns by the app
-- (comments and verification notes come only through the staff-only agent_private function),
-- so this script leaves it alone.
