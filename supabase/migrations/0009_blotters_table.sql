create type blotter_severity as enum ('Low', 'Medium', 'High');
create type blotter_status as enum ('Open', 'Under Mediation', 'Resolved');
create sequence blotter_case_seq;

create table blotters (
  id uuid primary key default gen_random_uuid(),
  case_no text not null unique default (
    'BL-' || to_char(now(), 'YYYY-MMDD') || '-' || lpad(nextval('blotter_case_seq')::text, 2, '0')
  ),
  complainant_name text not null,
  respondent_name text not null,
  incident_type text not null,
  incident_datetime timestamptz not null,
  location text not null,
  severity blotter_severity not null default 'Medium',
  description text not null,
  witnesses text,
  status blotter_status not null default 'Open',
  filed_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table blotters enable row level security;

-- Blotter records involve third parties and sensitive incident details —
-- staff/admin only, never exposed to the resident portal.
create policy "Blotters are manageable by staff/admin only"
  on blotters for all
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
