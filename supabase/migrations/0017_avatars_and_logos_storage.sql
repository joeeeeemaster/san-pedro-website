-- Public buckets: public=true means objects are servable via the public URL
-- without needing a SELECT policy — only writes need RLS restrictions.
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);
insert into storage.buckets (id, name, public) values ('logos', 'logos', true);

-- Avatars: each user can only write to their own folder, e.g. {user_id}/avatar.jpg
create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and (select auth.uid())::text = (storage.foldername(name))[1]);

create policy "Users can update their own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and (select auth.uid())::text = (storage.foldername(name))[1]);

-- Logos: admin only, any path (fixed filenames so re-upload overwrites via upsert)
create policy "Admin can upload logos"
  on storage.objects for insert
  with check (bucket_id = 'logos' and public.current_user_role() = 'admin');

create policy "Admin can update logos"
  on storage.objects for update
  using (bucket_id = 'logos' and public.current_user_role() = 'admin');

-- barangay_settings gets the override URLs; null = fall back to the static default files
alter table barangay_settings
  add column official_seal_url text,
  add column sk_logo_url text;
