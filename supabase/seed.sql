-- Dev/test seed data. Run manually against a fresh project with:
--   supabase db push --include-seed
-- (never against production). Already applied directly to the live project
-- this repo is connected to — this file exists so a fresh environment can
-- reproduce the same starting state.

insert into equipment (name, total_quantity, available_quantity, status, photo_url) values
  ('Monoblock Chairs', 250, 120, 'Available', '/brand/tier-3/monoblock-chairs.png'),
  ('Folding Tables', 50, 12, 'Available', '/brand/tier-3/folding-tables.png'),
  ('Event Tents', 8, 3, 'Rented', '/brand/tier-3/event-tent.png'),
  ('Sound System', 6, 1, 'Under Maintenance', '/brand/tier-3/sound-system.png'),
  ('Tarpaulin Stands', 30, 15, 'Available', '/brand/tier-3/tarpaulin-stand.png');

insert into announcements (slug, title, category, content, cover_image_url, status, published_at) values
('sarimanok-festival-2025', 'Sarimanok Festival 2025 Schedule of Activities', 'Fiesta',
 E'We are excited to announce the celebration of Sarimanok Festival 2025! Join us as we honor our rich culture, vibrant traditions, and the spirit of unity in San Pedro, Bacacay, Albay.\n\nMay 24, 9:00 AM — Street Dancing Parade\nMay 24, 2:00 PM — Cultural Shows\nMay 24, 7:00 PM — Night Fiesta & Concert\nMay 25, 8:00 AM — Thanksgiving Mass\nMay 25, 10:00 AM — Community Games and Activities\n\nLet''s come together and celebrate our heritage. Everyone is welcome!',
 '/brand/tier-2/festival-sarimanok-dancer.png', 'published', '2025-05-20 09:00:00+08'),
('drainage-improvement-project', 'Drainage Improvement Project Update', 'Public Works',
 E'The barangay''s drainage improvement project along Poblacion Road is progressing on schedule.\n\nExpect partial road closures and rerouted traffic near the work site through the end of the month.\n\nWe appreciate residents'' patience as we work to reduce flooding during the rainy season.',
 '/brand/tier-2/road-repair.png', 'published', '2025-05-16 09:00:00+08'),
('pulong-barangay-highlights', 'Pulong Barangay Highlights', 'Assembly',
 E'Residents gathered for this quarter''s Pulong Barangay to discuss ongoing projects, budget allocation, and community concerns.\n\nKey resolutions passed include continued funding for the drainage project and expanded hours for document requests.',
 '/brand/tier-2/barangay-assembly.png', 'published', '2025-05-12 09:00:00+08'),
('libreng-medical-mission', 'Libreng Medical Mission', 'Health',
 E'In partnership with the Municipal Health Office, Barangay San Pedro will hold a free medical mission this Sunday.\n\nServices include general check-ups, blood pressure monitoring, and free medicines for common ailments.\n\nBring a valid ID and your barangay residency card if available.',
 '/brand/tier-2/medical-mission.png', 'published', '2025-05-18 09:00:00+08'),
('coastal-cleanup-drive', 'Coastal Clean-up Drive', 'Environment',
 E'Barangay San Pedro invites all residents to join this Saturday''s coastal clean-up drive.\n\nMeet at the barangay hall at 6:00 AM. Gloves and trash bags will be provided.',
 '/brand/tier-2/coastal-cleanup.png', 'published', '2025-05-10 06:00:00+08'),
('flag-raising-ceremony', 'Flag Raising Ceremony', 'Events',
 E'All residents and barangay officials are invited to the monthly flag raising ceremony at the barangay plaza.\n\nBrief announcements on ongoing programs will follow the ceremony.',
 '/brand/tier-2/flag-ceremony.png', 'published', '2025-05-17 07:00:00+08'),
('fisherfolk-meeting', 'Fisherfolk Meeting', 'Events',
 E'A meeting for local fisherfolk will be held to discuss the upcoming fishing season, safety guidelines, and available support programs.',
 '/brand/tier-2/fisherfolk-lake.png', 'published', '2025-05-14 14:00:00+08'),
('scholarship-application-open', 'Scholarship Application Open', 'Events',
 E'The Barangay Scholarship Program is now accepting applications for the 2025 academic year.\n\nQualified graduating high school students who are bona fide residents of San Pedro may apply at the barangay hall.\n\nDeadline for submission of requirements is May 31, 2025.',
 '/brand/tier-2/scholarship-graduation.png', 'published', '2025-05-08 10:00:00+08');
