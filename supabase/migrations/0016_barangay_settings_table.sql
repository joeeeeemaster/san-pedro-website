-- Singleton table (id is always `true`) — there's only ever one barangay.
create table barangay_settings (
  id boolean primary key default true check (id),
  barangay_name text not null default 'Barangay San Pedro',
  municipality text not null default 'Bacacay',
  province text not null default 'Albay',
  complete_address text not null default 'Barangay San Pedro, Bacacay, Albay 4513',
  official_email text not null default 'sanpedro.bacacay.albay@gmail.com',
  contact_number text not null default '(052) 123-4567',
  office_hours text not null default 'Monday - Friday, 8:00 AM - 5:00 PM',
  about_description text not null default 'Barangay San Pedro is committed to providing responsive, transparent, and efficient public service to all residents. Working together for a progressive and harmonious community.',
  updated_at timestamptz not null default now()
);

insert into barangay_settings (id) values (true);

alter table barangay_settings enable row level security;

create policy "Barangay settings are publicly readable"
  on barangay_settings for select
  using (true);

create policy "Only admin can update barangay settings"
  on barangay_settings for update
  using (public.current_user_role() = 'admin');
