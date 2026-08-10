create table household_members (
  id uuid primary key default gen_random_uuid(),
  resident_id uuid not null references profiles(id) on delete cascade,
  full_name text not null,
  relationship text not null,
  age int,
  created_at timestamptz not null default now()
);

alter table household_members enable row level security;

-- A single "for all" policy covers select/insert/update/delete so there's no
-- redundant permissive policy for select (multiple_permissive_policies).
create policy "Household members are manageable by owner or staff/admin"
  on household_members for all
  using (
    (select auth.uid()) = resident_id
    or exists (
      select 1 from profiles p
      where p.id = (select auth.uid()) and p.role in ('staff', 'admin')
    )
  )
  with check (
    (select auth.uid()) = resident_id
    or exists (
      select 1 from profiles p
      where p.id = (select auth.uid()) and p.role in ('staff', 'admin')
    )
  );

create index household_members_resident_id_idx on household_members(resident_id);
