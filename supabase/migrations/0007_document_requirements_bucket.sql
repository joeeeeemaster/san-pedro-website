insert into storage.buckets (id, name, public)
values ('document-requirements', 'document-requirements', false);

-- Files are stored under a path prefixed with the uploader's own user id,
-- e.g. {resident_id}/valid-id.jpg — policies key off that first path segment.

create policy "Residents can upload their own requirement files"
  on storage.objects for insert
  with check (
    bucket_id = 'document-requirements'
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );

create policy "Files are viewable by owner or staff/admin"
  on storage.objects for select
  using (
    bucket_id = 'document-requirements'
    and (
      (select auth.uid())::text = (storage.foldername(name))[1]
      or exists (
        select 1 from profiles p
        where p.id = (select auth.uid()) and p.role in ('staff', 'admin')
      )
    )
  );
