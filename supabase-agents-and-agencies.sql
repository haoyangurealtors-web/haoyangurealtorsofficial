-- Hao yangu realtors: agencies, and agents who can post their own listings
-- Run this ONCE in Supabase > SQL Editor, AFTER your existing setup. It is safe to run again.
--
-- What it does
--   1. Agents can sign in and ADD and REMOVE their own listings.
--      An agent only ever sees and removes the listings they posted themselves.
--   2. An agency can see EVERY listing posted under it (its own and its agents') and EDIT any of them.
--   3. An agency (or the superadmin) gives an agent a login by adding the agent's email on the site
--      (Agents tab). The agent then signs up on the site with that email, confirms it, and uses Staff sign in.
--
-- How it keeps people in their lane (enforced here, in the database, so it can't be bypassed from the browser)
--   - New listings from an agent or an agency are always saved as "Pending", never featured, under the
--     right agency, and with the right "posted by" name. Nobody can post as someone else or publish themselves.
--   - When an agency edits a listing, its status, featuring, agency and "posted by" can't change.
--   - The superadmin is unaffected.
--
-- Note: in the database an agency is still the role "admin" in the staff table. Only the wording on the
-- site changed to "agency", so nothing you already set up needs to be redone.

begin;

-- 1. Agent logins --------------------------------------------------------------------------------------------
create table if not exists public.agent_logins (
  id          bigint generated always as identity primary key,
  email       text not null,
  agent_name  text not null,
  agency      text not null,
  status      text not null default 'active' check (status in ('active', 'suspended')),
  created_at  timestamptz not null default now()
);
-- One login per email, and one login per agent (an agent is identified by agency + name).
create unique index if not exists agent_logins_email_key on public.agent_logins (lower(email));
create unique index if not exists agent_logins_agent_key on public.agent_logins (lower(agency), lower(agent_name));

alter table public.agent_logins enable row level security;
revoke all on table public.agent_logins from anon;
grant select, insert, update, delete on table public.agent_logins to authenticated;

-- 2. Who is signed in? ---------------------------------------------------------------------------------------
-- Returns one row: kind = 'superadmin' | 'agency' | 'agent', plus the person's name and agency.
-- Returns nothing for an ordinary visitor. Only confirmed emails count; a banned agent or a suspended login doesn't.
create or replace function public.hy_caller()
returns table (kind text, name text, agency text)
language sql
stable
security definer
set search_path = public, auth
as $$
  select r.kind, r.name, r.agency
  from (
    select case s.role when 'superadmin' then 'superadmin' else 'agency' end as kind,
           s.name::text as name,
           coalesce(s.agency, '')::text as agency,
           case s.role when 'superadmin' then 1 else 2 end as rank
      from public.staff s
     where lower(s.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
       and s.status = 'active'
       and s.role in ('admin', 'superadmin')
    union all
    select 'agent', l.agent_name::text, l.agency::text, 3
      from public.agent_logins l
     where lower(l.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
       and l.status = 'active'
       and not exists (
         select 1 from public.agents a
          where a.status = 'banned'
            and lower(a.name) = lower(l.agent_name)
            and lower(coalesce(a.agency, '')) = lower(l.agency)
       )
  ) r
  where auth.uid() is not null
    and exists (select 1 from auth.users u where u.id = auth.uid() and u.email_confirmed_at is not null)
  order by r.rank
  limit 1
$$;

revoke all on function public.hy_caller() from public, anon;
grant execute on function public.hy_caller() to authenticated;

-- What the site asks after sign-in, when the person isn't an agency or the superadmin.
create or replace function public.my_agent_profile()
returns jsonb
language sql
stable
security definer
set search_path = public, auth
as $$
  select jsonb_build_object('role', 'agent', 'name', c.name, 'agency', c.agency, 'mfa_required', false)
    from public.hy_caller() c
   where c.kind = 'agent'
$$;

revoke all on function public.my_agent_profile() from public, anon;
grant execute on function public.my_agent_profile() to authenticated;

-- 3. Who can manage agent logins -----------------------------------------------------------------------------
drop policy if exists agent_logins_superadmin on public.agent_logins;
create policy agent_logins_superadmin on public.agent_logins
  for all to authenticated
  using      (exists (select 1 from public.hy_caller() c where c.kind = 'superadmin'))
  with check (exists (select 1 from public.hy_caller() c where c.kind = 'superadmin'));

drop policy if exists agent_logins_agency on public.agent_logins;
create policy agent_logins_agency on public.agent_logins
  for all to authenticated
  using      (exists (select 1 from public.hy_caller() c where c.kind = 'agency' and c.agency <> '' and lower(c.agency) = lower(agent_logins.agency)))
  with check (exists (select 1 from public.hy_caller() c where c.kind = 'agency' and c.agency <> '' and lower(c.agency) = lower(agent_logins.agency)));

-- Removing an agent also removes their login.
create or replace function public.hy_agent_deleted()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.agent_logins l
   where lower(l.agency) = lower(coalesce(old.agency, ''))
     and lower(l.agent_name) = lower(old.name)
     and not exists (
       select 1 from public.agents a
        where lower(coalesce(a.agency, '')) = lower(coalesce(old.agency, ''))
          and lower(a.name) = lower(old.name)
     );
  return old;
end;
$$;

drop trigger if exists hy_agent_deleted on public.agents;
create trigger hy_agent_deleted
  after delete on public.agents
  for each row execute function public.hy_agent_deleted();

-- 4. Listings: who can see, add, edit and remove what ----------------------------------------------------------
-- These rules ADD to the ones you already have (they never remove any).

-- An agent sees, adds and removes only the listings they posted.
drop policy if exists listings_agent_select on public.listings;
create policy listings_agent_select on public.listings
  for select to authenticated
  using (exists (
    select 1 from public.hy_caller() c
     where c.kind = 'agent'
       and lower(c.agency) = lower(listings.agency)
       and lower(c.name) = lower(listings.submitted_by)
  ));

drop policy if exists listings_agent_insert on public.listings;
create policy listings_agent_insert on public.listings
  for insert to authenticated
  with check (exists (
    select 1 from public.hy_caller() c
     where c.kind = 'agent'
       and lower(c.agency) = lower(listings.agency)
       and lower(c.name) = lower(listings.submitted_by)
       and listings.status = 'pending'
  ));

drop policy if exists listings_agent_delete on public.listings;
create policy listings_agent_delete on public.listings
  for delete to authenticated
  using (exists (
    select 1 from public.hy_caller() c
     where c.kind = 'agent'
       and lower(c.agency) = lower(listings.agency)
       and lower(c.name) = lower(listings.submitted_by)
  ));

-- An agency sees, adds, edits and removes everything posted under it.
drop policy if exists listings_agency_select on public.listings;
create policy listings_agency_select on public.listings
  for select to authenticated
  using (exists (
    select 1 from public.hy_caller() c
     where c.kind = 'agency' and c.agency <> '' and lower(c.agency) = lower(listings.agency)
  ));

drop policy if exists listings_agency_insert on public.listings;
create policy listings_agency_insert on public.listings
  for insert to authenticated
  with check (exists (
    select 1 from public.hy_caller() c
     where c.kind = 'agency' and c.agency <> '' and lower(c.agency) = lower(listings.agency)
       and listings.status = 'pending'
  ));

drop policy if exists listings_agency_update on public.listings;
create policy listings_agency_update on public.listings
  for update to authenticated
  using (exists (
    select 1 from public.hy_caller() c
     where c.kind = 'agency' and c.agency <> '' and lower(c.agency) = lower(listings.agency)
  ))
  with check (exists (
    select 1 from public.hy_caller() c
     where c.kind = 'agency' and c.agency <> '' and lower(c.agency) = lower(listings.agency)
  ));

drop policy if exists listings_agency_delete on public.listings;
create policy listings_agency_delete on public.listings
  for delete to authenticated
  using (exists (
    select 1 from public.hy_caller() c
     where c.kind = 'agency' and c.agency <> '' and lower(c.agency) = lower(listings.agency)
  ));

-- Whatever the browser sends, agents and agencies can't publish, feature, re-assign or re-attribute a listing.
create or replace function public.hy_enforce_listing_rules()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  c record;
begin
  -- No signed-in user (SQL editor, server-side jobs): leave things alone.
  if auth.uid() is null then
    return new;
  end if;

  select * into c from public.hy_caller();
  if c.kind is null or c.kind = 'superadmin' then
    return new; -- the superadmin is unrestricted; anyone else unknown is left to the row rules above
  end if;

  if tg_op = 'INSERT' then
    new.agency         := c.agency;
    new.submitted_by   := c.name;
    new.status         := 'pending';
    new.featured       := false;
    new.featured_until := null;
  else
    new.agency         := old.agency;
    new.submitted_by   := old.submitted_by;
    new.status         := old.status;
    new.featured       := old.featured;
    new.featured_until := old.featured_until;
    new.source         := old.source;
  end if;
  return new;
end;
$$;

drop trigger if exists hy_listing_rules on public.listings;
create trigger hy_listing_rules
  before insert or update on public.listings
  for each row execute function public.hy_enforce_listing_rules();

commit;

-- ---------------------------------------------------------------------------
-- Check it worked (optional). Run one at a time.
--
-- a) The new table and its rules:
--    select count(*) from public.agent_logins;
--    select policyname, cmd from pg_policies where tablename in ('agent_logins', 'listings') order by 1;
--
-- b) After an agent signs in on the site, the Agent console should open. If it shows
--    "doesn't have staff access", check that the agent's login email was added on the Agents tab,
--    that it is not suspended, that the agent is not banned, and that they confirmed their email.
