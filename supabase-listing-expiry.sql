-- Hao yangu realtors: 30-day listing period, its countdown, automatic removal and renewal
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
--   When the 30 days run out the listing comes OFF the public site by itself, at that exact second.
--   Nothing is deleted: the superadmin, the agency and the agent still see it (marked "Expired"),
--   and only the superadmin can RENEW it (a fresh 30 days from the moment of renewal), which puts it back on the site.
--   Visitors, signed-in members of the public and signed-out visitors can no longer read an expired listing,
--   even by calling the API directly.

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

-- 3. Automatic removal: an expired listing can't be read by the public. ---------------------------------------
-- These are "restrictive" rules: they are added ON TOP of your existing listing rules and only ever take rows away.
-- The superadmin, agencies and agents are not affected (they must still see expired listings to renew or repost them).
create or replace function public.hy_listing_expired(p_listing_id bigint)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.listing_expiry e
     where e.listing_id = p_listing_id and e.expires_at <= now()
  );
$$;
revoke all on function public.hy_listing_expired(bigint) from public;
grant execute on function public.hy_listing_expired(bigint) to anon, authenticated;

drop policy if exists listings_hide_expired_anon on public.listings;
create policy listings_hide_expired_anon on public.listings
  as restrictive
  for select to anon
  using (not public.hy_listing_expired(id));

drop policy if exists listings_hide_expired_members on public.listings;
create policy listings_hide_expired_members on public.listings
  as restrictive
  for select to authenticated
  using (
    not public.hy_listing_expired(id)
    or exists (select 1 from public.hy_caller())
  );

-- 4. Renewal: superadmin only. ---------------------------------------------------------------------------------
-- Gives the listing a fresh 30 days from now (it goes back on the site straight away if it had expired).
create or replace function public.hy_renew_listing(p_listing_id bigint)
returns timestamptz
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  c record;
  new_end timestamptz;
begin
  select * into c from public.hy_caller();
  if c.kind is distinct from 'superadmin' then
    raise exception 'Only the superadmin can renew a listing' using errcode = '42501';
  end if;
  new_end := now() + interval '30 days';
  insert into public.listing_expiry (listing_id, expires_at)
  values (p_listing_id, new_end)
  on conflict (listing_id) do update set expires_at = excluded.expires_at;
  return new_end;
end;
$$;
revoke all on function public.hy_renew_listing(bigint) from public;
revoke all on function public.hy_renew_listing(bigint) from anon;
grant execute on function public.hy_renew_listing(bigint) to authenticated;

-- Renew everything that has expired or runs out within the next p_within_days days (superadmin only).
-- Used by the "Renew all expiring" button. Returns how many listings were renewed.
create or replace function public.hy_renew_expiring(p_within_days integer default 7)
returns integer
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  c record;
  n integer;
begin
  select * into c from public.hy_caller();
  if c.kind is distinct from 'superadmin' then
    raise exception 'Only the superadmin can renew listings' using errcode = '42501';
  end if;
  update public.listing_expiry e
     set expires_at = now() + interval '30 days'
    from public.listings l
   where l.id = e.listing_id
     and l.status = 'approved'
     and e.expires_at <= now() + make_interval(days => greatest(0, least(coalesce(p_within_days, 7), 60)));
  get diagnostics n = row_count;
  return n;
end;
$$;
revoke all on function public.hy_renew_expiring(integer) from public;
revoke all on function public.hy_renew_expiring(integer) from anon;
grant execute on function public.hy_renew_expiring(integer) to authenticated;

-- 5. Listings that already exist: spread their end dates so they don't all run out on the same day. -------------
-- Each existing listing gets between 30 and 59 days from today (about one batch a day after the first month),
-- so you can renew them a few at a time instead of the whole site going quiet on one day.
-- (Otherwise every old listing would also show as "expired" the moment this runs.)
insert into public.listing_expiry (listing_id, expires_at)
select id,
       now() + interval '30 days'
             + ((row_number() over (order by id) - 1) % 30) * interval '1 day'
             + (((row_number() over (order by id) - 1) * 7) % 24) * interval '1 hour'
  from public.listings
on conflict (listing_id) do nothing;

commit;

-- ---------------------------------------------------------------------------
-- Handy commands (run one at a time in the SQL Editor)
--
-- Already ran an EARLIER version of this file (every old listing got the same end date)? Spread them out now.
-- Run it once only, and only on listings you have not renewed yet:
--    with ranked as (
--      select listing_id, row_number() over (order by listing_id) as n from public.listing_expiry
--    )
--    update public.listing_expiry e
--       set expires_at = now() + interval '30 days' + ((r.n - 1) % 30) * interval '1 day' + (((r.n - 1) * 7) % 24) * interval '1 hour'
--      from ranked r where r.listing_id = e.listing_id;
--
-- Renew one listing from the SQL Editor (replace 123 with the listing number). The site has a Renew button for the superadmin too:
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
-- Check the countdown is private: from a signed-out browser this must return [] or "permission denied":
--    https://YOUR-PROJECT-REF.supabase.co/rest/v1/listing_expiry?select=*   (header  apikey: YOUR-ANON-KEY )
