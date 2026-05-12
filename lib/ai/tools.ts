// Agent tool definitions — what actions agents can take
// requiresConfirmation: always show popup
// requiresAlwaysAllow: show popup with "Always Allow" option
// silent: no confirmation needed

export type ToolDefinition = {
  name: string
  description: string
  agent: AgentType
  requiresConfirmation: 'always' | 'always_allow' | 'silent'
  parameters: Record<string, { type: string; description: string; required?: boolean }>
}

export type AgentType =
  | 'orchestrator'
  | 'planner'
  | 'researcher'
  | 'action'
  | 'finance'
  | 'habit_coach'
  | 'notification'

export const AGENT_TOOLS: ToolDefinition[] = [
  // ── ACTION AGENT ──────────────────────────────────────────────
  {
    name: 'create_goal',
    description: 'Create a new goal for the user',
    agent: 'action',
    requiresConfirmation: 'always_allow',
    parameters: {
      title:          { type: 'string',  description: 'Goal title', required: true },
      category:       { type: 'string',  description: 'financial|career|health|education|personal|travel|relationships|environment', required: true },
      description:    { type: 'string',  description: 'Goal description' },
      priority:       { type: 'string',  description: 'low|medium|high' },
      target_date:    { type: 'string',  description: 'Target date YYYY-MM-DD' },
      estimated_cost: { type: 'number',  description: 'Financial target amount' },
    },
  },
  {
    name: 'create_habit',
    description: 'Create a new habit for the user',
    agent: 'action',
    requiresConfirmation: 'always_allow',
    parameters: {
      title:       { type: 'string',  description: 'Habit title', required: true },
      frequency:   { type: 'string',  description: 'daily|weekly', required: true },
      description: { type: 'string',  description: 'Habit description' },
      goal_id:     { type: 'string',  description: 'Link to goal ID' },
      target_days: { type: 'array',   description: 'For weekly: [0-6] day numbers' },
    },
  },
  {
    name: 'create_milestone',
    description: 'Add a milestone to an existing goal',
    agent: 'action',
    requiresConfirmation: 'always_allow',
    parameters: {
      goal_id:  { type: 'string', description: 'Goal ID', required: true },
      title:    { type: 'string', description: 'Milestone title', required: true },
      due_date: { type: 'string', description: 'Due date YYYY-MM-DD' },
    },
  },
  {
    name: 'add_deposit',
    description: 'Add a savings deposit to a financial goal',
    agent: 'finance',
    requiresConfirmation: 'always', // ALWAYS confirm, no "always allow"
    parameters: {
      goal_id:     { type: 'string', description: 'Goal ID', required: true },
      amount:      { type: 'number', description: 'Amount to deposit', required: true },
      description: { type: 'string', description: 'Transaction note' },
    },
  },
  {
    name: 'add_withdrawal',
    description: 'Add a savings withdrawal from a financial goal',
    agent: 'finance',
    requiresConfirmation: 'always', // ALWAYS confirm, no "always allow"
    parameters: {
      goal_id:     { type: 'string', description: 'Goal ID', required: true },
      amount:      { type: 'number', description: 'Amount to withdraw', required: true },
      description: { type: 'string', description: 'Transaction note' },
    },
  },
  {
    name: 'update_goal_status',
    description: 'Update the status of a goal',
    agent: 'action',
    requiresConfirmation: 'always_allow',
    parameters: {
      goal_id: { type: 'string', description: 'Goal ID', required: true },
      status:  { type: 'string', description: 'active|completed|paused|archived', required: true },
    },
  },
  {
    name: 'update_goal',
    description: 'Edit any fields of an existing goal (title, description, category, priority, deadline, financial target, progress)',
    agent: 'action',
    requiresConfirmation: 'always_allow',
    parameters: {
      goal_id:          { type: 'string', description: 'Goal ID', required: true },
      title:            { type: 'string', description: 'New title' },
      description:      { type: 'string', description: 'New description' },
      category:         { type: 'string', description: 'financial|career|health|education|personal|travel|relationships|environment' },
      priority:         { type: 'string', description: 'low|medium|high' },
      target_date:      { type: 'string', description: 'New deadline YYYY-MM-DD' },
      estimated_cost:   { type: 'number', description: 'New financial target amount' },
      progress_percentage: { type: 'number', description: 'Manual progress override 0-100' },
    },
  },
  {
    name: 'delete_goal',
    description: 'Permanently delete a goal and all its milestones and habits',
    agent: 'action',
    requiresConfirmation: 'always',
    parameters: {
      goal_id: { type: 'string', description: 'Goal ID', required: true },
    },
  },
  {
    name: 'complete_milestone',
    description: 'Mark a milestone as completed',
    agent: 'action',
    requiresConfirmation: 'always_allow',
    parameters: {
      milestone_id: { type: 'string', description: 'Milestone ID', required: true },
    },
  },
  {
    name: 'delete_milestone',
    description: 'Delete a milestone from a goal',
    agent: 'action',
    requiresConfirmation: 'always_allow',
    parameters: {
      milestone_id: { type: 'string', description: 'Milestone ID', required: true },
    },
  },
  {
    name: 'log_habit',
    description: 'Log a habit completion for today',
    agent: 'habit_coach',
    requiresConfirmation: 'always_allow',
    parameters: {
      habit_id: { type: 'string', description: 'Habit ID', required: true },
      notes:    { type: 'string', description: 'Optional notes' },
    },
  },
  {
    name: 'update_habit',
    description: 'Edit any fields of an existing habit (title, description, frequency, target days)',
    agent: 'habit_coach',
    requiresConfirmation: 'always_allow',
    parameters: {
      habit_id:    { type: 'string', description: 'Habit ID', required: true },
      title:       { type: 'string', description: 'New title' },
      description: { type: 'string', description: 'New description' },
      frequency:   { type: 'string', description: 'daily|weekly' },
      target_days: { type: 'array',  description: 'For weekly: [0-6] day numbers' },
      is_active:   { type: 'boolean', description: 'Pause (false) or resume (true) the habit' },
    },
  },
  {
    name: 'delete_habit',
    description: 'Permanently delete a habit',
    agent: 'habit_coach',
    requiresConfirmation: 'always',
    parameters: {
      habit_id: { type: 'string', description: 'Habit ID', required: true },
    },
  },
  // ── NOTIFICATION AGENT ────────────────────────────────────────
  {
    name: 'send_notification',
    description: 'Send a notification to the user',
    agent: 'notification',
    requiresConfirmation: 'silent', // AI can notify freely
    parameters: {
      title:   { type: 'string', description: 'Notification title', required: true },
      message: { type: 'string', description: 'Notification message', required: true },
      type:    { type: 'string', description: 'info|reminder|achievement|warning' },
    },
  },
  // ── PLANNER AGENT ─────────────────────────────────────────────
  {
    name: 'create_goal_plan',
    description: 'Create a full plan: goal + milestones + habits in one action',
    agent: 'planner',
    requiresConfirmation: 'always_allow',
    parameters: {
      goal_title:    { type: 'string', description: 'Goal title', required: true },
      category:      { type: 'string', description: 'Goal category', required: true },
      milestones:    { type: 'array',  description: 'Array of milestone titles' },
      habits:        { type: 'array',  description: 'Array of habit titles' },
      target_date:   { type: 'string', description: 'Target date' },
    },
  },
  {
    name: 'save_memory',
    description: 'Save a fact about the user to long-term memory',
    agent: 'orchestrator',
    requiresConfirmation: 'silent',
    parameters: {
      key:   { type: 'string', description: 'Memory key', required: true },
      value: { type: 'string', description: 'Memory value', required: true },
    },
  },
  {
    name: 'load_skills',
    description: 'Load full agent skill files when deep reasoning or planning is needed',
    agent: 'orchestrator',
    requiresConfirmation: 'silent',
    parameters: {
      skills: { type: 'array', description: 'Skill names to load e.g. ["planning","reasoning","workflow"]' },
    },
  },
  // ── RESEARCHER AGENT ──────────────────────────────────────────
  {
    name: 'web_search',
    description: 'Search the web for information, strategies, resources, or real-world data',
    agent: 'researcher',
    requiresConfirmation: 'always_allow',
    parameters: {
      query: { type: 'string', description: 'Search query', required: true },
    },
  },
]

export const TOOL_NAMES = AGENT_TOOLS.map(t => t.name)

export function getToolByName(name: string): ToolDefinition | undefined {
  return AGENT_TOOLS.find(t => t.name === name)
}
