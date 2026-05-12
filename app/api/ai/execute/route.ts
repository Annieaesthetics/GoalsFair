import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function requireUUID(value: unknown, field: string): string {
  if (typeof value !== 'string' || !UUID_RE.test(value)) {
    throw new Error(`Invalid ${field}: expected a UUID but got "${value}". Use the exact ID shown in the user context (e.g. "ID: abc123-...").`)
  }
  return value
}

// Coerce target_days from JSON string to array if the model serialized it wrong
function coerceParams(params: Record<string, unknown>): Record<string, unknown> {
  const p = { ...params }
  if (typeof p.target_days === 'string') {
    try { p.target_days = JSON.parse(p.target_days) } catch { delete p.target_days }
  }
  return p
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const rawParams = await request.json()
    const { tool, conversationId } = rawParams
    const params = coerceParams(rawParams.params ?? {})

    let result: Record<string, unknown> = {}

    switch (tool) {
      case 'create_goal': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase.from('goals') as any)
          .insert({ user_id: user.id, ...params, status: 'active', priority: params.priority ?? 'medium' })
          .select().single()
        if (error) throw error
        result = { success: true, goal: data, message: `Goal "${params.title}" created successfully!` }
        break
      }

      case 'create_habit': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase.from('habits') as any)
          .insert({ user_id: user.id, ...params })
          .select().single()
        if (error) throw error
        result = { success: true, habit: data, message: `Habit "${params.title}" created successfully!` }
        break
      }

      case 'create_milestone': {
        requireUUID(params.goal_id, 'goal_id')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase.from('goal_milestones') as any)
          .insert({ ...params, display_order: 0 })
          .select().single()
        if (error) throw error
        result = { success: true, milestone: data, message: `Milestone "${params.title}" added!` }
        break
      }

      case 'add_deposit':
      case 'add_withdrawal': {
        requireUUID(params.goal_id, 'goal_id')
        const txType = tool === 'add_deposit' ? 'deposit' : 'withdrawal'
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase.from('savings_transactions') as any)
          .insert({ user_id: user.id, goal_id: params.goal_id, amount: params.amount, transaction_type: txType, description: params.description })
          .select().single()
        if (error) throw error
        result = { success: true, transaction: data, message: `${txType === 'deposit' ? 'Deposit' : 'Withdrawal'} of $${params.amount} recorded!` }
        break
      }

      case 'update_goal_status': {
        requireUUID(params.goal_id, 'goal_id')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from('goals') as any)
          .update({ status: params.status })
          .eq('id', params.goal_id)
          .eq('user_id', user.id)
        if (error) throw error
        result = { success: true, message: `Goal status updated to "${params.status}"` }
        break
      }

      case 'update_goal': {
        requireUUID(params.goal_id, 'goal_id')
        const { goal_id, ...fields } = params
        const allowed = ['title', 'description', 'category', 'priority', 'target_date', 'estimated_cost', 'progress_percentage']
        const updates = Object.fromEntries(Object.entries(fields).filter(([k]) => allowed.includes(k)))
        if (Object.keys(updates).length === 0) {
          result = { success: false, message: 'No valid fields to update.' }
          break
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from('goals') as any)
          .update(updates)
          .eq('id', goal_id)
          .eq('user_id', user.id)
        if (error) throw error
        const changed = Object.entries(updates).map(([k, v]) => `${k} → ${v}`).join(', ')
        result = { success: true, message: `Goal updated: ${changed}` }
        break
      }

      case 'delete_goal': {
        requireUUID(params.goal_id, 'goal_id')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from('goals') as any)
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', params.goal_id)
          .eq('user_id', user.id)
        if (error) throw error
        result = { success: true, message: 'Goal deleted.' }
        break
      }

      case 'complete_milestone': {
        requireUUID(params.milestone_id, 'milestone_id')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from('goal_milestones') as any)
          .update({ completed: true, completed_at: new Date().toISOString() })
          .eq('id', params.milestone_id)
        if (error) throw error
        result = { success: true, message: 'Milestone marked as completed!' }
        break
      }

      case 'delete_milestone': {
        requireUUID(params.milestone_id, 'milestone_id')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from('goal_milestones') as any)
          .delete()
          .eq('id', params.milestone_id)
        if (error) throw error
        result = { success: true, message: 'Milestone deleted.' }
        break
      }

      case 'log_habit': {
        requireUUID(params.habit_id, 'habit_id')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from('habit_logs') as any)
          .insert({ user_id: user.id, habit_id: params.habit_id, completed_date: new Date().toISOString().split('T')[0], notes: params.notes })
        if (error && !error.message?.includes('unique')) throw error
        result = { success: true, message: 'Habit logged for today!' }
        break
      }

      case 'update_habit': {
        requireUUID(params.habit_id, 'habit_id')
        const { habit_id, ...fields } = params
        const allowed = ['title', 'description', 'frequency', 'target_days', 'is_active']
        const updates = Object.fromEntries(Object.entries(fields).filter(([k]) => allowed.includes(k)))
        if (Object.keys(updates).length === 0) {
          result = { success: false, message: 'No valid fields to update.' }
          break
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from('habits') as any)
          .update(updates)
          .eq('id', habit_id)
          .eq('user_id', user.id)
        if (error) throw error
        const changed = Object.entries(updates).map(([k, v]) => `${k} → ${v}`).join(', ')
        result = { success: true, message: `Habit updated: ${changed}` }
        break
      }

      case 'delete_habit': {
        requireUUID(params.habit_id, 'habit_id')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from('habits') as any)
          .delete()
          .eq('id', params.habit_id)
          .eq('user_id', user.id)
        if (error) throw error
        result = { success: true, message: 'Habit deleted.' }
        break
      }

      case 'send_notification': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('notifications') as any).insert({
          user_id: user.id,
          type: params.type ?? 'info',
          title: params.title,
          message: params.message,
          icon: params.type === 'achievement' ? 'Trophy' : params.type === 'warning' ? 'AlertTriangle' : 'Bell',
          is_read: false,
        })
        result = { success: true, message: 'Notification sent!' }
        break
      }

      case 'create_goal_plan': {
        // Create goal + milestones + habits in one shot
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: goal, error: goalError } = await (supabase.from('goals') as any)
          .insert({ user_id: user.id, title: params.goal_title, category: params.category, status: 'active', priority: 'medium', target_date: params.target_date })
          .select().single()
        if (goalError) throw goalError

        const milestones = (params.milestones as string[] ?? []).map((title: string, i: number) => ({ goal_id: goal.id, title, display_order: i }))
        if (milestones.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase.from('goal_milestones') as any).insert(milestones)
        }

        const habits = (params.habits as string[] ?? []).map((title: string) => ({ user_id: user.id, goal_id: goal.id, title, frequency: 'daily' }))
        if (habits.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase.from('habits') as any).insert(habits)
        }

        result = { success: true, goal, message: `Plan created: goal "${params.goal_title}" with ${milestones.length} milestones and ${habits.length} habits!` }
        break
      }

      case 'save_memory': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('ai_agent_memory') as any)
          .upsert({ user_id: user.id, memory_key: params.key, memory_value: params.value, source: 'agent' }, { onConflict: 'user_id,memory_key' })
        result = { success: true, message: `Remembered: ${params.key}` }
        break
      }

      case 'web_search': {
        const searchRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/ai/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Cookie: request.headers.get('cookie') ?? '' },
          body: JSON.stringify({ query: params.query }),
        })
        const searchData = await searchRes.json()
        const results = (searchData.results ?? []) as { title: string; url: string; snippet: string }[]
        const summary = results.map((r, i) => `${i + 1}. ${r.title}\n   ${r.snippet}\n   ${r.url}`).join('\n\n')
        result = { success: true, results, message: `Found ${results.length} results for "${params.query}":\n\n${summary}` }
        break
      }

      case 'mcp_call': {
        // MCP tools are not yet natively executable server-side — return a descriptive result
        // so the agent can relay the intent to the user
        result = {
          success: false,
          message: `MCP tool "${params.tool}" on server "${params.server}" requires a local MCP runtime. To enable this, run the MCP server locally and connect it via the Extensions panel.`,
        }
        break
      }

      default:
        return NextResponse.json({ error: `Unknown tool: ${tool}` }, { status: 400 })
    }

    // Continuous learning — auto-save key action facts to memory
    if (result.success && tool !== 'save_memory' && tool !== 'send_notification' && tool !== 'web_search') {
      const memoryKey = `last_${tool}`
      const memoryValue = `${new Date().toISOString().split('T')[0]}: ${result.message}`
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('ai_agent_memory') as any)
        .upsert({ user_id: user.id, memory_key: memoryKey, memory_value: memoryValue, source: 'agent' }, { onConflict: 'user_id,memory_key' })
    }

    // Save tool result to conversation history
    if (conversationId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('ai_messages') as any).insert({
        conversation_id: conversationId,
        user_id: user.id,
        role: 'tool',
        content: result.message as string ?? 'Action completed',
        tool_result: result,
      })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Tool execution error:', error)
    return NextResponse.json({ error: 'Action failed', details: String(error) }, { status: 500 })
  }
}
