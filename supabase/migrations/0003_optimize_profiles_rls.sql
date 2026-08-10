-- Fixes performance advisor warnings raised after 0001:
-- auth_rls_initplan, multiple_permissive_policies
-- Replaces the 4 separate select/update policies with 2 consolidated ones,
-- and wraps auth.uid() in a select so Postgres caches it per-statement
-- instead of re-evaluating it per row.

drop policy "Users can view their own profile" on profiles;
drop policy "Staff and admin can view all profiles" on profiles;
drop policy "Users can update their own profile" on profiles;
drop policy "Admin can update any profile" on profiles;

create policy "Profiles are viewable by owner or staff/admin"
  on profiles for select
  using (
    (select auth.uid()) = id
    or exists (
      select 1 from profiles p
      where p.id = (select auth.uid()) and p.role in ('staff', 'admin')
    )
  );

create policy "Profiles are updatable by owner or admin"
  on profiles for update
  using (
    (select auth.uid()) = id
    or exists (
      select 1 from profiles p
      where p.id = (select auth.uid()) and p.role = 'admin'
    )
  );
