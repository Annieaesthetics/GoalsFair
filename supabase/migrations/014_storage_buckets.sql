-- Migration 014: Supabase Storage buckets
-- Description: Configure storage buckets for avatars and vision board images

-- Note: Storage bucket creation and policies must be done via Supabase Dashboard or API
-- This migration documents the required configuration

-- MANUAL SETUP REQUIRED:
-- 1. Go to Supabase Dashboard > Storage
-- 2. Create bucket: profile-avatars
--    - Public: Yes
--    - File size limit: 5MB
--    - Allowed MIME types: image/jpeg, image/png, image/webp, image/gif
-- 3. Create bucket: vision-images
--    - Public: Yes
--    - File size limit: 10MB
--    - Allowed MIME types: image/jpeg, image/png, image/webp

-- Storage policies will be automatically created via Supabase Dashboard
-- Or use the Supabase Management API to create buckets programmatically

-- Helper function to get storage URL
CREATE OR REPLACE FUNCTION get_storage_url(bucket TEXT, path TEXT)
RETURNS TEXT AS $$
DECLARE
  supabase_url TEXT;
BEGIN
  -- Get Supabase URL from environment or use placeholder
  supabase_url := current_setting('app.settings.supabase_url', true);
  
  IF supabase_url IS NULL OR supabase_url = '' THEN
    -- Return relative path if URL not configured
    RETURN format('/storage/v1/object/public/%s/%s', bucket, path);
  END IF;
  
  RETURN format('%s/storage/v1/object/public/%s/%s', supabase_url, bucket, path);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_storage_url IS 'Helper to construct full public URL for storage objects';

-- Document storage bucket configuration
COMMENT ON SCHEMA public IS '
Storage Buckets Configuration:

1. profile-avatars:
   - Public: true
   - File size limit: 5242880 (5MB)
   - Allowed MIME types: image/jpeg, image/png, image/webp, image/gif
   - Folder structure: {user_id}/avatar.{ext}
   - RLS: Users can only upload/update/delete in their own folder

2. vision-images:
   - Public: true
   - File size limit: 10485760 (10MB)
   - Allowed MIME types: image/jpeg, image/png, image/webp
   - Folder structure: {user_id}/{goal_id}/{image_id}.{ext}
   - RLS: Users can only upload/update/delete in their own folder

To create buckets via Supabase Management API:

POST https://api.supabase.com/v1/projects/{ref}/storage/buckets
Headers:
  Authorization: Bearer {service_role_key}
  Content-Type: application/json
Body:
{
  "id": "profile-avatars",
  "name": "profile-avatars",
  "public": true,
  "file_size_limit": 5242880,
  "allowed_mime_types": ["image/jpeg", "image/png", "image/webp", "image/gif"]
}
';

