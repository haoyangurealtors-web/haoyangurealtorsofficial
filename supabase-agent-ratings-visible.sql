-- Hao yangu realtors: let signed-in visitors see agent ratings
-- Run this ONCE in Supabase > SQL Editor, AFTER supabase-agent-ratings-and-phone.sql. It is safe to run again.
--
-- What changes
--   Visitors with an account can now see, for each verified agent: the average score, how many people
--   rated, the 1-to-5 breakdown, and the written comments (each shown with the reviewer's FIRST NAME only).
--
-- What stays private (still enforced by the database)
--   - Signed-out visitors see nothing.
--   - Full names and account ids of reviewers: only the superadmin and the agent's own agency see those
--     (through the dashboard), exactly as before. Other visitors only ever get first names.
--   - Agents themselves get nothing back from these two functions, so an agent cannot look up who rated them.
--
-- It works through two small functions rather than opening the ratings table itself.

begin;

-- Average, count and 1-5 breakdown for every verified agent that has at least one rating.
create or replace function public.agent_rating_summary()
returns table (
  agent_id     bigint,
  rating_count integer,
  avg_stars    numeric,
  c1 integer, c2 integer, c3 integer, c4 integer, c5 integer
)
language sql
stable
security definer
set search_path = public
as $$
  select r.agent_id,
         count(*)::integer,
         round(avg(r.stars)::numeric, 2),
         (count(*) filter (where r.stars = 1))::integer,
         (count(*) filter (where r.stars = 2))::integer,
         (count(*) filter (where r.stars = 3))::integer,
         (count(*) filter (where r.stars = 4))::integer,
         (count(*) filter (where r.stars = 5))::integer
    from public.agent_ratings r
    join public.agents a on a.id = r.agent_id and a.status = 'verified'
   where auth.uid() is not null
     and not exists (select 1 from public.hy_caller() c where c.kind = 'agent')
   group by r.agent_id
$$;

-- The written reviews for one agent, newest first, with first names only.
create or replace function public.agent_reviews(p_agent_id bigint)
returns table (
  stars      smallint,
  comment    text,
  reviewer   text,
  updated_at timestamptz,
  mine       boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select r.stars,
         r.comment,
         coalesce(nullif(split_part(btrim(r.rater_name), ' ', 1), ''), 'A visitor'),
         r.updated_at,
         (r.user_id = auth.uid())
    from public.agent_ratings r
   where r.agent_id = p_agent_id
     and btrim(r.comment) <> ''
     and auth.uid() is not null
     and public.hy_agent_rateable(p_agent_id)
     and not exists (select 1 from public.hy_caller() c where c.kind = 'agent')
   order by r.updated_at desc
   limit 100
$$;

revoke all on function public.agent_rating_summary() from public, anon;
revoke all on function public.agent_reviews(bigint)   from public, anon;
grant execute on function public.agent_rating_summary() to authenticated;
grant execute on function public.agent_reviews(bigint)   to authenticated;

commit;

-- ---------------------------------------------------------------------------
-- Check it worked (optional; these return nothing in the SQL editor because there is no signed-in visitor there,
-- which is correct. Check on the site instead: sign in as a customer and open an agent that has been rated.)
--   select * from public.agent_rating_summary();
