create type profile_status as enum ('active', 'inactive', 'pending');
alter table profiles add column status profile_status not null default 'active';
