-- Storage Policies for profile-avatars and vision-images buckets
-- Run this AFTER creating the buckets in Supabase Dashboard

-- ============================================
-- PROFILE AVATARS BUCKET POLICIES
-- ============================================

-- Policy 1: Anyone can view avatars (public read)
CREATE POLICY "Public read access for avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-avatars');

-- Policy 2: Users can upload to their own folder
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 3: Users can update files in their own folder
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 4: Users can delete files in their own folder
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- VISION IMAGES BUCKET POLICIES
-- ============================================

-- Policy 1: Anyone can view vision images (public read)
CREATE POLICY "Public read access for vision images"
ON storage.objects FOR SELECT
USING (bucket_id = 'vision-images');

-- Policy 2: Users can upload to their own folder
CREATE POLICY "Users can upload own vision images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'vision-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 3: Users can update files in their own folder
CREATE POLICY "Users can update own vision images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'vision-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 4: Users can delete files in their own folder
CREATE POLICY "Users can delete own vision images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'vision-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check that policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'objects' 
  AND (policyname LIKE '%avatar%' OR policyname LIKE '%vision%')
ORDER BY policyname;

-- Expected result: 8 policies (4 for each bucket)
