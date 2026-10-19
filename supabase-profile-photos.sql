-- Hao yangu realtors: profile photos
-- Run this ONCE in Supabase > SQL Editor. It is safe to run again.
--
-- Each signed-in user may add or replace ONLY their own profile photo, stored at
--   photos/avatars/<their user id>.jpg
-- Everyone can still see photos through the public address (the "photos" bucket is public).
-- Nobody can write to another person's photo, and this does not affect listing photos.

begin;

drop policy if exists "avatars: read own" on storage.objects;
create policy "avatars: read own" on storage.objects
  for select to authenticated
  using (bucket_id = 'photos' and name = 'avatars/' || auth.uid()::text || '.jpg');

drop policy if exists "avatars: add own" on storage.objects;
create policy "avatars: add own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'photos' and name = 'avatars/' || auth.uid()::text || '.jpg');

drop policy if exists "avatars: replace own" on storage.objects;
create policy "avatars: replace own" on storage.objects
  for update to authenticated
  using (bucket_id = 'photos' and name = 'avatars/' || auth.uid()::text || '.jpg')
  with check (bucket_id = 'photos' and name = 'avatars/' || auth.uid()::text || '.jpg');

commit;
