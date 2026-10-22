-- Hao yangu realtors: agent phone numbers and agent ratings
-- Run this ONCE in Supabase > SQL Editor, AFTER supabase-agents-and-agencies.sql. It is safe to run again.
--
-- What it does
--   1. Adds a phone number to each agent. Only signed-in visitors can read it, so the account wall
--      still protects it (signed-out visitors never receive it, even if they call the API directly).
--   2. Adds ratings. A signed-in visitor can give each agent 1 to 5 stars and an optional comment,
--      and can change or remove their own rating later. One rating per person per agent.
--
-- Who can see ratings (enforced here, in the database, so it can't be bypassed from the browser)
--   - The superadmin sees every rating.
--   - An agency sees the ratings of the agents under its own agency, and no one else's.
--   - A visitor sees only their own ratings.
--   - Agents, and signed-out visitors, see none. Scores are never shown on the public site.
--
-- Who can give ratings
--   - Only signed-in visitors with an ordinary account, and only to verified agents.
--   - Staff (the superadmin, agencies and agents) cannot rate, so nobody can rate themselves
--     or their own agents.

begin;

-- 1. Agent phone numbers --------------------------------------------------------------------------------------
alter table public.agents add column if not exists phone text not null default '';

-- Signed-out visitors may read only the public columns (this list matches PUBLIC_AGENT_COLUMNS in App.jsx).
-- Phone is not in it. Signed-in users are given the phone column on top of whatever they could already read.
revoke select on table public.agents from anon;
grant select (id, name, focus, area, agency, status, rating, reviews, img, verified_at, created_at)
  on table public.agents to anon;
grant select (phone), insert (phone), update (phone) on table public.agents to authenticated;

-- 2. Ratings --------------------------------------------------------------------------------------------------
create table if not exists public.agent_ratings (
  id          bigint generated always as identity primary key,
  agent_id    bigint not null references public.agents (id) on delete cascade,
  user_id     uuid   not null default auth.uid() references auth.users (id) on delete cascade,
  stars       smallint not null check (stars between 1 and 5),
  comment     text   not null default '' check (char_length(comment) <= 600),
  rater_name  text   not null default '' check (char_length(rater_name) <= 80),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint agent_ratings_one_per_person unique (agent_id, user_id)
);
create index if not exists agent_ratings_agent_idx on public.agent_ratings (agent_id);

alter table public.agent_ratings enable row level security;
revoke all on table public.agent_ratings from anon;
revoke all on table public.agent_ratings from authenticated;
grant select, insert, update, delete on table public.agent_ratings to authenticated;

-- Small helpers that look an agent up without being limited by the caller's own view of the agents table.
create or replace function public.hy_agent_agency(p_agent_id bigint)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(a.agency, '')::text from public.agents a where a.id = p_agent_id
$$;

create or replace function public.hy_agent_rateable(p_agent_id bigint)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.agents a where a.id = p_agent_id and a.status = 'verified')
$$;

revoke all on function public.hy_agent_agency(bigint) from public, anon;
revoke all on function public.hy_agent_rateable(bigint) from public, anon;
grant execute on function public.hy_agent_agency(bigint) to authenticated;
grant execute on function public.hy_agent_rateable(bigint) to authenticated;

-- Who can read ratings
drop policy if exists agent_ratings_own_read on public.agent_ratings;
create policy agent_ratings_own_read on public.agent_ratings
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists agent_ratings_superadmin_read on public.agent_ratings;
create policy agent_ratings_superadmin_read on public.agent_ratings
  for select to authenticated
  using (exists (select 1 from public.hy_caller() c where c.kind = 'superadmin'));

drop policy if exists agent_ratings_agency_read on public.agent_ratings;
create policy agent_ratings_agency_read on public.agent_ratings
  for select to authenticated
  using (exists (
    select 1 from public.hy_caller() c
     where c.kind = 'agency'
       and c.agency <> ''
       and lower(c.agency) = lower(public.hy_agent_agency(agent_ratings.agent_id))
  ));

-- Who can give, change and remove ratings: ordinary signed-in people, for their own rating only.
drop policy if exists agent_ratings_insert_own on public.agent_ratings;
create policy agent_ratings_insert_own on public.agent_ratings
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and public.hy_agent_rateable(agent_id)
    and not exists (select 1 from public.hy_caller())
  );

drop policy if exists agent_ratings_update_own on public.agent_ratings;
create policy agent_ratings_update_own on public.agent_ratings
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and not exists (select 1 from public.hy_caller()));

drop policy if exists agent_ratings_delete_own on public.agent_ratings;
create policy agent_ratings_delete_own on public.agent_ratings
  for delete to authenticated
  using (user_id = auth.uid());

-- Whatever the browser sends: the rating always belongs to the person who is signed in, can't be moved to
-- another person or agent later, and the text is tidied and kept to its length limits.
create or replace function public.hy_rating_rules()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if auth.uid() is not null then
    if tg_op = 'INSERT' then
      new.user_id    := auth.uid();
      new.created_at := now();
    else
      new.user_id    := old.user_id;
      new.agent_id   := old.agent_id;
      new.created_at := old.created_at;
    end if;
  end if;
  new.comment    := left(btrim(coalesce(new.comment, '')), 600);
  new.rater_name := left(btrim(coalesce(new.rater_name, '')), 80);
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists hy_rating_rules on public.agent_ratings;
create trigger hy_rating_rules
  before insert or update on public.agent_ratings
  for each row execute function public.hy_rating_rules();

commit;

-- ---------------------------------------------------------------------------
-- Check it worked (optional). Run one at a time.
--
-- a) The phone column exists, and signed-out visitors can NOT read it (it must not appear in this list):
--    select column_name from information_schema.column_privileges
--     where table_schema = 'public' and table_name = 'agents' and grantee = 'anon' and privilege_type = 'SELECT'
--     order by column_name;
--
-- b) The ratings rules:
--    select policyname, cmd from pg_policies where tablename = 'agent_ratings' order by 1;
--
-- c) Average score per agent (SQL editor only; the site shows this to the superadmin and agencies):
--    select a.name, a.agency, round(avg(r.stars), 2) as average, count(*) as ratings
--      from public.agent_ratings r join public.agents a on a.id = r.agent_id
--     group by a.name, a.agency order by average desc;
