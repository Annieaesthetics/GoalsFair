# Goals Fair - Installation Guide

## Step 1: Install Dependencies

Run the following command to install all required packages:

```bash
npm install
```

This will install:
- **Core:** Next.js 16, React 19, TypeScript 5
- **Database:** Supabase (SSR + client)
- **State:** TanStack Query, Zustand
- **Forms:** React Hook Form, Zod
- **UI:** Tailwind CSS, shadcn/ui components, Lucide icons
- **AI:** Anthropic SDK
- **Integrations:** Upstash Redis, Recharts, dnd-kit
- **Testing:** Vitest, Playwright, MSW
- **Dev Tools:** ESLint, Prettier, TypeScript

## Step 2: Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Then fill in your actual values in `.env.local`. You'll need accounts for:
- Supabase (database & auth)
- Anthropic (AI coaching)
- Upstash Redis (rate limiting)
- Resend (email)
- Unsplash (image search)

## Step 3: Verify Installation

Check that everything is working:

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Next Steps

Once installation is complete, proceed to **Milestone 2: Database Schema & Supabase Integration**.
