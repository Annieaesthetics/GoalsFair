# ✅ Design System & AI Configuration - Complete

## Critical Design Rules

### 1. NO EMOJIS IN UI ❌
**Rule:** Never use emojis anywhere in the user interface.

**Instead:** Use Lucide React icons (1,400+ icons available)

```tsx
// ❌ WRONG
<span>💰 Financial Goal</span>

// ✅ CORRECT
import { DollarSign } from "lucide-react";
<span><DollarSign className="h-4 w-4" /> Financial Goal</span>
```

### 2. Icon Library: Lucide React ✅
**Installed:** `lucide-react@0.468.0`

**Category Icons:**
- Financial → `DollarSign`
- Career → `Briefcase`
- Health → `Heart`
- Education → `GraduationCap`
- Personal → `Sparkles`
- Travel → `Plane`
- Relationships → `Users`
- Environment → `Leaf` (NEW)

**Common UI Icons:**
- Success → `Check`
- Error → `X`, `AlertCircle`
- Warning → `AlertTriangle`
- Loading → `Loader2` (with `animate-spin`)
- Add → `Plus`
- Edit → `Edit`
- Delete → `Trash2`
- Save → `Save`
- Settings → `Settings`
- Notifications → `Bell`
- Profile → `User`
- Menu → `Menu`
- Search → `Search`
- Calendar → `Calendar`
- Goals → `Target`
- Achievement → `Trophy`
- Streak → `Flame`

---

## AI Model Configuration

### Three-Tier Fallback System

#### 1. Primary: Anthropic Claude ⭐
- **Model:** `claude-sonnet-4-20250514`
- **API Key:** `ANTHROPIC_API_KEY`
- **Rate Limit:** 10 requests/user/day
- **Cost:** ~$3 input / ~$15 output per 1M tokens
- **Use:** Main AI coaching, insights, weekly digests

#### 2. Fallback 1: Mistral AI
- **Model:** `mistral-large-latest`
- **API Key:** `MISTRAL_API_KEY`
- **Activates:** When Anthropic fails or rate limited
- **Cost:** ~$2 input / ~$6 output per 1M tokens
- **SDK:** `@mistralai/mistralai@1.3.7` ✅ Installed

#### 3. Fallback 2: Groq
- **Model:** `llama-3.3-70b-versatile`
- **API Key:** `GROQ_API_KEY`
- **Activates:** When both Anthropic and Mistral fail
- **Cost:** Free tier available, then ~$0.27 per 1M tokens
- **SDK:** `groq-sdk@0.8.0` ✅ Installed

### Environment Variables Required

```bash
# AI Providers (in order of preference)
ANTHROPIC_API_KEY=sk-ant-your-key
MISTRAL_API_KEY=your-mistral-key
GROQ_API_KEY=gsk_your-groq-key
```

### Implementation Location
- **File:** `lib/ai/coaching.ts`
- **Milestone:** 9 (AI Coaching & Vision Board)
- **Features:** Streaming responses, automatic fallback, error handling

---

## Color Scheme: Wellness & Growth 🌿

### Base Backgrounds
- **Light Mode:** `#FFFFFF` (Pure White) ✅
- **Dark Mode:** `#000000` (Pure Black) ✅

### Primary & Semantic Colors

| Purpose | Light Mode | Dark Mode | Icon |
|---------|-----------|-----------|------|
| Primary | `#059669` Emerald | `#059669` Emerald | - |
| Success | `#84CC16` Lime | `#A3E635` Lime | `Check` |
| Warning | `#F97316` Orange | `#FB923C` Orange | `AlertTriangle` |
| Error | `#DC2626` Red | `#EF4444` Red | `AlertCircle` |
| Info | `#0EA5E9` Sky | `#38BDF8` Sky | `Info` |
| Eco | `#22C55E` Green | `#4ADE80` Green | `Leaf` |

### 8 Goal Categories

| Category | Color | Hex | Icon |
|----------|-------|-----|------|
| Financial | Emerald | `#059669` | `DollarSign` |
| Career | Sky | `#0EA5E9` | `Briefcase` |
| Health | Lime | `#84CC16` | `Heart` |
| Education | Violet | `#8B5CF6` | `GraduationCap` |
| Personal | Orange | `#F97316` | `Sparkles` |
| Travel | Cyan | `#06B6D4` | `Plane` |
| Relationships | Pink | `#F472B6` | `Users` |
| Environment | Light Green | `#22C55E` | `Leaf` ⭐ |

---

## Files Updated

### ✅ Configuration Files
- `package.json` - Added Mistral & Groq SDKs
- `.env.local.example` - Added AI API keys
- `app/globals.css` - Implemented color scheme
- `types/database.ts` - Added environment category

### ✅ Documentation Files
- `DESIGN_RULES.md` - Complete icon & AI guide (4,000+ words)
- `DESIGN_RULES_SUMMARY.md` - Quick reference
- `COLOR_SCHEME.md` - All 5 color options
- `COLOR_SCHEME_SUMMARY.md` - Selected scheme
- `COLOR_IMPLEMENTATION.md` - Implementation guide
- `MILESTONE.md` - Updated M5 & M9 deliverables

### ✅ Dependencies Installed
- `lucide-react@0.468.0` - Icon library
- `@mistralai/mistralai@1.3.7` - Mistral AI SDK
- `groq-sdk@0.8.0` - Groq SDK

---

## Implementation Timeline

### Milestone 5: Dashboard Shell (Icons + Colors)
- Install shadcn/ui components
- Implement Lucide React icons throughout
- Apply Wellness & Growth color scheme
- Create category icon mapping utility
- Build category badge component

### Milestone 9: AI Coaching (Fallback System)
- Create `lib/ai/coaching.ts` with three-tier fallback
- Implement streaming for all three providers
- Add error handling and logging
- Test fallback scenarios
- Rate limiting with Upstash Redis

---

## Testing Checklist

### Icons
- [ ] No emojis anywhere in UI
- [ ] All category icons render correctly
- [ ] Icon sizes consistent (h-4 w-4 for buttons)
- [ ] Loading spinner uses Loader2 with animate-spin
- [ ] Icon-only buttons have aria-label

### Colors
- [ ] Pure white background in light mode
- [ ] Pure black background in dark mode
- [ ] All 8 category colors display correctly
- [ ] Semantic colors (success, warning, error) distinguishable
- [ ] Eco green color shows on environment goals
- [ ] Dark mode variants readable

### AI Fallbacks
- [ ] Anthropic works as primary
- [ ] Mistral activates when Anthropic fails
- [ ] Groq activates when both fail
- [ ] Error thrown when all three fail
- [ ] Streaming works for all providers
- [ ] Rate limiting enforced

---

## Quick Reference Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Type check
npm run typecheck

# Lint
npm run lint

# Test
npm run test
```

---

**Status:** All design rules documented and configured ✅  
**Next:** Proceed to Milestone 2 (Database Schema)  
**Last Updated:** 2025-01-XX
