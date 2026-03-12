# ⚑ Goals Fair

> Turn ambition into achievement — a full-stack visual goal-setting platform with AI coaching, savings tracking, habit loops, and shareable vision boards.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript)](https://typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)](https://supabase.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://vercel.com)

---

## What is Goals Fair?

Goals Fair is a premium personal productivity web app that helps you set life goals, track progress visually, manage savings toward financial targets, build supporting habits, and receive AI-powered coaching — all in one beautiful, focused space.

---

## ✦ Features

| Feature | Description |
|---|---|
| **Visual Goal Boards** | Masonry grid of goal cards with animated progress rings, category badges, and countdown timers |
| **Goal Creation Wizard** | 5-step guided wizard: details → timeline → financials → milestones → vision board |
| **Milestone Tracker** | Drag-to-reorder milestones with completion toggles and auto progress calculation |
| **Savings Engine** | Transaction log, financial projections, monthly/weekly savings requirements |
| **AI Coaching Panel** | Streaming Anthropic-powered insights tailored to your actual goal data |
| **Vision Board** | Pinterest-style image grid per goal with Unsplash image search |
| **Habit System** | Create habits linked to goals, set frequency, log completions, track streaks |
| **Weekly Digest** | Auto-generated AI summary of your week — goals progressed, habits hit, savings added |
| **Achievement System** | 30+ unlockable badges triggered by milestones, streaks, and savings events |
| **Notifications** | In-app notification center + scheduled email reminders via Resend |
| **Shared Boards** | Publish goal boards publicly or share via private link |
| **Analytics Dashboard** | Activity heatmap, completion stats, savings charts |
| **Dark Mode** | Full system-aware dark mode throughout |
| **PWA Support** | Install on mobile, offline goal viewing |
| **Accessibility** | WCAG 2.1 AA compliant — keyboard navigation, ARIA, screen reader tested |

---

## ⚙ Tech Stack

### Frontend
- **[Next.js 14](https://nextjs.org)** — App Router, React Server Components
- **[TypeScript](https://typescriptlang.org)** — Strict mode, zero `any` types
- **[Tailwind CSS](https://tailwindcss.com)** — Utility-first styling with custom design tokens
- **[shadcn/ui](https://ui.shadcn.com)** — Accessible component primitives

### Backend & Data
- **[Supabase](https://supabase.com)** — PostgreSQL, Auth (email + OAuth), Storage, Edge Functions
- **Row Level Security** — Every user table RLS-enforced at the database layer
- **[Zod](https://zod.dev)** — Schema validation on every API route

### State & Data Fetching
- **[TanStack Query v5](https://tanstack.com/query)** — Server state, caching, optimistic updates
- **[Zustand](https://zustand-demo.pmnd.rs)** — Client global state (auth, theme, notifications)
- **[React Hook Form](https://react-hook-form.com)** — Performant forms with Zod resolvers

### AI & Integrations
- **[Anthropic SDK](https://anthropic.com)** — claude-sonnet-4 streaming coaching responses
- **[Resend](https://resend.com)** — Transactional email & weekly digests
- **[Unsplash API](https://unsplash.com/developers)** — Vision board image search
- **[Upstash Redis](https://upstash.com)** — Rate limiting on all API routes

### Testing & CI
- **[Vitest](https://vitest.dev)** — Unit & integration tests (80%+ coverage gate)
- **[Playwright](https://playwright.dev)** — End-to-end test suites
- **[GitHub Actions](https://github.com/features/actions)** — Lint → typecheck → test → build → deploy
- **[Sentry](https://sentry.io)** — Error tracking & monitoring

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project
- An [Anthropic](https://console.anthropic.com) API key
- An [Upstash Redis](https://console.upstash.com) database
- A [Resend](https://resend.com) account
- An [Unsplash](https://unsplash.com/developers) developer app

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/goals-fair.git
cd goals-fair
npm install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
```

Fill in all values in `.env.local`. See `.env.local.example` for descriptions of each variable.

### 3. Apply database migrations

```bash
npx supabase login
npx supabase link --project-ref your-project-ref
npx supabase db push
```

This applies all 14 versioned migration files in `/supabase/migrations/`, including:
- All tables, views, indexes
- Row Level Security policies on every user table
- Triggers for auto-updating timestamps
- Seed data for achievements and affirmations
- Supabase Storage bucket definitions

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 📁 Project Structure

```
goals-fair/
├── app/
│   ├── (auth)/              # Login, signup, reset password
│   ├── (dashboard)/         # All authenticated routes
│   │   ├── goals/           # Goals list, creation, detail
│   │   ├── habits/
│   │   ├── analytics/
│   │   ├── achievements/
│   │   └── settings/
│   └── api/                 # Route handlers
├── components/
│   ├── ui/                  # shadcn/ui primitives
│   ├── goals/               # GoalCard, ProgressRing, Wizard
│   ├── habits/
│   ├── savings/
│   └── ai/                  # Streaming CoachingPanel
├── lib/
│   ├── supabase/            # Client, server, middleware factories
│   ├── validations/         # Zod schemas
│   └── hooks/               # Custom React hooks
├── supabase/
│   ├── migrations/          # 001_init → 014_storage (versioned SQL)
│   └── functions/           # reminder-scheduler, weekly-digest
├── store/                   # Zustand stores
├── types/                   # Global TypeScript types
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/                 # Playwright test suites
```

---

## 🧪 Running Tests

```bash
# Unit & integration tests
npm run test

# With coverage report (80% minimum enforced)
npm run test:coverage

# End-to-end tests (requires running dev server)
npm run test:e2e

# Type checking
npm run typecheck

# Lint
npm run lint
```

---

## 🌐 Deployment

Goals Fair deploys automatically to [Vercel](https://vercel.com) on every merge to `main` via GitHub Actions.

**Manual deployment:**

```bash
npm run build
vercel deploy --prod
```

The CI/CD pipeline runs:
1. ESLint check
2. TypeScript strict mode check
3. Vitest with coverage gate
4. Next.js production build
5. Supabase migration push
6. Playwright E2E on production URL

---

## 🔒 Security

- All API routes authenticate via Supabase before any data access
- Row Level Security enforced at the PostgreSQL layer — cross-user data access is impossible at the query level
- Service role key is server-only — never exposed to client bundles
- File uploads validate MIME type and size before storage
- All user input sanitized before render; Zod-validated before processing
- Rate limiting on all API endpoints via Upstash Redis

---

## 🗺 Roadmap

- [ ] Mobile app (React Native / Expo)
- [ ] Google Calendar sync for milestone due dates
- [ ] Community goal templates marketplace
- [ ] AI goal breakdown from a single sentence
- [ ] Apple Health & Google Fit integration for fitness goals
- [ ] Team/family shared goal spaces

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit with conventional commits: `git commit -m "feat: add habit streak calendar"`
4. Push and open a Pull Request against `main`

All PRs must pass the full CI pipeline (lint, typecheck, tests, build) before review.

---

## 📄 License

[MIT](LICENSE) © 2025 Goals Fair

---

<p align="center">Built with focus. Ship your goals. ⚑</p>
