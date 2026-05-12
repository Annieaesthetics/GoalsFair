import { buildUserContext } from '@/lib/utils/ai-context'
import { AGENT_TOOLS } from './tools'
import { loadSkill, loadCustomSkills } from './skills'
import { MCP_REGISTRY } from './mcp-registry'

export type AgentMessage = { role: 'user' | 'assistant' | 'system'; content: string }

export type PendingAction = {
  tool: string
  params: Record<string, unknown>
  requiresConfirmation: 'always' | 'always_allow'
  description: string
  agentName: string
}

export type AgentResponse = {
  text: string
  pendingActions: PendingAction[]
  agentsUsed: string[]
}

// Specialized agent system prompts
const AGENT_PROMPTS: Record<string, string> = {
  orchestrator: `You are the Orchestrator Agent — the central brain coordinating all other agents.
You analyze user requests, delegate to specialized agents, and synthesize results.
You have access to all user data and can call any tool.
Always think step-by-step. If a task needs planning, involve the Planner Agent first.
If it needs research, involve the Researcher Agent. For actions, use the Action Agent.`,

  planner: `You are the Planner Agent — specialized in strategic thinking and real-world task planning.
You break down complex goals into actionable steps, create timelines, and design systems.
You think deeply about HOW to accomplish goals in the real world.
You work closely with the Researcher Agent to validate your plans.
Output structured plans with milestones, habits, and timelines.`,

  researcher: `You are the Researcher Agent — specialized in analyzing data and finding strategies.
You analyze the user's current progress, identify patterns, and research best practices.
You provide evidence-based recommendations and validate plans from the Planner Agent.
You have access to all user goals, habits, savings, and history.`,

  action: `You are the Action Agent — you execute tasks by calling tools.
You create goals, habits, milestones, and update statuses.
Always confirm your understanding before taking action.
For important actions, you will present a confirmation to the user.`,

  finance: `You are the Finance Agent — specialized in financial goal management.
You analyze savings progress, calculate projections, and manage transactions.
IMPORTANT: All deposits and withdrawals ALWAYS require user confirmation.
You provide specific financial advice based on the user's actual data.`,

  habit_coach: `You are the Habit Coach Agent — specialized in habit formation and behavior change.
You design habit systems, track streaks, and provide motivation.
You understand the science of habit formation and apply it to the user's specific goals.`,

  notification: `You are the Notification Agent — you send timely notifications to the user.
You proactively alert users about deadlines, streak risks, and achievements.
You can send notifications silently without user confirmation.`,
}

// Build the full neural-linked system prompt
export async function buildAgentSystemPrompt(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  mode: 'chat' | 'agent',
  activeAgents: string[] = ['orchestrator']
): Promise<string> {
  const userContext = await buildUserContext(supabase, userId)

  // Fetch agent memory and installed MCPs in parallel
  const [{ data: memory }, { data: prefs }] = await Promise.all([
    supabase.from('ai_agent_memory').select('memory_key, memory_value').eq('user_id', userId),
    supabase.from('user_preferences').select('installed_mcps').eq('user_id', userId).single(),
  ])

  const memoryStr = memory && memory.length > 0
    ? '\n=== AI MEMORY (facts learned about user) ===\n' +
      (memory as { memory_key: string; memory_value: string }[]).map(m => `- ${m.memory_key}: ${m.memory_value}`).join('\n')
    : ''

  // Build MCP tools from installed servers
  const installedMcpIds: string[] = (prefs as { installed_mcps?: string[] } | null)?.installed_mcps ?? []
  const mcpToolsStr = installedMcpIds.length > 0
    ? '\n=== INSTALLED MCP TOOLS ===\n' + installedMcpIds.flatMap(id => {
        const server = MCP_REGISTRY.find(s => s.id === id)
        if (!server) return []
        return server.tools.map(t =>
          `[mcp_call] tool="${t}" server="${server.name}" - Use via: {"tool": "mcp_call", "params": {"server": "${id}", "tool": "${t}", "args": {...}}}`
        )
      }).join('\n')
    : ''

  // Build tools description for agent mode
  const toolsStr = mode === 'agent'
    ? '\n=== AVAILABLE TOOLS ===\n' + AGENT_TOOLS.map(t =>
        `[${t.name}] (${t.agent} agent) - ${t.description}\n  Params: ${Object.entries(t.parameters).map(([k, v]) => `${k}(${v.type}${v.required ? '*' : ''}): ${v.description}`).join(', ')}`
      ).join('\n') + mcpToolsStr
    : ''

  // Skills are NOT loaded by default — orchestrator decides when to load them
  // Only load compact skill summaries for identity/personality (not full content)
  const identitySkills = ['identity', 'soul', 'mission', 'personality', 'constraints', 'safety']
  const compactIdentity = identitySkills.map(name => {
    const content = loadSkill(name)
    if (!content) return ''
    const summary = content.split('\n').slice(0, 3).join(' ').replace(/#+/g, '').trim().slice(0, 150)
    return `[${name}]: ${summary}`
  }).filter(Boolean).join('\n')

  const customSkills = loadCustomSkills()

  const agentPrompts = activeAgents.map(a => AGENT_PROMPTS[a] ?? '').filter(Boolean).join('\n\n')

  const modeInstructions = mode === 'agent'
    ? `\n=== AGENT MODE — TOOL CALL RULES (READ CAREFULLY) ===

When the user asks you to take an action, you MUST emit a <tool_calls> block.
DO NOT describe the tool call in prose. DO NOT write "I will call update_habit(...)". JUST EMIT THE BLOCK.

FORMAT — copy this exactly, replacing values:
<tool_calls>
[{"tool": "update_habit", "params": {"habit_id": "<UUID from context>", "title": "New title"}, "reason": "User asked to update this habit"}]
</tool_calls>

MULTIPLE TOOLS — use a JSON array:
<tool_calls>
[
  {"tool": "update_habit", "params": {"habit_id": "<UUID>", "title": "New title"}, "reason": "..."},
  {"tool": "create_milestone", "params": {"goal_id": "<UUID>", "title": "Week 1"}, "reason": "..."}
]
</tool_calls>

CRITICAL:
- habit_id / goal_id / milestone_id MUST be the UUID shown after "ID:" in the context — NEVER a name or title
- target_days MUST be a JSON array e.g. [0,1,2,3,4,5,6] — never a string
- The <tool_calls> block MUST appear at the very end of your message
- NEVER describe what you are about to call — just call it
- You may write a brief explanation BEFORE the block (e.g. "Searching LinkedIn for jobs..."), but the block itself must be last
- CRITICAL: NEVER generate fake results, fake data, or fake search results. If you need to search, emit the tool call and WAIT for real results. Do NOT invent job listings, URLs, or any data.
- CRITICAL: For web_search, do NOT write out search results yourself. Just emit the tool call and the real results will be shown after execution.
- After tools execute, you will receive results and can continue reasoning`
    : `\n=== CHAT MODE ===
You are in conversation-only mode. You CANNOT take any actions or call any tools.
You can discuss, plan, advise, and analyze — but cannot create goals, habits, or transactions.
Tell the user to switch to Agent Mode if they want you to take action.`

  return `${agentPrompts}

=== AGENT IDENTITY ===
${compactIdentity}
${customSkills ? '\n=== CUSTOM SKILLS ===\n' + customSkills : ''}

${userContext}
${memoryStr}
${toolsStr}
${modeInstructions}

=== NEURAL NETWORK COORDINATION ===
All agents share this same context. When you need specialized analysis:
- For planning: think as the Planner Agent
- For research/analysis: think as the Researcher Agent  
- For financial advice: think as the Finance Agent
- For habit advice: think as the Habit Coach Agent
- For notifications: use the send_notification tool

Always be specific, reference actual user data (goal names, amounts, streaks).
Be concise but thorough. Maximum 300 words unless asked for detail.`
}

// Parse tool calls from AI response — handles proper XML block and common malformed variants
export function parseToolCalls(text: string): { cleanText: string; toolCalls: Array<{ tool: string; params: Record<string, unknown>; reason: string }> } {
  // Primary: proper <tool_calls> block
  const xmlMatch = text.match(/<tool_calls>([\s\S]*?)<\/tool_calls>/)
  if (xmlMatch) {
    const cleanText = text.replace(/<tool_calls>[\s\S]*?<\/tool_calls>/, '').trim()
    try {
      const toolCalls = JSON.parse(xmlMatch[1].trim())
      return { cleanText, toolCalls: Array.isArray(toolCalls) ? toolCalls : [toolCalls] }
    } catch {
      return { cleanText, toolCalls: [] }
    }
  }

  // Fallback: model wrapped JSON in ```json ... ``` without the XML tags
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?```)/)
  if (codeBlockMatch) {
    const inner = codeBlockMatch[1].replace(/```$/, '').trim()
    try {
      const parsed = JSON.parse(inner)
      const calls = Array.isArray(parsed) ? parsed : [parsed]
      // Only treat as tool calls if objects have a "tool" key
      if (calls.length > 0 && calls[0].tool) {
        const cleanText = text.replace(/```(?:json)?[\s\S]*?```/, '').trim()
        return { cleanText, toolCalls: calls }
      }
    } catch { /* not valid JSON */ }
  }

  return { cleanText: text, toolCalls: [] }
}
