-- Phase 0 prep: run this once you create the Supabase project in Phase 2.
-- Every authenticated user (admin, staff, resident) gets exactly one row here.

create type user_role as enum ('admin', 'staff', 'resident');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'resident',
  full_name text not null,
  email text not null,
  mobile_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

-- Everyone can read their own profile.
create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = id);

-- Staff and admin can read every profile (needed for Resident Management, User Management).
create policy "Staff and admin can view all profiles"
  on profiles for select
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role in ('staff', 'admin')
    )
  );

-- Users can update their own profile (My Profile page).
create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

-- Only admin can change roles / manage other accounts (User Management page).
create policy "Admin can update any profile"
  on profiles for update
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Auto-create a profile row whenever someone signs up.
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
