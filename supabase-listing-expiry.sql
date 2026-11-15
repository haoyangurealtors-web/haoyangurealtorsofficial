-- Hao yangu realtors: 30-day listing period and its countdown
-- Run this ONCE in Supabase > SQL Editor, AFTER your existing setup. It is safe to run again.
--
-- What it does
--   Every listing gets a 30-day period. The days are counted from the day the listing is APPROVED
--   (a listing that is added already approved, e.g. by the superadmin, starts counting when it is added).
--   The site shows a small "N days left" badge on each approved listing in the dashboards.
--
-- Who can see it (enforced here, in the database, so nobody can read it by calling the API directly)
--   - the superadmin: every listing
--   - an agency: the listings posted under that agency
--   - an agent: only the listings that agent posted
--   Visitors, signed-in members of the public and signed-out visitors get nothing.
--
-- It does NOT hide or remove expired listings. It only tells the right people when a listing is
-- about to run out. (Tell me if you also want expired listings to come off the public site.)

begin;

-- 1. The end date lives in its own table, so the public listings table never carries it. -------------------------
create table if not exists public.listing_expiry (
  listing_id  bigint primary key references public.listings(id) on delete cascade,
  expires_at  timestamptz not null
);

alter table public.listing_expiry enable row level security;
revoke all on table public.listing_expiry from anon;
revoke all on table public.listing_expiry from authenticated;
grant select on table public.listing_expiry to authenticated;

drop policy if exists listing_expiry_read on public.listing_expiry;
create policy listing_expiry_read on public.listing_expiry
  for select to authenticated
  using (exists (
    select 1
      from public.hy_caller() c
     where c.kind = 'superadmin'
        or (
          c.kind in ('agency', 'agent')
          and coalesce(c.agency, '') <> ''
          and exists (
            select 1
              from public.listings l
             where l.id = listing_expiry.listing_id
               and lower(coalesce(l.agency, '')) = lower(c.agency)
               and (c.kind = 'agency' or lower(coalesce(l.submitted_by, '')) = lower(c.name))
          )
        )
  ));

-- 2. Start the 30 days when a listing is added or approved. -----------------------------------------------------
create or replace function public.hy_listing_expiry_sync()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.listing_expiry (listing_id, expires_at)
    values (new.id, now() + interval '30 days')
    on conflict (listing_id) do nothing;
  elsif new.status = 'approved' and old.status is distinct from 'approved' then
    insert into public.listing_expiry (listing_id, expires_at)
    values (new.id, now() + interval '30 days')
    on conflict (listing_id) do update set expires_at = excluded.expires_at;
  end if;
  return null;
end;
$$;

drop trigger if exists hy_listing_expiry_sync on public.listings;
create trigger hy_listing_expiry_sync
  after insert or update of status on public.listings
  for each row execute function public.hy_listing_expiry_sync();

-- 3. Listings that already exist: give each a fresh 30 days from today. ----------------------------------------
-- (Otherwise every old listing would show as "expired" the moment this runs.)
insert into public.listing_expiry (listing_id, expires_at)
select id, now() + interval '30 days' from public.listings
on conflict (listing_id) do nothing;

commit;

-- ---------------------------------------------------------------------------
-- Handy commands (run one at a time in the SQL Editor)
--
-- Renew one listing for another 30 days (replace 123 with the listing number):
--    update public.listing_expiry set expires_at = now() + interval '30 days' where listing_id = 123;
--
-- See which listings run out in the next 7 days:
--    select l.id, l.title, l.agency, e.expires_at
--      from public.listing_expiry e join public.listings l on l.id = e.listing_id
--     where l.status = 'approved' and e.expires_at < now() + interval '7 days'
--     order by e.expires_at;
--
-- Instead of "30 days from today", count old listings from the day they were added:
--    update public.listing_expiry e set expires_at = l.created_at + interval '30 days'
--      from public.listings l where l.id = e.listing_id;
--
-- Check it is private: from a signed-out browser this must return [] or "permission denied":
--    https://YOUR-PROJECT-REF.supabase.co/rest/v1/listing_expiry?select=*   (header  apikey: YOUR-ANON-KEY )
