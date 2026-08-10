-- The previous policy queried `profiles` from within its own policy,
-- re-triggering that same policy and causing Postgres to detect infinite
-- recursion (surfaced to the app as a 500 on every profile fetch — this is
-- what broke login: sign-in succeeded, but the very next request, fetching
-- the user's profile to decide where to send them, failed every time).
-- Fix: a SECURITY DEFINER function runs with its owner's privileges, which
-- bypasses RLS internally, breaking the cycle.
create or replace function public.current_user_role()
returns user_role
language sql
security definer
stable
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

revoke all on function public.current_user_role() from public;
grant execute on function public.current_user_role() to authenticated, anon;

drop policy "Profiles are viewable by owner or staff/admin" on profiles;
drop policy "Profiles are updatable by owner or admin" on profiles;

create policy "Profiles are viewable by owner or staff/admin"
  on profiles for select
  using (
    (select auth.uid()) = id
    or public.current_user_role() in ('staff', 'admin')
  );

create policy "Profiles are updatable by owner or admin"
  on profiles for update
  using (
    (select auth.uid()) = id
    or public.current_user_role() = 'admin'
  );
