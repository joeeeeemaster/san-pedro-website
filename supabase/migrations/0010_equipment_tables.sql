create type equipment_status as enum ('Available', 'Rented', 'Under Maintenance');
create type rental_status as enum ('Reserved', 'Released', 'Returned', 'Due Today');

create table equipment (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  total_quantity int not null default 0,
  available_quantity int not null default 0,
  status equipment_status not null default 'Available',
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table equipment_rentals (
  id uuid primary key default gen_random_uuid(),
  equipment_id uuid not null references equipment(id) on delete cascade,
  borrower_name text not null,
  contact_number text,
  date_out timestamptz not null,
  return_date timestamptz not null,
  quantity int not null default 1,
  status rental_status not null default 'Reserved',
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table equipment enable row level security;
alter table equipment_rentals enable row level security;

create policy "Equipment is manageable by staff/admin only"
  on equipment for all
  using (
    exists (
      select 1 from profiles p
      where p.id = (select auth.uid()) and p.role in ('staff', 'admin')
    )
  )
  with check (
    exists (
      select 1 from profiles p
      where p.id = (select auth.uid()) and p.role in ('staff', 'admin')
    )
  );

create policy "Equipment rentals are manageable by staff/admin only"
  on equipment_rentals for all
  using (
    exists (
      select 1 from profiles p
      where p.id = (select auth.uid()) and p.role in ('staff', 'admin')
    )
  )
  with check (
    exists (
      select 1 from profiles p
      where p.id = (select auth.uid()) and p.role in ('staff', 'admin')
    )
  );

create index equipment_rentals_equipment_id_idx on equipment_rentals(equipment_id);
