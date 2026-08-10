create type request_status as enum ('pending', 'processing', 'ready', 'released', 'rejected');
create type document_type as enum ('barangay_clearance', 'certificate_of_indigency', 'business_permit', 'barangay_id');

create table document_requests (
  id uuid primary key default gen_random_uuid(),
  resident_id uuid not null references profiles(id) on delete cascade,
  document_type document_type not null,
  purpose text,
  address text,
  contact_number text,
  status request_status not null default 'pending',
  uploaded_files jsonb not null default '[]'::jsonb,
  requested_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table document_requests enable row level security;

create policy "Requests are viewable by owner or staff/admin"
  on document_requests for select
  using (
    (select auth.uid()) = resident_id
    or exists (
      select 1 from profiles p
      where p.id = (select auth.uid()) and p.role in ('staff', 'admin')
    )
  );

create policy "Residents can create their own requests"
  on document_requests for insert
  with check ((select auth.uid()) = resident_id);

create policy "Staff/admin can update any request"
  on document_requests for update
  using (
    exists (
      select 1 from profiles p
      where p.id = (select auth.uid()) and p.role in ('staff', 'admin')
    )
  );

create index document_requests_resident_id_idx on document_requests(resident_id);
