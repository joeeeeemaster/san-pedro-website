create type announcement_category as enum ('Fiesta', 'Public Works', 'Assembly', 'Health', 'Environment', 'Events');
create type announcement_status as enum ('draft', 'published');

create table announcements (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category announcement_category not null,
  content text not null,
  cover_image_url text,
  status announcement_status not null default 'draft',
  published_at timestamptz,
  author_id uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table announcements enable row level security;

create policy "Published announcements are viewable by everyone, drafts by staff/admin"
  on announcements for select
  using (
    status = 'published'
    or exists (
      select 1 from profiles p
      where p.id = (select auth.uid()) and p.role in ('staff', 'admin')
    )
  );

create policy "Staff/admin can insert announcements"
  on announcements for insert
  with check (
    exists (
      select 1 from profiles p
      where p.id = (select auth.uid()) and p.role in ('staff', 'admin')
    )
  );

create policy "Staff/admin can update announcements"
  on announcements for update
  using (
    exists (
      select 1 from profiles p
      where p.id = (select auth.uid()) and p.role in ('staff', 'admin')
    )
  );

create policy "Staff/admin can delete announcements"
  on announcements for delete
  using (
    exists (
      select 1 from profiles p
      where p.id = (select auth.uid()) and p.role in ('staff', 'admin')
    )
  );

create index announcements_status_idx on announcements(status);
