# AI Agent Implementation Plan

## Status Legend
- ✅ Complete
- 🔨 In Progress
- ❌ Not Started

---

## 1. ExtensionsPanel Component ✅
**File:** `components/ai/agent/extensions/ExtensionsPanel.tsx`

Tabs:
- **MCP** — browse registry by category, install/uninstall, show required env keys, link to GitHub
- **Skills** — list all skill files (base + custom), edit in-place, create new custom skill, delete custom skills
- **Web Search** — toggle Brave Search on/off, show API key status

---

## 2. Inject Skills into Agent System Prompt ✅
**File:** `lib/ai/agent.ts`

- Calls `loadAllSkills()` + `loadCustomSkills()` from `lib/ai/skills.ts`
- Prepended to system prompt — agent personality/identity/constraints always active
- Skills load order: base skills first (identity → soul → mission → ...) then custom

---

## 3. Web Search as Agent Tool ✅
**Files:** `lib/ai/tools.ts`, `app/api/ai/execute/route.ts`

- `web_search` tool added to `AGENT_TOOLS` with `requiresConfirmation: 'always_allow'`
- Execute route calls `/api/ai/search` internally and returns formatted results
- Agent can now search the web as part of planning/research tasks

---

## 4. MCP Tools Wired into Agent ✅
**Files:** `lib/ai/agent.ts`, `app/api/ai/execute/route.ts`

- Agent prompt build fetches user's installed MCPs and appends their tools
- `mcp_call` handler in execute route (stub — requires local MCP runtime)
- MCP tools visible to agent with server/tool routing instructions

---

## 5. Continuous Learning After Actions ✅
**File:** `app/api/ai/execute/route.ts`

- After each successful tool execution, auto-saves `last_{tool}` to `ai_agent_memory`
- Records: date + outcome message
- Agent builds richer memory profile over time

---

## 6. `installed_mcps` DB Column Migration ✅
**File:** `supabase/migrations/016_mcp_preferences.sql`

- Adds `installed_mcps text[] DEFAULT '{}'` to `user_preferences`
- Run: `supabase db push` or apply manually in Supabase dashboard

---

## Build Order
1. `ExtensionsPanel` (unblocks build) ← **starting now**
2. Skills injection into agent prompt
3. Web search tool
4. MCP tool execution
5. Continuous learning
6. DB migration for installed_mcps
