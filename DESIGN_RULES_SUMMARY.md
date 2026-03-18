# Design Rules Summary - Quick Reference

## ❌ NO EMOJIS IN UI - CRITICAL RULE

### Use Lucide React Icons Instead

```bash
npm install lucide-react
```

### Category Icons Mapping

| Category | Icon | Import |
|----------|------|--------|
| Financial | DollarSign | `import { DollarSign } from "lucide-react"` |
| Career | Briefcase | `import { Briefcase } from "lucide-react"` |
| Health | Heart | `import { Heart } from "lucide-react"` |
| Education | GraduationCap | `import { GraduationCap } from "lucide-react"` |
| Personal | Sparkles | `import { Sparkles } from "lucide-react"` |
| Travel | Plane | `import { Plane } from "lucide-react"` |
| Relationships | Users | `import { Users } from "lucide-react"` |
| Environment | Leaf | `import { Leaf } from "lucide-react"` |

### Common UI Icons

```typescript
import {
  Check,         // Success
  X,             // Close
  AlertTriangle, // Warning
  AlertCircle,   // Error
  Plus,          // Add
  Edit,          // Edit
  Trash2,        // Delete
  Save,          // Save
  Settings,      // Settings
  Bell,          // Notifications
  User,          // Profile
  Menu,          // Mobile menu
  Search,        // Search
  Calendar,      // Date
  Target,        // Goals
  Trophy,        // Achievement
  Flame,         // Streak
  Loader2,       // Loading
} from "lucide-react";
```

---

## AI Models with Fallbacks

### Primary: Anthropic Claude
- Model: `claude-sonnet-4-20250514`
- Rate: 10 requests/user/day

### Fallback 1: Mistral AI
- Model: `mistral-large-latest`
- Activates when Anthropic fails

### Fallback 2: Groq
- Model: `llama-3.3-70b-versatile`
- Activates when both fail

### Environment Variables

```bash
ANTHROPIC_API_KEY=sk-ant-your-key
MISTRAL_API_KEY=your-mistral-key
GROQ_API_KEY=gsk_your-groq-key
```

---

**Status:** Rules documented ✅  
**Implementation:** Milestone 5 (Icons), Milestone 9 (AI)
