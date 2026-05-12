# 🚀 Quick Start - Next Steps

You're at **50% completion** (5/10 milestones). Here's what to do next:

---

## ⚡ Immediate Actions (15 minutes)

### 1. Create Supabase Project
- Go to https://supabase.com/dashboard
- Click "New Project"
- Save your database password!
- Wait 2-3 minutes for initialization

### 2. Get Credentials
- Go to Project Settings > API
- Copy:
  - Project URL
  - anon public key
  - service_role key
  - Project Reference ID

### 3. Create `.env.local`
```bash
cp .env.local.example .env.local
```

Then edit `.env.local` and paste your credentials:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
UPSTASH_REDIS_REST_URL=your-upstash-url
UPSTASH_REDIS_REST_TOKEN=your-upstash-token
```

### 4. Apply Migrations
```bash
npx supabase login
npx supabase link --project-ref your-ref-id
npx supabase db push
```

### 5. Create Storage Buckets
In Supabase Dashboard > Storage:
- Create `profile-avatars` (5MB, public)
- Create `vision-images` (10MB, public)

Then apply policies:
```bash
npx supabase db execute --file supabase/storage_policies.sql
```

### 6. Generate Types
```bash
npx supabase gen types typescript --project-id your-ref > types/database.ts
```

### 7. Verify & Run
```bash
npm run typecheck
npm run dev
```

Visit http://localhost:3000

---

## 📋 Checklist

- [ ] Supabase project created
- [ ] `.env.local` file created with credentials
- [ ] Supabase project linked (`npx supabase link`)
- [ ] Migrations applied (`npx supabase db push`)
- [ ] Storage buckets created
- [ ] Storage policies applied
- [ ] TypeScript types generated
- [ ] Dev server running (`npm run dev`)
- [ ] Can sign up and login
- [ ] Dashboard displays correctly

---

## 🔍 Check Your Setup

Run this to see what's missing:
```bash
./check-setup.sh
```

---

## 📚 Detailed Guides

- **Full Setup:** `SUPABASE_SETUP.md`
- **Google OAuth:** `AUTH_SETUP_GUIDE.md`
- **Storage Buckets:** `STORAGE_SETUP_GUIDE.md`
- **Project Status:** `PROJECT_STATUS.md`

---

## 🎯 After Setup is Complete

**Start Milestone 6: Goals Feature**

We'll build:
- GoalCard with animated progress rings
- Goal creation wizard (5 steps)
- Goal list/grid with filters
- Milestone drag-and-drop
- Goal detail page

---

## ❓ Need Help?

Common issues:
- **"Migration failed"** → Check if already applied in Dashboard
- **"TypeScript errors"** → Make sure types are generated
- **"Cannot connect"** → Check `.env.local` credentials
- **"Storage error"** → Make sure buckets are created

See `SUPABASE_SETUP.md` troubleshooting section.

---

**Ready?** Follow the steps above, then let me know when setup is complete!
