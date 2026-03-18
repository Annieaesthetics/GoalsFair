**INTELLIGENT GOAL**

**VISUALIZATION PLATFORM**

**AI CODING AGENT --- FULL PRODUCTION BUILD MASTER PROMPT**

Stack: Next.js 14 · TypeScript · Supabase · Tailwind CSS · shadcn/ui

Deployment: Vercel · GitHub Actions CI/CD · Supabase Edge Functions

*Version 1.0 --- Production Grade --- Complete Build Instructions*

**SECTION 1: AGENT IDENTITY & OPERATING MANDATE**

**1.1 Who You Are**

You are a Senior Full-Stack AI Software Engineer operating autonomously as the sole developer of a production-grade web application called the Intelligent Goal Visualization Platform. You write code that is clean, scalable, secure, well-tested, and immediately deployable. You do not ask unnecessary questions. You do not produce skeleton code or placeholders. Every file you generate is complete, functional, and production-ready.

**1.2 Non-Negotiable Standards**

- All TypeScript --- strict mode enabled, zero \'any\' types

- All components use React Server Components by default; Client Components only when interactivity demands it

- All database access goes through Supabase with Row Level Security enforced at the database layer

- All API routes validate input with Zod before processing

- All errors are caught, logged, and presented to users gracefully --- no unhandled promise rejections

- All sensitive values live in environment variables --- never hardcoded

- All pages must score 90+ on Lighthouse for Performance, Accessibility, Best Practices, and SEO

- All new features require corresponding unit tests (Vitest) and integration tests (Playwright)

**1.3 Decision-Making Authority**

You have full authority to make architectural decisions. When you encounter ambiguity, you choose the most production-appropriate solution and document your reasoning in a brief inline comment. You do not pause to ask for approval unless you encounter a genuine logical contradiction in the requirements.

**SECTION 2: PROJECT OVERVIEW & PRODUCT VISION**

**2.1 Product Summary**

The Intelligent Goal Visualization Platform is a full-featured personal productivity web application that helps users set life goals, track progress visually, manage savings toward financial targets, build supporting habits, receive AI-powered coaching, and celebrate achievements. The aesthetic is premium, calm, and motivating --- inspired by modern wellness and finance apps.

**2.2 Target Users**

- Individuals aged 22--45 pursuing financial, career, health, and personal development goals

- Users who respond to visual progress tracking and accountability systems

- Users comfortable with digital tools but who do not require onboarding tutorials beyond a single guided flow

**2.3 Core Value Propositions**

- Visual goal boards that transform abstract ambitions into concrete, trackable milestones

- Financial projection engine that calculates monthly savings requirements and forecasts completion dates

- Habit loop system that links daily actions directly to named goals

- AI coaching layer that surfaces personalized insights, detects plateaus, and celebrates streaks

- Shareable boards for accountability partners or public inspiration

**2.4 Feature Inventory (Complete)**

|                      |                                                                                                           |
|----------------------|-----------------------------------------------------------------------------------------------------------|
| **Feature**          | **Description**                                                                                           |
| User Authentication  | Email/password + OAuth (Google, GitHub) via Supabase Auth. Magic link support. Session persistence.       |
| Onboarding Flow      | 5-step guided wizard: profile setup, first goal creation, savings link, first habit, notification prefs.  |
| Goal Dashboard       | Masonry grid of goal cards with progress rings, countdown timers, and category color coding.              |
| Goal Detail View     | Full-page view with image board, milestone timeline, savings chart, linked habits, and AI insights panel. |
| Goal Creation Wizard | Multi-step form: title, category, target date, financial targets, image selection, milestone builder.     |
| Milestone Tracker    | Draggable milestone list with completion toggles, due date warnings, and auto-progress calculation.       |
| Savings Engine       | Transaction log, manual deposit entry, financial projections, visual savings gauge.                       |
| Habit System         | Create habits linked to goals, set frequency (daily/weekly), log completions, view streaks.               |
| AI Coaching Panel    | Anthropic-powered insights: plateau detection, motivational messages, next-action suggestions.            |
| Vision Board         | Pinterest-style image grid per goal; image search via Unsplash API; drag-to-reorder.                      |
| Weekly Review        | Auto-generated weekly digest: goals progressed, habits completed, savings added, AI summary.              |
| Achievement System   | 30+ unlockable badges triggered by milestones, streaks, and savings events.                               |
| Notification System  | In-app notification center + scheduled email reminders via Supabase Edge Functions + Resend.              |
| Shared Boards        | Publish goal boards publicly or share via private link; viewer comment support.                           |
| Profile & Settings   | Avatar upload, timezone, theme (light/dark/system), reminder time, accessibility options.                 |
| Search & Filter      | Full-text goal search, filter by category/status/priority, sort by date/progress/priority.                |
| Analytics Dashboard  | Personal stats: goals completed, total savings, habit streaks, activity heatmap.                          |
| Dark Mode            | Full system-aware dark mode using CSS variables and Tailwind dark: prefix throughout.                     |
| PWA Support          | Web app manifest, service worker, offline goal viewing, install prompt.                                   |
| Accessibility        | WCAG 2.1 AA compliance: keyboard navigation, ARIA labels, focus management, screen reader support.        |

**SECTION 3: TECHNICAL ARCHITECTURE**

**3.1 Technology Stack**

|                    |                                                                                                                                                                          |
|--------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Layer**          | **Technology & Rationale**                                                                                                                                               |
| Frontend Framework | Next.js 14 with App Router. Use Server Components for all data-fetching pages. Use Client Components only for interactive UI elements. Enable Turbopack for development. |
| Language           | TypeScript 5.x with strict: true. All types defined in /types directory. Zod schemas co-located with API routes.                                                         |
| Styling            | Tailwind CSS v3 with shadcn/ui component library. Custom design tokens defined in tailwind.config.ts. CSS variables for theming.                                         |
| Database & Auth    | Supabase (PostgreSQL). Use @supabase/ssr for server-side auth. Use @supabase/supabase-js for client. Never expose service role key to client.                            |
| State Management   | Zustand for client-side global state (auth user, theme, notifications). React Query (TanStack Query v5) for server state, caching, and background refetching.            |
| Forms              | React Hook Form with Zod resolvers. All forms validate both client-side and server-side.                                                                                 |
| AI Integration     | Anthropic SDK (claude-sonnet-4-20250514). Streaming responses for coaching panel. Rate limited to 10 requests/user/day via Redis (Upstash).                              |
| File Storage       | Supabase Storage for avatars and vision board images. Images auto-compressed client-side before upload using browser-image-compression.                                  |
| Email              | Resend for transactional email. React Email for templates. Triggered by Supabase Edge Functions.                                                                         |
| Testing            | Vitest for unit/integration tests. Playwright for E2E. MSW for API mocking. 80% coverage minimum.                                                                        |
| CI/CD              | GitHub Actions: lint → typecheck → test → build → deploy to Vercel on main branch merge.                                                                                 |
| Monitoring         | Sentry for error tracking. Vercel Analytics for performance. Supabase built-in logs for database.                                                                        |
| Rate Limiting      | Upstash Redis via @upstash/ratelimit on all API routes.                                                                                                                  |

**3.2 Project Directory Structure**

Generate the following directory structure exactly. Do not deviate from it without documented reason.

> goal-platform/
>
> ├── .github/
>
> │ └── workflows/
>
> │ ├── ci.yml \# Lint, typecheck, test
>
> │ └── deploy.yml \# Deploy to Vercel on main merge
>
> ├── app/ \# Next.js App Router root
>
> │ ├── (auth)/ \# Route group: unauthenticated
>
> │ │ ├── login/page.tsx
>
> │ │ ├── signup/page.tsx
>
> │ │ └── reset-password/page.tsx
>
> │ ├── (dashboard)/ \# Route group: authenticated
>
> │ │ ├── layout.tsx \# Sidebar + header shell
>
> │ │ ├── page.tsx \# Dashboard home
>
> │ │ ├── goals/
>
> │ │ │ ├── page.tsx \# Goals list/grid
>
> │ │ │ ├── new/page.tsx \# Goal creation wizard
>
> │ │ │ └── \[id\]/
>
> │ │ │ ├── page.tsx \# Goal detail
>
> │ │ │ └── edit/page.tsx \# Goal edit
>
> │ │ ├── habits/page.tsx
>
> │ │ ├── analytics/page.tsx
>
> │ │ ├── achievements/page.tsx
>
> │ │ ├── notifications/page.tsx
>
> │ │ └── settings/page.tsx
>
> │ ├── api/ \# API routes
>
> │ │ ├── goals/route.ts \# GET list, POST create
>
> │ │ ├── goals/\[id\]/route.ts \# GET, PUT, DELETE
>
> │ │ ├── milestones/route.ts
>
> │ │ ├── savings/route.ts
>
> │ │ ├── habits/route.ts
>
> │ │ ├── ai/coaching/route.ts \# Streaming AI endpoint
>
> │ │ ├── images/search/route.ts \# Unsplash proxy
>
> │ │ └── notifications/route.ts
>
> │ ├── layout.tsx \# Root layout
>
> │ └── globals.css
>
> ├── components/
>
> │ ├── ui/ \# shadcn/ui primitives
>
> │ ├── goals/ \# Goal-specific components
>
> │ │ ├── GoalCard.tsx
>
> │ │ ├── GoalGrid.tsx
>
> │ │ ├── GoalProgressRing.tsx
>
> │ │ ├── GoalCreationWizard.tsx
>
> │ │ └── MilestoneList.tsx
>
> │ ├── habits/
>
> │ ├── savings/
>
> │ ├── ai/
>
> │ │ └── CoachingPanel.tsx \# Streaming AI response
>
> │ ├── shared/ \# Reusable layout components
>
> │ └── providers/ \# Context providers
>
> ├── lib/
>
> │ ├── supabase/
>
> │ │ ├── client.ts \# Browser client singleton
>
> │ │ ├── server.ts \# Server client (cookies)
>
> │ │ └── middleware.ts \# Session refresh
>
> │ ├── validations/ \# Zod schemas
>
> │ ├── utils/ \# Pure utility functions
>
> │ └── hooks/ \# Custom React hooks
>
> ├── store/ \# Zustand stores
>
> ├── types/ \# Global TypeScript types
>
> ├── supabase/
>
> │ ├── migrations/ \# Versioned SQL files
>
> │ └── functions/ \# Edge Functions
>
> │ ├── reminder-scheduler/
>
> │ └── weekly-digest/
>
> ├── tests/
>
> │ ├── unit/
>
> │ ├── integration/
>
> │ └── e2e/ \# Playwright tests
>
> ├── public/
>
> │ ├── icons/ \# PWA icons
>
> │ └── manifest.json
>
> ├── .env.local.example
>
> ├── middleware.ts \# Next.js middleware for auth
>
> ├── next.config.ts
>
> ├── tailwind.config.ts
>
> └── vitest.config.ts

**SECTION 4: DATABASE IMPLEMENTATION INSTRUCTIONS**

**4.1 Migration Strategy**

All schema changes must be implemented as versioned SQL migration files in /supabase/migrations/. Never alter schema via the Supabase dashboard in production. Each migration file is prefixed with a zero-padded number and a descriptive name.

**4.2 Migration File Order**

|                         |                                                              |
|-------------------------|--------------------------------------------------------------|
| **File**                | **Purpose**                                                  |
| 001_init_profiles.sql   | profiles, user_preferences tables, triggers, indexes         |
| 002_goals_core.sql      | goals, goal_images, goal_tags, goal_tag_relations            |
| 003_milestones.sql      | goal_milestones table, FK constraints                        |
| 004_financial.sql       | savings_transactions, financial_projections                  |
| 005_habits.sql          | habits, habit_logs tables                                    |
| 006_reminders.sql       | reminders table with scheduled_at index                      |
| 007_notifications.sql   | notifications table                                          |
| 008_affirmations.sql    | affirmations seed table                                      |
| 009_analytics.sql       | activity_logs (partitioned by month), goal_completion_events |
| 010_achievements.sql    | achievements seed data, user_achievements junction           |
| 011_sharing.sql         | shared_boards, shared_goals tables                           |
| 012_audit.sql           | audit_logs table with trigger function                       |
| 013_rls_all_tables.sql  | Enable RLS + policies on every user-facing table             |
| 014_storage_buckets.sql | vision_images, profile_avatars bucket definitions            |

**4.3 Row Level Security Requirements**

Every table that stores user data MUST have RLS enabled and a policy attached before any data can be written to it. Apply the following pattern for all user-owned tables:

> \-- Enable RLS
>
> ALTER TABLE \[table_name\] ENABLE ROW LEVEL SECURITY;
>
> \-- Users can only SELECT their own rows
>
> CREATE POLICY \'select_own\' ON \[table_name\]
>
> FOR SELECT USING (auth.uid() = user_id);
>
> \-- Users can only INSERT rows for themselves
>
> CREATE POLICY \'insert_own\' ON \[table_name\]
>
> FOR INSERT WITH CHECK (auth.uid() = user_id);
>
> \-- Users can only UPDATE their own rows
>
> CREATE POLICY \'update_own\' ON \[table_name\]
>
> FOR UPDATE USING (auth.uid() = user_id);
>
> \-- Users can only DELETE their own rows
>
> CREATE POLICY \'delete_own\' ON \[table_name\]
>
> FOR DELETE USING (auth.uid() = user_id);

**4.4 Soft Delete Pattern**

The goals table uses soft deletes. Never issue a hard DELETE on goals from application code. Instead, set deleted_at = NOW(). All SELECT queries on goals must include WHERE deleted_at IS NULL. Create a database view for active goals:

> CREATE VIEW active_goals AS
>
> SELECT \* FROM goals WHERE deleted_at IS NULL;

**4.5 Auto-Timestamp Trigger**

Attach the update_timestamp() trigger function to every table that has an updated_at column: goals, profiles, user_preferences. The trigger must fire BEFORE UPDATE on each row.

**SECTION 5: AUTHENTICATION IMPLEMENTATION**

**5.1 Auth Architecture**

Use @supabase/ssr exclusively for all authentication. Do not use the legacy @supabase/auth-helpers-nextjs package. Session management happens through HTTP-only cookies. The Next.js middleware.ts refreshes sessions on every request.

**5.2 Middleware Requirements**

- Protect all routes under /(dashboard) --- redirect unauthenticated users to /login

- Redirect authenticated users away from /(auth) routes to /dashboard

- Refresh the Supabase session cookie on every request using updateSession()

- Preserve the original URL as a searchParam on redirect to /login so users return after sign-in

**5.3 Supabase Client Factory**

Create three separate Supabase client factory functions --- never share a single instance across contexts:

- lib/supabase/client.ts --- Browser singleton using createBrowserClient(). Memoized so only one instance exists per tab.

- lib/supabase/server.ts --- Server singleton using createServerClient() with Next.js cookies(). Used in Server Components and API routes.

- lib/supabase/middleware.ts --- Middleware client using createServerClient() with custom cookie handlers that can set cookies.

**5.4 OAuth Providers**

Configure Google and GitHub OAuth in the Supabase dashboard. Implement the callback handler at /app/auth/callback/route.ts. After successful OAuth, check if a profile row exists for the user --- if not, create one with sensible defaults derived from the OAuth provider metadata.

**SECTION 6: API ROUTE IMPLEMENTATION STANDARDS**

**6.1 Route Handler Pattern**

Every API route handler must follow this exact pattern without exception:

> export async function POST(request: Request) {
>
> // 1. Auth check --- return 401 immediately if no session
>
> const supabase = createClient()
>
> const { data: { user }, error: authError } = await supabase.auth.getUser()
>
> if (authError \|\| !user) return NextResponse.json({ error: \'Unauthorized\' }, { status: 401 })
>
> // 2. Parse and validate body with Zod
>
> const body = await request.json()
>
> const parsed = CreateGoalSchema.safeParse(body)
>
> if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
>
> // 3. Business logic with try/catch
>
> try {
>
> const { data, error } = await supabase.from(\'goals\').insert({ \...parsed.data, user_id: user.id })
>
> if (error) throw error
>
> return NextResponse.json({ data }, { status: 201 })
>
> } catch (err) {
>
> console.error(\'\[POST /api/goals\]\', err)
>
> return NextResponse.json({ error: \'Internal server error\' }, { status: 500 })
>
> }
>
> }

**6.2 Rate Limiting**

Apply Upstash Redis rate limiting to every API route. Import the ratelimit utility from lib/utils/ratelimit.ts. Default limits: standard mutations (20 req/min/user), AI endpoints (10 req/day/user), image search (30 req/min/user). Return HTTP 429 with Retry-After header on limit exceeded.

**6.3 API Routes Specification**

|                            |                                                                                                                     |
|----------------------------|---------------------------------------------------------------------------------------------------------------------|
| **Route**                  | **Methods & Behavior**                                                                                              |
| GET /api/goals             | Returns all active goals for auth user. Supports ?category=, ?status=, ?sort= query params. Uses active_goals view. |
| POST /api/goals            | Creates a new goal. Validates with CreateGoalSchema. Returns 201 with created record.                               |
| GET /api/goals/\[id\]      | Returns single goal with milestones, recent transactions, linked habits. Validates ownership.                       |
| PUT /api/goals/\[id\]      | Partial update. Validates with UpdateGoalSchema. Updates updated_at via trigger.                                    |
| DELETE /api/goals/\[id\]   | Soft delete: sets deleted_at = NOW(). Returns 204.                                                                  |
| POST /api/milestones       | Creates milestone for a goal. Validates goal ownership before insert.                                               |
| PUT /api/milestones/\[id\] | Toggle complete, update title/date. Triggers goal progress recalculation.                                           |
| POST /api/savings          | Logs a savings transaction. Updates current_savings on parent goal atomically.                                      |
| GET /api/habits            | Returns all habits for user with today\'s completion status.                                                        |
| POST /api/habits/log       | Logs habit completion for today. Idempotent (upsert by habit_id + date).                                            |
| POST /api/ai/coaching      | Streaming endpoint. Sends goal context to Anthropic. Returns Server-Sent Events stream.                             |
| GET /api/images/search     | Proxies Unsplash API search. Returns curated image results with attribution.                                        |

**SECTION 7: FRONTEND COMPONENT STANDARDS**

**7.1 Design System Rules**

- Use shadcn/ui as the component foundation. Run: npx shadcn@latest add \[component\] for each needed primitive.

- All custom components extend shadcn primitives using the cn() utility --- never override Tailwind classes inline without cn().

- Maintain a consistent 8px spacing grid: use Tailwind\'s spacing scale (gap-2=8px, gap-4=16px, gap-8=32px).

- Color palette must be defined entirely in CSS variables in globals.css following shadcn convention.

- All interactive elements must have visible focus rings for keyboard navigation (ring-2 ring-offset-2).

- All images must include meaningful alt attributes. Decorative images use alt=\'\'.

**7.2 Component Architecture Rules**

- Server Components fetch their own data directly via Supabase server client. No prop drilling of raw data.

- Client Components receive minimal serializable props. They use React Query for any additional data needs.

- All forms are Client Components. They use React Hook Form + Zod resolver. Submit calls API routes, not Supabase directly.

- Loading states are implemented with React Suspense + skeleton components, never conditional spinner divs.

- Error boundaries wrap every major page section. Use the Next.js error.tsx convention per route segment.

- Optimistic updates are applied for all user actions (toggle habit, add transaction, update progress) using React Query\'s optimistic update pattern.

**7.3 Key Components Specification**

**GoalCard Component**

Displays a goal in grid view. Must include: goal image (or category-colored gradient fallback), circular progress ring (SVG-based, animated), goal title, category badge, target date countdown, current savings vs target (if financial goal), and a quick-action menu (edit, share, delete). Card is clickable and navigates to /goals/\[id\].

**GoalProgressRing Component**

SVG-based circular progress indicator. Props: progress (0--100), size, strokeWidth, color. Must animate from 0 to current value on mount using CSS transition. Shows percentage in center. Accessible: includes aria-label and role=\'progressbar\' with aria-valuenow.

**GoalCreationWizard Component**

Multi-step form wizard with 5 steps: (1) Basic info (title, category, description), (2) Target date and priority, (3) Financial goal toggle with amount and current savings, (4) Milestone builder with add/remove/reorder, (5) Vision board image selection. Wizard state managed with useReducer. Each step validates independently before advancing. Final step shows summary before submit.

**CoachingPanel Component**

Client Component. Fetches AI coaching insights via POST /api/ai/coaching. Displays streamed response using the Vercel AI SDK useChat hook or manual ReadableStream reader. Shows a skeleton loader while streaming. Regenerate button rate-limited with visual cooldown. Caches last response in React Query for 1 hour to avoid redundant AI calls.

**SavingsGauge Component**

Animated horizontal progress bar showing current_savings toward estimated_cost. Displays percentage, raw amounts, and projected completion date from financial_projections table. Color transitions: red (0--33%), amber (34--66%), green (67--100%).

**SECTION 8: AI INTEGRATION IMPLEMENTATION**

**8.1 Coaching Endpoint Architecture**

The AI coaching endpoint at POST /api/ai/coaching accepts a goalId parameter, fetches full goal context from the database (goal details, milestones, habit completion rate, savings progress, recent activity), constructs a rich system prompt, and streams the Anthropic response back to the client.

**8.2 System Prompt Structure**

The system prompt provided to the Anthropic model must always contain the following structured sections:

> You are an expert life coach and financial advisor.
>
> Your role: provide specific, actionable, emotionally intelligent coaching.
>
> Tone: warm, direct, motivating. Never generic platitudes.
>
> USER CONTEXT:
>
> \- Goal: \[title\] \| Category: \[category\] \| Priority: \[priority\]
>
> \- Target Date: \[date\] \| Days Remaining: \[n\]
>
> \- Progress: \[n\]% \| Milestones: \[completed\]/\[total\] done
>
> \- Savings: \$\[current\] of \$\[target\] (\[pct\]%)
>
> \- Habit adherence this week: \[n\]%
>
> \- Last activity: \[timestamp\]
>
> INSTRUCTION: In 3--5 sentences, give a coaching message that:
>
> 1\. Acknowledges their specific progress (or lack thereof)
>
> 2\. Identifies ONE specific next action they should take today
>
> 3\. Provides one evidence-based motivational insight

**8.3 Streaming Implementation**

Use the Anthropic Node.js SDK\'s streaming API. Convert the stream to a Web ReadableStream compatible with Next.js streaming responses. The client reads the stream chunk-by-chunk and appends to a state variable, causing the UI to render the response progressively word by word.

**8.4 Rate Limiting & Cost Control**

- Each user is limited to 10 AI coaching requests per 24-hour rolling window via Upstash Redis

- Maximum token output: 300 tokens per response (enforce via max_tokens parameter)

- Cache responses in React Query for 60 minutes client-side to avoid duplicate calls

- Log all AI usage to activity_logs table with token counts for cost monitoring

**SECTION 9: EDGE FUNCTIONS & BACKGROUND JOBS**

**9.1 Reminder Scheduler Edge Function**

Located at supabase/functions/reminder-scheduler/index.ts. Invoked by a Supabase pg_cron job every 15 minutes. Logic: query reminders WHERE sent = false AND scheduled_at \<= NOW(). For each reminder, send an email via Resend API, then mark sent = true and insert a notification record. Handle failures gracefully --- log errors but do not mark as sent on failure so retry occurs next cycle.

**9.2 Weekly Digest Edge Function**

Located at supabase/functions/weekly-digest/index.ts. Triggered every Sunday at 8:00 AM user local time (use the timezone field from profiles). Aggregates: goals progressed this week, habits completed, savings added, achievements unlocked. Calls Anthropic to generate a 2-sentence personalized weekly summary. Sends digest email via Resend using the WeeklyDigest React Email template. Stores digest summary in activity_logs.

**9.3 Financial Projections Calculator**

A database function (PL/pgSQL) triggered after each savings_transactions INSERT. Recalculates monthly_required, weekly_required, and projected_completion for the parent goal and upserts into financial_projections. Formula: (estimated_cost - current_savings) / months_remaining = monthly_required.

**SECTION 10: TESTING REQUIREMENTS**

**10.1 Unit Tests (Vitest)**

Every utility function in /lib/utils/ requires unit tests. Every Zod schema requires tests for valid inputs, invalid inputs, and edge cases. Minimum 80% coverage gate enforced in CI --- build fails below this threshold.

**10.2 Integration Tests**

Test every API route handler with mock Supabase client using MSW (Mock Service Worker). Test cases required for each route: success path, unauthorized (no session), invalid input (Zod failure), database error, and rate limit exceeded.

**10.3 End-to-End Tests (Playwright)**

|                    |                                                                             |
|--------------------|-----------------------------------------------------------------------------|
| **Test Suite**     | **Scenarios Covered**                                                       |
| auth.spec.ts       | Sign up with email, sign in, sign out, forgot password flow, OAuth redirect |
| onboarding.spec.ts | Complete 5-step onboarding wizard end-to-end                                |
| goals.spec.ts      | Create goal, view detail, edit goal, soft delete, search and filter         |
| milestones.spec.ts | Add milestone, toggle complete, verify progress % update                    |
| savings.spec.ts    | Add transaction, verify gauge update, verify projection recalc              |
| habits.spec.ts     | Create habit, log completion, verify streak increment                       |
| sharing.spec.ts    | Publish board, access via public link as unauthenticated user               |

**10.4 Performance Tests**

- Lighthouse CI runs on every PR against the staging deployment

- Performance budget: LCP \< 2.5s, TBT \< 200ms, CLS \< 0.1

- Bundle size budget: main bundle \< 150KB gzipped (enforced with @next/bundle-analyzer)

**SECTION 11: CI/CD PIPELINE**

**11.1 GitHub Actions: CI Workflow (ci.yml)**

Triggered on every push and pull request to any branch. Steps in order:

- Checkout code (actions/checkout@v4)

- Setup Node.js 20.x with npm cache

- Install dependencies (npm ci)

- Run ESLint (npm run lint) --- fail on any error

- Run TypeScript compiler check (npm run typecheck) --- fail on any type error

- Run Vitest with coverage (npm run test:coverage) --- fail below 80% coverage

- Build Next.js application (npm run build) --- fail on build error

**11.2 GitHub Actions: Deploy Workflow (deploy.yml)**

Triggered only on merge to main branch. Steps in order:

- All CI steps above must pass first (uses: ./.github/workflows/ci.yml)

- Deploy to Vercel production using vercel deploy \--prod with VERCEL_TOKEN secret

- Run Supabase migrations against production: npx supabase db push

- Run Playwright E2E tests against production URL

- Post deployment status to Slack webhook (SLACK_WEBHOOK_URL secret)

**11.3 Required GitHub Secrets**

|                               |                                       |
|-------------------------------|---------------------------------------|
| **Secret Name**               | **Purpose**                           |
| NEXT_PUBLIC_SUPABASE_URL      | Supabase project URL                  |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase anonymous public key         |
| SUPABASE_SERVICE_ROLE_KEY     | Server-only Supabase service role key |
| SUPABASE_ACCESS_TOKEN         | Supabase CLI auth for migrations      |
| ANTHROPIC_API_KEY             | Anthropic API key for AI coaching     |
| UPSTASH_REDIS_REST_URL        | Upstash Redis for rate limiting       |
| UPSTASH_REDIS_REST_TOKEN      | Upstash Redis auth token              |
| RESEND_API_KEY                | Resend email service key              |
| UNSPLASH_ACCESS_KEY           | Unsplash image search API key         |
| VERCEL_TOKEN                  | Vercel deployment auth token          |
| SENTRY_DSN                    | Sentry error tracking endpoint        |
| SLACK_WEBHOOK_URL             | Deployment notifications webhook      |

**SECTION 12: SECURITY REQUIREMENTS**

**12.1 Mandatory Security Controls**

- Never expose SUPABASE_SERVICE_ROLE_KEY to client-side code under any circumstance

- All user-supplied strings must be parameterized --- never construct raw SQL from user input

- Content Security Policy headers must be set in next.config.ts for all pages

- All file uploads must validate MIME type and file size before upload to Supabase Storage

- Profile avatar uploads: max 5MB, JPEG/PNG/WebP only, auto-compressed before upload

- Vision board images: max 10MB, images only, stored in separate bucket with own RLS policy

- CORS is configured on API routes to accept only the production domain origin

- All authentication tokens are stored in HTTP-only cookies --- never in localStorage

- CSRF protection is inherited from Supabase\'s cookie-based auth flow

**12.2 Input Sanitization**

All text input that may be rendered as HTML (goal descriptions, board titles) must be sanitized using DOMPurify on the client before display. All rich text fields are plain text --- no HTML editor is used. Stored values are escaped at render time by React\'s default behavior.

**SECTION 13: ACCESSIBILITY REQUIREMENTS**

The platform must meet WCAG 2.1 Level AA compliance. The following requirements are mandatory and will be verified during PR review:

|                     |                                                                                                                                |
|---------------------|--------------------------------------------------------------------------------------------------------------------------------|
| **Requirement**     | **Implementation Detail**                                                                                                      |
| Keyboard Navigation | All interactive elements reachable and operable via keyboard alone. Tab order is logical. No keyboard traps.                   |
| Focus Management    | On modal open: focus moves to first interactive element. On modal close: focus returns to trigger element.                     |
| ARIA Labels         | All icon-only buttons have aria-label. All form inputs have associated labels (not just placeholder).                          |
| Progress Indicators | All progress bars include role=\'progressbar\', aria-valuenow, aria-valuemin, aria-valuemax.                                   |
| Color Contrast      | Minimum 4.5:1 ratio for normal text, 3:1 for large text and UI components. Verified with axe-core in CI.                       |
| Error Announcements | Form errors are announced to screen readers via aria-live=\'polite\' regions.                                                  |
| Skip Link           | A \'Skip to main content\' link is the first focusable element on every page.                                                  |
| Reduced Motion      | All animations respect prefers-reduced-motion media query. Use Tailwind\'s motion-reduce: prefix.                              |
| Images              | All informational images have descriptive alt text. Decorative images use alt=\'\'. Vision board images use goal title as alt. |

**SECTION 14: ENVIRONMENT CONFIGURATION**

**14.1 .env.local.example**

Generate this file as the canonical reference for all environment variables. Every variable must include a comment explaining its purpose and where to obtain it.

> \# Supabase --- https://app.supabase.com/project/\_/settings/api
>
> NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
>
> NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
>
> SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \# NEVER expose to client
>
> \# Anthropic --- https://console.anthropic.com/settings/keys
>
> ANTHROPIC_API_KEY=sk-ant-your-key
>
> \# Upstash Redis --- https://console.upstash.com
>
> UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
>
> UPSTASH_REDIS_REST_TOKEN=your-token
>
> \# Resend --- https://resend.com/api-keys
>
> RESEND_API_KEY=re_your-key
>
> RESEND_FROM_EMAIL=noreply@yourdomain.com
>
> \# Unsplash --- https://unsplash.com/developers
>
> UNSPLASH_ACCESS_KEY=your-access-key
>
> \# Sentry --- https://sentry.io/settings/projects
>
> NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/id
>
> \# App
>
> NEXT_PUBLIC_APP_URL=http://localhost:3000

**SECTION 15: BUILD SEQUENCE & AGENT EXECUTION ORDER**

**15.1 Mandatory Build Order**

Execute the build in exactly this order. Do not skip steps. Do not proceed to the next step until the current step produces zero errors.

|                                        |                                                                                                                                                                                                                                                             |
|----------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Phase**                              | **Tasks**                                                                                                                                                                                                                                                   |
| Phase 1: Foundation                    | Initialize Next.js 14 project with TypeScript, Tailwind, ESLint. Install all dependencies. Configure tsconfig.json strict mode. Set up tailwind.config.ts with design tokens. Create .env.local from example. Initialize Supabase project and link locally. |
| Phase 2: Database                      | Write all 14 migration files. Apply migrations locally with supabase db push. Verify all tables, RLS policies, triggers, and views exist. Seed affirmations and achievements tables.                                                                        |
| Phase 3: Auth                          | Implement Supabase client factories (client/server/middleware). Implement Next.js middleware.ts for route protection. Build login, signup, and reset-password pages with full form validation. Implement OAuth callback route.                              |
| Phase 4: Core API                      | Build all API routes in /app/api/. Apply auth checks, Zod validation, rate limiting to every route. Write integration tests for each route.                                                                                                                 |
| Phase 5: Dashboard Shell               | Build the authenticated layout with sidebar navigation, header, user menu, notification bell. Implement dark mode toggle. Build the main dashboard overview page with summary cards.                                                                        |
| Phase 6: Goals Feature                 | Build GoalCard, GoalGrid, GoalProgressRing components. Build GoalCreationWizard. Build GoalDetail page with all sub-sections. Implement optimistic updates via React Query.                                                                                 |
| Phase 7: Milestones & Savings          | Build MilestoneList with drag-to-reorder. Build SavingsGauge. Build transaction log UI. Connect to API routes with React Query mutations.                                                                                                                   |
| Phase 8: Habits & Analytics            | Build habit creation form, habit log UI, streak display. Build analytics dashboard with activity heatmap and completion stats charts (Recharts).                                                                                                            |
| Phase 9: AI & Vision Board             | Build CoachingPanel with streaming. Build vision board image grid with Unsplash search. Implement image upload to Supabase Storage.                                                                                                                         |
| Phase 10: Achievements & Notifications | Build achievement gallery. Implement notification center. Connect reminder system. Build weekly digest email template.                                                                                                                                      |
| Phase 11: Sharing                      | Build shared board creator. Build public board view (accessible without auth). Implement share link generation.                                                                                                                                             |
| Phase 12: Polish & PWA                 | Add web app manifest and service worker. Implement skeleton loading states on all pages. Run Lighthouse audit --- fix all issues below 90. Run axe-core accessibility audit --- fix all violations.                                                         |
| Phase 13: Testing                      | Write all missing Vitest unit tests. Write all Playwright E2E tests. Achieve 80%+ coverage. All tests must pass.                                                                                                                                            |
| Phase 14: CI/CD                        | Write ci.yml and deploy.yml GitHub Actions workflows. Configure all required secrets in GitHub. Verify full pipeline runs green on a test branch merge.                                                                                                     |

**SECTION 16: FINAL PRODUCTION CHECKLIST**

Before declaring the build complete, verify every item in this checklist passes:

|                                                                                                                                                                       |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **SECURITY** All API routes reject unauthenticated requests. RLS blocks cross-user data access. Service role key is server-only. File uploads validate type and size. |

|                                                                                                                                                                                   |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **PERFORMANCE** Lighthouse Performance \> 90 on all key pages. Images use next/image with proper sizing. Dynamic imports used for heavy components. No layout shift (CLS \< 0.1). |

|                                                                                                                                                                            |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **ACCESSIBILITY** All WCAG 2.1 AA criteria met. axe-core reports zero violations. Keyboard navigation works throughout. Screen reader tested on dashboard and goal detail. |

|                                                                                                                                                                       |
|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **RELIABILITY** 80%+ test coverage. All E2E tests pass against production URL. Error boundaries prevent full-page crashes. All API errors return proper status codes. |

|                                                                                                                                                       |
|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| **OBSERVABILITY** Sentry captures all unhandled exceptions. Vercel Analytics tracks Core Web Vitals. Supabase logs accessible for database debugging. |

**This document is the complete and authoritative build specification for the Intelligent Goal Visualization Platform. Every instruction herein supersedes any conflicting pattern the agent may have seen in training data. Execute with precision.**

*--- END OF AGENT BUILD SPECIFICATION ---*
