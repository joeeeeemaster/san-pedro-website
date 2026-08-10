create sequence certificate_no_seq;

create table certificates (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references document_requests(id) on delete set null,
  certificate_no text not null unique default (
    'SPBC-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('certificate_no_seq')::text, 7, '0')
  ),
  resident_id uuid not null references profiles(id) on delete cascade,
  document_type document_type not null,
  purpose text,
  address text,
  issued_date date not null default current_date,
  issued_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table certificates enable row level security;

create policy "Certificates are viewable by owner or staff/admin"
  on certificates for select
  using (
    (select auth.uid()) = resident_id
    or exists (
      select 1 from profiles p
      where p.id = (select auth.uid()) and p.role in ('staff', 'admin')
    )
  );

create policy "Staff/admin can create certificates"
  on certificates for insert
  with check (
    exists (
      select 1 from profiles p
      where p.id = (select auth.uid()) and p.role in ('staff', 'admin')
    )
  );

create index certificates_resident_id_idx on certificates(resident_id);
