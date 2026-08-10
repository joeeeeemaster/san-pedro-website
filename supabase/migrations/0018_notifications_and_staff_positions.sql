-- Tracks when each user last opened their notifications bell, so unread
-- state (and the count badge) survives page loads instead of resetting.
alter table profiles add column notifications_last_seen_at timestamptz;

-- Distinguishes "Kagawad" from generic "Staff" for display purposes only —
-- both still have role='staff' and identical permissions everywhere.
alter table profiles add column position text;

-- Staff/admin also need to be able to write to OTHER users' avatar folders
-- (the Add User flow uploads a photo for the account being created, before
-- that user has ever signed in themselves).
create policy "Staff/admin can upload any avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and public.current_user_role() in ('staff', 'admin'));

create policy "Staff/admin can update any avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and public.current_user_role() in ('staff', 'admin'));
