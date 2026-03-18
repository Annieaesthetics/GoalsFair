# 🎯 Goals Fair - Design System Rules & AI Configuration

## ❌ CRITICAL RULE: NO EMOJIS IN UI

### Prohibited
```tsx
// ❌ NEVER DO THIS
<span>💰 Financial</span>
<button>✅ Complete</button>
<div>🎉 Achievement Unlocked!</div>
```

### Required: Use Icon Libraries
```tsx
// ✅ ALWAYS DO THIS
import { DollarSign } from "lucide-react";
<span><DollarSign className="h-4 w-4" /> Financial</span>

import { Check } from "lucide-react";
<button><Check className="h-4 w-4" /> Complete</button>

import { Trophy } from "lucide-react";
<div><Trophy className="h-4 w-4" /> Achievement Unlocked!</div>
```

---

## Icon Library: Lucide React (Primary)

### Why Lucide?
- ✅ 1,400+ icons
- ✅ Consistent design system
- ✅ Tree-shakeable (only imports used icons)
- ✅ TypeScript support
- ✅ Customizable size, color, stroke
- ✅ MIT licensed
- ✅ Active maintenance
- ✅ Perfect for shadcn/ui integration

### Installation
```bash
npm install lucide-react
```

### Usage Examples

#### Goal Categories
```tsx
import {
  DollarSign,    // Financial
  Briefcase,     // Career
  Heart,         // Health
  GraduationCap, // Education
  Sparkles,      // Personal
  Plane,         // Travel
  Users,         // Relationships
  Leaf,          // Environment
} from "lucide-react";

const categoryIcons = {
  financial: DollarSign,
  career: Briefcase,
  health: Heart,
  education: GraduationCap,
  personal: Sparkles,
  travel: Plane,
  relationships: Users,
  environment: Leaf,
} as const;
```

#### Common UI Icons
```tsx
import {
  Check,         // Success, completed
  X,             // Close, cancel
  AlertTriangle, // Warning
  AlertCircle,   // Error, info
  Plus,          // Add, create
  Minus,         // Remove, subtract
  Edit,          // Edit action
  Trash2,        // Delete action
  Save,          // Save action
  Settings,      // Settings
  Bell,          // Notifications
  User,          // Profile
  LogOut,        // Sign out
  Menu,          // Mobile menu
  ChevronRight,  // Navigation
  Search,        // Search
  Filter,        // Filter
  Calendar,      // Date picker
  Clock,         // Time
  TrendingUp,    // Progress, growth
  Target,        // Goals
  Zap,           // Energy, quick action
  Star,          // Favorite, achievement
  Trophy,        // Achievement
  Flame,         // Streak
  Eye,           // View
  EyeOff,        // Hide
  Lock,          // Locked, private
  Unlock,        // Unlocked, public
  Share2,        // Share
  Download,      // Download
  Upload,        // Upload
  Image,         // Image upload
  Loader2,       // Loading spinner
} from "lucide-react";
```

#### Loading Spinner
```tsx
import { Loader2 } from "lucide-react";

<Loader2 className="h-4 w-4 animate-spin" />
```

#### Icon with Text
```tsx
import { Check } from "lucide-react";

<button className="flex items-center gap-2">
  <Check className="h-4 w-4" />
  <span>Complete Goal</span>
</button>
```

#### Icon Sizes
```tsx
// Small (16px)
<Icon className="h-4 w-4" />

// Medium (20px)
<Icon className="h-5 w-5" />

// Large (24px)
<Icon className="h-6 w-6" />

// Extra Large (32px)
<Icon className="h-8 w-8" />
```

#### Icon Colors
```tsx
// Use Tailwind color classes
<Check className="h-4 w-4 text-success" />
<AlertTriangle className="h-4 w-4 text-warning" />
<X className="h-4 w-4 text-destructive" />
<Leaf className="h-4 w-4 text-eco" />
```

---

## Alternative Icon Libraries (Backup)

### Heroicons (Secondary Option)
```bash
npm install @heroicons/react
```

```tsx
import { CheckIcon } from "@heroicons/react/24/solid";
import { BellIcon } from "@heroicons/react/24/outline";
```

### Radix Icons (For UI Primitives)
```bash
npm install @radix-ui/react-icons
```

```tsx
import { CheckIcon, Cross2Icon } from "@radix-ui/react-icons";
```

---

## Icon Usage Guidelines

### 1. Consistency
- Use the same icon for the same action throughout the app
- Example: Always use `Trash2` for delete, never mix with `Trash` or `X`

### 2. Size Hierarchy
- Navigation icons: `h-5 w-5`
- Button icons: `h-4 w-4`
- Large feature icons: `h-8 w-8` or `h-12 w-12`
- Icon-only buttons: `h-5 w-5` with proper padding

### 3. Accessibility
```tsx
// Icon-only button - MUST have aria-label
<button aria-label="Delete goal">
  <Trash2 className="h-4 w-4" />
</button>

// Icon with text - no aria-label needed
<button>
  <Trash2 className="h-4 w-4" />
  <span>Delete</span>
</button>
```

### 4. Loading States
```tsx
import { Loader2 } from "lucide-react";

<button disabled={isLoading}>
  {isLoading ? (
    <Loader2 className="h-4 w-4 animate-spin" />
  ) : (
    <Check className="h-4 w-4" />
  )}
  <span>Save Goal</span>
</button>
```

---

## AI Model Configuration with Fallbacks

### Primary: Anthropic Claude
**Model:** `claude-sonnet-4-20250514`  
**Use:** Main AI coaching, insights, weekly digests

### Fallback 1: Mistral AI
**Model:** `mistral-large-latest`  
**Use:** If Anthropic fails or rate limited

### Fallback 2: Groq
**Model:** `llama-3.3-70b-versatile`  
**Use:** If both Anthropic and Mistral fail

### Implementation

#### Environment Variables
```bash
# .env.local.example
# AI Providers (in order of preference)
ANTHROPIC_API_KEY=sk-ant-your-key
MISTRAL_API_KEY=your-mistral-key
GROQ_API_KEY=gsk_your-groq-key
```

#### Install SDKs
```bash
npm install @anthropic-ai/sdk @mistralai/mistralai groq-sdk
```

#### AI Service with Fallbacks
```typescript
// lib/ai/coaching.ts

import Anthropic from "@anthropic-ai/sdk";
import { Mistral } from "@mistralai/mistralai";
import Groq from "groq-sdk";

type AIProvider = "anthropic" | "mistral" | "groq";

interface CoachingRequest {
  goalContext: string;
  userPrompt: string;
}

interface CoachingResponse {
  message: string;
  provider: AIProvider;
  tokensUsed: number;
}

class AICoachingService {
  private anthropic: Anthropic;
  private mistral: Mistral;
  private groq: Groq;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    this.mistral = new Mistral({
      apiKey: process.env.MISTRAL_API_KEY,
    });
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  async getCoaching(request: CoachingRequest): Promise<CoachingResponse> {
    // Try Anthropic first
    try {
      const response = await this.tryAnthropic(request);
      return { ...response, provider: "anthropic" };
    } catch (error) {
      console.error("[AI] Anthropic failed:", error);
    }

    // Fallback to Mistral
    try {
      const response = await this.tryMistral(request);
      return { ...response, provider: "mistral" };
    } catch (error) {
      console.error("[AI] Mistral failed:", error);
    }

    // Final fallback to Groq
    try {
      const response = await this.tryGroq(request);
      return { ...response, provider: "groq" };
    } catch (error) {
      console.error("[AI] Groq failed:", error);
      throw new Error("All AI providers failed");
    }
  }

  private async tryAnthropic(request: CoachingRequest) {
    const message = await this.anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: `${request.goalContext}\n\n${request.userPrompt}`,
        },
      ],
    });

    return {
      message: message.content[0].type === "text" ? message.content[0].text : "",
      tokensUsed: message.usage.output_tokens,
    };
  }

  private async tryMistral(request: CoachingRequest) {
    const response = await this.mistral.chat.complete({
      model: "mistral-large-latest",
      messages: [
        {
          role: "user",
          content: `${request.goalContext}\n\n${request.userPrompt}`,
        },
      ],
      maxTokens: 300,
    });

    return {
      message: response.choices?.[0]?.message?.content || "",
      tokensUsed: response.usage?.completionTokens || 0,
    };
  }

  private async tryGroq(request: CoachingRequest) {
    const response = await this.groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: `${request.goalContext}\n\n${request.userPrompt}`,
        },
      ],
      max_tokens: 300,
    });

    return {
      message: response.choices[0]?.message?.content || "",
      tokensUsed: response.usage?.completion_tokens || 0,
    };
  }

  // Streaming version with fallbacks
  async streamCoaching(request: CoachingRequest): Promise<ReadableStream> {
    try {
      return await this.streamAnthropic(request);
    } catch (error) {
      console.error("[AI] Anthropic streaming failed:", error);
      try {
        return await this.streamMistral(request);
      } catch (error) {
        console.error("[AI] Mistral streaming failed:", error);
        return await this.streamGroq(request);
      }
    }
  }

  private async streamAnthropic(request: CoachingRequest): Promise<ReadableStream> {
    const stream = await this.anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: `${request.goalContext}\n\n${request.userPrompt}`,
        },
      ],
    });

    return new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
            controller.enqueue(new TextEncoder().encode(chunk.delta.text));
          }
        }
        controller.close();
      },
    });
  }

  private async streamMistral(request: CoachingRequest): Promise<ReadableStream> {
    const stream = await this.mistral.chat.stream({
      model: "mistral-large-latest",
      messages: [
        {
          role: "user",
          content: `${request.goalContext}\n\n${request.userPrompt}`,
        },
      ],
      maxTokens: 300,
    });

    return new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const content = chunk.data.choices[0]?.delta?.content;
          if (content) {
            controller.enqueue(new TextEncoder().encode(content));
          }
        }
        controller.close();
      },
    });
  }

  private async streamGroq(request: CoachingRequest): Promise<ReadableStream> {
    const stream = await this.groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: `${request.goalContext}\n\n${request.userPrompt}`,
        },
      ],
      max_tokens: 300,
      stream: true,
    });

    return new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            controller.enqueue(new TextEncoder().encode(content));
          }
        }
        controller.close();
      },
    });
  }
}

export const aiCoaching = new AICoachingService();
```

#### API Route Usage
```typescript
// app/api/ai/coaching/route.ts

import { aiCoaching } from "@/lib/ai/coaching";

export async function POST(request: Request) {
  // ... auth and validation ...

  const stream = await aiCoaching.streamCoaching({
    goalContext: "User's goal data...",
    userPrompt: "Provide coaching insights",
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
```

---

## Cost & Rate Limiting

### Anthropic (Primary)
- **Cost:** ~$3 per 1M input tokens, ~$15 per 1M output tokens
- **Rate Limit:** 10 requests/user/day (via Upstash Redis)

### Mistral (Fallback 1)
- **Cost:** ~$2 per 1M input tokens, ~$6 per 1M output tokens
- **Rate Limit:** Shared with Anthropic limit

### Groq (Fallback 2)
- **Cost:** Free tier available, then ~$0.27 per 1M tokens
- **Rate Limit:** 30 requests/minute on free tier

---

## Testing AI Fallbacks

```typescript
// tests/integration/ai-fallback.test.ts

describe("AI Coaching Fallbacks", () => {
  it("should use Mistral when Anthropic fails", async () => {
    // Mock Anthropic to fail
    // Verify Mistral is called
  });

  it("should use Groq when both Anthropic and Mistral fail", async () => {
    // Mock both to fail
    // Verify Groq is called
  });

  it("should throw error when all providers fail", async () => {
    // Mock all to fail
    // Verify error is thrown
  });
});
```

---

## Summary

### Icons
- ✅ **Primary:** Lucide React (1,400+ icons)
- ✅ **Backup:** Heroicons, Radix Icons
- ❌ **Never:** Emojis in UI

### AI Models
- ✅ **Primary:** Anthropic Claude Sonnet 4
- ✅ **Fallback 1:** Mistral Large
- ✅ **Fallback 2:** Groq (Llama 3.3 70B)

---

**Status:** Design rules documented ✅  
**Implementation:** Icons in Milestone 5, AI fallbacks in Milestone 9  
**Last Updated:** 2025-01-XX
