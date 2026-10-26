-- Hao yangu realtors: visitor activity by day (for the Overview date range)
-- Run this ONCE in Supabase > SQL Editor, AFTER supabase-agents-and-agencies.sql. It is safe to run again.
--
-- What it does
--   The Overview used to show only all-time running totals. This adds a second, per-day record so the
--   superadmin can switch between Today, 7 days, 30 days and All time.
--   - Your existing all-time counters (usage_events / log_events) are NOT touched and keep working.
--   - Days are counted in Nakuru time (Africa/Nairobi), so "Today" starts at midnight there.
--   - Daily records start from the moment you run this. Earlier visits only appear under All time,
--     because they were never stored with a date.
--
-- Who can see it: only the superadmin can read the daily table. Visitors (signed in or not) can only add to it,
-- the same way they already add to the all-time counters.

begin;

create table if not exists public.usage_daily (
  day   date   not null,
  key   text   not null,
  count bigint not null default 0,
  primary key (day, key)
);

alter table public.usage_daily enable row level security;
revoke all on table public.usage_daily from anon;
revoke all on table public.usage_daily from authenticated;
grant select on table public.usage_daily to authenticated;

drop policy if exists usage_daily_superadmin_read on public.usage_daily;
create policy usage_daily_superadmin_read on public.usage_daily
  for select to authenticated
  using (exists (select 1 from public.hy_caller() c where c.kind = 'superadmin'));

-- Called by the site every few seconds with a batch like {"pageViews": 3, "searches": 1}.
-- It only accepts simple names and small whole numbers, so a bad caller can't write anything odd.
create or replace function public.log_events_daily(deltas jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  d date := (now() at time zone 'Africa/Nairobi')::date;
  e record;
  n bigint;
begin
  if deltas is null or jsonb_typeof(deltas) <> 'object' then
    return;
  end if;
  for e in select key, value from jsonb_each(deltas) loop
    if e.key !~ '^[A-Za-z]{1,40}$' then continue; end if;
    if jsonb_typeof(e.value) <> 'number' then continue; end if;
    n := least(greatest(floor((e.value #>> '{}')::numeric), 0), 500)::bigint;
    if n = 0 then continue; end if;
    insert into public.usage_daily (day, key, count)
    values (d, e.key, n)
    on conflict (day, key) do update set count = public.usage_daily.count + excluded.count;
  end loop;
end;
$$;

revoke all on function public.log_events_daily(jsonb) from public;
grant execute on function public.log_events_daily(jsonb) to anon, authenticated;

commit;

-- ---------------------------------------------------------------------------
-- Check it worked (optional): after visiting the site for a minute, run
--   select * from public.usage_daily order by day desc, key;
