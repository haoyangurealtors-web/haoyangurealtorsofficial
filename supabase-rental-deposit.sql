-- Hao yangu realtors: rental deposit (required on every new rental listing)
-- Run this ONCE in Supabase > SQL Editor, BEFORE you publish the site update that uses it. It is safe to run again.
--
-- What it does
--   Adds two columns to listings:
--     deposit_required  true / false  (empty = "not stated", which is how every existing listing starts)
--     deposit_amount    whole shillings, only when a deposit is required
--   and a rule, enforced in the database so it can't be skipped from the browser:
--     - A NEW listing in the Rent category must say whether it requires a deposit.
--     - If a deposit is required, the amount must be greater than zero.
--     - If no deposit is required, the amount is cleared.
--     - Listings in other categories never carry a deposit.
--     - A rental that already states its deposit can't go back to "not stated".
--   Existing rentals are left alone: they show "Ask the agent" until someone edits them and fills it in, and
--   approving, holding or featuring them keeps working as before.
--
-- Signed-in visitors see the deposit on the listing page (the same people who already see a listing's contact
-- details). It is not added to the public columns, so signed-out visitors don't receive it.

begin;

alter table public.listings add column if not exists deposit_required boolean;
alter table public.listings add column if not exists deposit_amount   bigint;

alter table public.listings drop constraint if exists listings_deposit_check;
alter table public.listings add constraint listings_deposit_check check (
  (deposit_required is true and deposit_amount is not null and deposit_amount > 0)
  or (deposit_required is not true and deposit_amount is null)
);

create or replace function public.hy_deposit_rules()
returns trigger
language plpgsql
as $$
begin
  -- Only rentals have a deposit.
  if new.tag is distinct from 'Rent' then
    new.deposit_required := null;
    new.deposit_amount   := null;
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.deposit_required is null then
      raise exception 'Please say whether this rental requires a deposit' using errcode = '23514';
    end if;
  else
    -- Becoming a rental, or a rental that already stated its deposit, must state it.
    if new.deposit_required is null and (old.tag is distinct from 'Rent' or old.deposit_required is not null) then
      raise exception 'Please say whether this rental requires a deposit' using errcode = '23514';
    end if;
  end if;

  if new.deposit_required is false then
    new.deposit_amount := null;
  end if;
  return new;
end;
$$;

drop trigger if exists hy_deposit_rules on public.listings;
create trigger hy_deposit_rules
  before insert or update on public.listings
  for each row execute function public.hy_deposit_rules();

commit;

-- ---------------------------------------------------------------------------
-- Check it worked (optional). Rentals that still need a deposit filled in:
--   select id, title, location from public.listings where tag = 'Rent' and deposit_required is null order by id;
