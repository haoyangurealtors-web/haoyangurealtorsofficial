-- Adds haoyangurealtors@gmail.com as a super admin on the live site.
-- Run once in Supabase > SQL Editor. Safe to run again.
--
-- Before they can use it, that person must sign up on the site with this exact
-- email and confirm it. The site then recognises them as staff automatically.

do $$
declare
  v_email text := lower('haoyangurealtors@gmail.com');
begin
  if exists (select 1 from public.staff where lower(email) = v_email) then
    update public.staff
       set role = 'superadmin', status = 'active'
     where lower(email) = v_email;
  else
    insert into public.staff (email, name, agency, status, role)
    values (v_email, 'Hao yangu realtors', '', 'active', 'superadmin');
  end if;
end $$;

-- How many super admins exist now, and who they are:
select count(*) as super_admin_count from public.staff where role = 'superadmin';
select email, name, status from public.staff where role = 'superadmin' order by id;
