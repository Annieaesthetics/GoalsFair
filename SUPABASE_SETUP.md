# 🚀 Supabase Setup Guide

Follow these steps to set up Supabase for GoalsFair.

---

## Step 1: Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click **"New Project"**
3. Fill in:
   - **Name:** GoalsFair (or your preferred name)
   - **Database Password:** Create a strong password (save it!)
   - **Region:** Choose closest to your users
   - **Pricing Plan:** Free tier is fine for development
4. Click **"Create new project"**
5. Wait 2-3 minutes for project to initialize

---

## Step 2: Get Your Credentials

After project is created:

1. Go to **Project Settings** (gear icon in sidebar)
2. Click **API** in the left menu
3. Copy these values:

```
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

4. Also note your **Project Reference ID** (in Project Settings > General)
   - Looks like: `abcdefghijklmnop`

---

## Step 3: Create `.env.local` File

In your project root, create `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL=your-upstash-url
UPSTASH_REDIS_REST_TOKEN=your-upstash-token

# AI APIs (for Milestone 9 - can add later)
ANTHROPIC_API_KEY=sk-ant-your-key-here
MISTRAL_API_KEY=your-mistral-key-here
GROQ_API_KEY=gsk_your-groq-key-here

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Replace the placeholder values with your actual credentials!**

---

## Step 4: Link Supabase Project

```bash
# Login to Supabase
npx supabase login

# Link your project (use your project reference ID)
npx supabase link --project-ref your-project-ref-id
```

When prompted for database password, use the one you created in Step 1.

---

## Step 5: Apply Database Migrations

```bash
# Push all 14 migrations to your Supabase project
npx supabase db push
```

This will create:
- 24 tables
- 50+ RLS policies
- 20+ functions
- 15+ triggers
- 70+ seed records (affirmations + achievements)

**Expected output:**
```
Applying migration 001_init_profiles.sql...
Applying migration 002_goals_core.sql...
...
Applying migration 014_storage_buckets.sql...
Finished supabase db push.
```

---

## Step 6: Create Storage Buckets

1. Go to **Storage** in Supabase Dashboard
2. Click **"New bucket"**
3. Create first bucket:
   - **Name:** `profile-avatars`
   - **Public:** ✅ Yes
   - **File size limit:** 5 MB
   - **Allowed MIME types:** `image/jpeg,image/png,image/webp,image/gif`
4. Click **"Create bucket"**
5. Repeat for second bucket:
   - **Name:** `vision-images`
   - **Public:** ✅ Yes
   - **File size limit:** 10 MB
   - **Allowed MIME types:** `image/jpeg,image/png,image/webp`

---

## Step 7: Apply Storage Policies

```bash
# Apply storage RLS policies
npx supabase db execute --file supabase/storage_policies.sql
```

**Or** run the SQL manually in Supabase Dashboard > SQL Editor.

---

## Step 8: Configure Google OAuth

1. Go to **Authentication** > **Providers** in Supabase Dashboard
2. Find **Google** and click **Enable**
3. Follow the guide in `AUTH_SETUP_GUIDE.md` to:
   - Create Google OAuth app
   - Get Client ID and Client Secret
   - Add authorized redirect URIs
4. Save the configuration

---

## Step 9: Generate TypeScript Types

```bash
# Generate types from your live database
npx supabase gen types typescript --project-id your-project-ref > types/database.ts
```

This will replace the placeholder types with actual types from your database schema.

---

## Step 10: Verify Setup

```bash
# Check TypeScript compilation
npm run typecheck

# Start development server
npm run dev
```

Visit http://localhost:3000 and test:
1. Sign up with email/password
2. Login
3. Check if profile is created in Supabase Dashboard > Table Editor > profiles
4. Navigate to /dashboard

---

## Troubleshooting

### Issue: "Failed to link project"
**Solution:** Make sure you're logged in: `npx supabase login`

### Issue: "Migration failed"
**Solution:** Check if migrations were already applied. Go to Supabase Dashboard > Database > Migrations to see applied migrations.

### Issue: "Storage bucket already exists"
**Solution:** Skip bucket creation if they already exist, just apply the policies.

### Issue: TypeScript errors persist
**Solution:** 
1. Make sure `.env.local` has correct credentials
2. Restart your dev server: `npm run dev`
3. Regenerate types: `npx supabase gen types typescript --project-id your-ref > types/database.ts`

### Issue: "Cannot find module 'next-themes'"
**Solution:** Already fixed! Package was installed.

---

## Quick Command Reference

```bash
# Login to Supabase
npx supabase login

# Link project
npx supabase link --project-ref your-ref

# Apply migrations
npx supabase db push

# Apply storage policies
npx supabase db execute --file supabase/storage_policies.sql

# Generate types
npx supabase gen types typescript --project-id your-ref > types/database.ts

# Verify
npm run typecheck
npm run dev
```

---

## What's Next?

After setup is complete:
1. Test authentication (signup, login, OAuth)
2. Verify API routes work
3. Check dashboard displays correctly
4. **Start Milestone 6: Goals Feature**

---

**Need help?** Check the error messages and refer to the troubleshooting section above.
