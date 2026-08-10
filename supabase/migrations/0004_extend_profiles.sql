-- Fields needed for the My Profile page (personal info, address, household).
alter table profiles
  add column date_of_birth date,
  add column sex text check (sex in ('Male', 'Female')),
  add column civil_status text,
  add column house_lot_no text,
  add column street text,
  add column purok_zone text,
  add column household_no text,
  add column avatar_url text;
