# Storage Buckets Setup Guide

## Issue
Storage buckets cannot be created via SQL migrations due to permission restrictions. They must be created via Supabase Dashboard or Management API.

## Solution: Manual Setup via Supabase Dashboard

### Step 1: Create profile-avatars Bucket

1. Go to **Supabase Dashboard** > **Storage**
2. Click **"New bucket"**
3. Configure:
   - **Name:** `profile-avatars`
   - **Public bucket:** ✅ Yes
   - **File size limit:** `5 MB`
   - **Allowed MIME types:** 
     - `image/jpeg`
     - `image/png`
     - `image/webp`
     - `image/gif`
4. Click **"Create bucket"**

### Step 2: Create vision-images Bucket

1. Click **"New bucket"** again
2. Configure:
   - **Name:** `vision-images`
   - **Public bucket:** ✅ Yes
   - **File size limit:** `10 MB`
   - **Allowed MIME types:**
     - `image/jpeg`
     - `image/png`
     - `image/webp`
3. Click **"Create bucket"**

### Step 3: Configure Storage Policies

#### For profile-avatars:

Go to **Storage** > **Policies** > **profile-avatars** > **New Policy**

**Policy 1: Public Read**
```sql
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-avatars');
```

**Policy 2: User Upload**
```sql
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**Policy 3: User Update**
```sql
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**Policy 4: User Delete**
```sql
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### For vision-images:

Go to **Storage** > **Policies** > **vision-images** > **New Policy**

**Policy 1: Public Read**
```sql
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'vision-images');
```

**Policy 2: User Upload**
```sql
CREATE POLICY "Users can upload own images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'vision-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**Policy 3: User Update**
```sql
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'vision-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**Policy 4: User Delete**
```sql
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'vision-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## Alternative: Supabase Management API

If you prefer programmatic setup, use the Supabase Management API:

### Create Buckets via API

```bash
# Get your project ref and service role key from Supabase Dashboard

# Create profile-avatars bucket
curl -X POST "https://api.supabase.com/v1/projects/{project-ref}/storage/buckets" \
  -H "Authorization: Bearer {service-role-key}" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "profile-avatars",
    "name": "profile-avatars",
    "public": true,
    "file_size_limit": 5242880,
    "allowed_mime_types": ["image/jpeg", "image/png", "image/webp", "image/gif"]
  }'

# Create vision-images bucket
curl -X POST "https://api.supabase.com/v1/projects/{project-ref}/storage/buckets" \
  -H "Authorization: Bearer {service-role-key}" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "vision-images",
    "name": "vision-images",
    "public": true,
    "file_size_limit": 10485760,
    "allowed_mime_types": ["image/jpeg", "image/png", "image/webp"]
  }'
```

---

## Folder Structure

### profile-avatars
```
profile-avatars/
└── {user_id}/
    └── avatar.jpg
```

### vision-images
```
vision-images/
└── {user_id}/
    └── {goal_id}/
        ├── image1.jpg
        ├── image2.jpg
        └── image3.jpg
```

---

## Usage in Application

### Upload Avatar
```typescript
const { data, error } = await supabase.storage
  .from('profile-avatars')
  .upload(`${userId}/avatar.jpg`, file, {
    cacheControl: '3600',
    upsert: true
  });
```

### Upload Vision Board Image
```typescript
const { data, error } = await supabase.storage
  .from('vision-images')
  .upload(`${userId}/${goalId}/${imageId}.jpg`, file, {
    cacheControl: '3600',
    upsert: false
  });
```

### Get Public URL
```typescript
const { data } = supabase.storage
  .from('profile-avatars')
  .getPublicUrl(`${userId}/avatar.jpg`);

console.log(data.publicUrl);
```

---

## Verification

After setup, verify:

1. ✅ Both buckets visible in Storage dashboard
2. ✅ Buckets marked as "Public"
3. ✅ File size limits configured
4. ✅ MIME types restricted
5. ✅ 4 policies per bucket (SELECT, INSERT, UPDATE, DELETE)
6. ✅ Test upload via Supabase Dashboard

---

**Status:** Manual setup required  
**Time:** ~5 minutes  
**Next:** Proceed to Milestone 3 after storage setup
