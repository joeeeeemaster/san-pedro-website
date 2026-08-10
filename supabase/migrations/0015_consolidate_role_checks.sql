-- These tables' policies query `profiles` (not themselves), so they were
-- never at risk of the recursion bug fixed on `profiles` itself. But now
-- that public.current_user_role() exists as the correct pattern, moving
-- everything onto it for consistency and one fewer join per check.

drop policy "Requests are viewable by owner or staff/admin" on document_requests;
drop policy "Staff/admin can update any request" on document_requests;

create policy "Requests are viewable by owner or staff/admin"
  on document_requests for select
  using ((select auth.uid()) = resident_id or public.current_user_role() in ('staff', 'admin'));

create policy "Staff/admin can update any request"
  on document_requests for update
  using (public.current_user_role() in ('staff', 'admin'));

drop policy "Household members are manageable by owner or staff/admin" on household_members;

create policy "Household members are manageable by owner or staff/admin"
  on household_members for all
  using ((select auth.uid()) = resident_id or public.current_user_role() in ('staff', 'admin'))
  with check ((select auth.uid()) = resident_id or public.current_user_role() in ('staff', 'admin'));

drop policy "Published announcements are viewable by everyone, drafts by staff/admin" on announcements;
drop policy "Staff/admin can insert announcements" on announcements;
drop policy "Staff/admin can update announcements" on announcements;
drop policy "Staff/admin can delete announcements" on announcements;

create policy "Published announcements are viewable by everyone, drafts by staff/admin"
  on announcements for select
  using (status = 'published' or public.current_user_role() in ('staff', 'admin'));

create policy "Staff/admin can insert announcements"
  on announcements for insert
  with check (public.current_user_role() in ('staff', 'admin'));

create policy "Staff/admin can update announcements"
  on announcements for update
  using (public.current_user_role() in ('staff', 'admin'));

create policy "Staff/admin can delete announcements"
  on announcements for delete
  using (public.current_user_role() in ('staff', 'admin'));

drop policy "Blotters are manageable by staff/admin only" on blotters;

create policy "Blotters are manageable by staff/admin only"
  on blotters for all
  using (public.current_user_role() in ('staff', 'admin'))
  with check (public.current_user_role() in ('staff', 'admin'));

drop policy "Equipment is manageable by staff/admin only" on equipment;

create policy "Equipment is manageable by staff/admin only"
  on equipment for all
  using (public.current_user_role() in ('staff', 'admin'))
  with check (public.current_user_role() in ('staff', 'admin'));

drop policy "Equipment rentals are manageable by staff/admin only" on equipment_rentals;

create policy "Equipment rentals are manageable by staff/admin only"
  on equipment_rentals for all
  using (public.current_user_role() in ('staff', 'admin'))
  with check (public.current_user_role() in ('staff', 'admin'));

drop policy "Certificates are viewable by owner or staff/admin" on certificates;
drop policy "Staff/admin can create certificates" on certificates;

create policy "Certificates are viewable by owner or staff/admin"
  on certificates for select
  using ((select auth.uid()) = resident_id or public.current_user_role() in ('staff', 'admin'));

create policy "Staff/admin can create certificates"
  on certificates for insert
  with check (public.current_user_role() in ('staff', 'admin'));
