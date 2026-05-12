// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function buildUserContext(supabase: any, userId: string): Promise<string> {
  const now = new Date()
  const timeStr = now.toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
  })
  const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' })
  const hour = now.getHours()
  const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 21 ? 'evening' : 'night'

  // Fetch all data in parallel
  const [
    { data: profile },
    { data: goals },
    { data: habits },
    { data: habitLogs },
    { data: transactions },
    { data: milestones },
    { data: visionImages },
    { data: notifications },
  ] = await Promise.all([
    supabase.from('profiles').select('full_name, timezone, created_at').eq('id', userId).single(),
    supabase.from('goals').select('id, title, description, category, status, priority, progress_percentage, estimated_cost, current_savings, target_date, is_public, created_at').eq('user_id', userId).is('deleted_at', null).order('created_at', { ascending: false }),
    supabase.from('habits').select('id, title, description, frequency, target_days, current_streak, longest_streak, is_active, created_at').eq('user_id', userId),
    supabase.from('habit_logs').select('habit_id, completed_date').eq('user_id', userId).gte('completed_date', new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]),
    supabase.from('savings_transactions').select('goal_id, amount, transaction_type, description, transaction_date').eq('user_id', userId).order('transaction_date', { ascending: false }).limit(20),
    supabase.from('goal_milestones').select('id, goal_id, title, completed, due_date, display_order').order('display_order'),
    supabase.from('goal_images').select('goal_id, caption, image_url').limit(50),
    supabase.from('notifications').select('title, message, is_read, created_at').eq('user_id', userId).eq('is_read', false).limit(5),
  ])

  const p = profile as { full_name: string | null; timezone: string | null; created_at: string } | null
  const userName = p?.full_name || 'User'
  const memberSince = p?.created_at ? new Date(p.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'recently'

  // Build goals section
  type Goal = { id: string; title: string; description: string | null; category: string; status: string | null; priority: string | null; progress_percentage: number | null; estimated_cost: number | null; current_savings: number | null; target_date: string | null; is_public: boolean | null; created_at: string }
  type Milestone = { id?: string; goal_id: string; title: string; completed: boolean | null; due_date: string | null; display_order: number | null }
  type Transaction = { goal_id: string; amount: number; transaction_type: string | null; description: string | null; transaction_date: string | null }
  type VisionImage = { goal_id: string; caption: string | null; image_url: string }
  type HabitLog = { habit_id: string; completed_date: string }
  type Habit = { id: string; title: string; description: string | null; frequency: string; target_days: number[] | null; current_streak: number; longest_streak: number; is_active: boolean | null; created_at: string }

  const goalsList = (goals ?? []) as Goal[]
  const milestonesList = (milestones ?? []) as Milestone[]
  const transactionsList = (transactions ?? []) as Transaction[]
  const visionList = (visionImages ?? []) as VisionImage[]
  const habitLogsList = (habitLogs ?? []) as HabitLog[]
  const habitsList = (habits ?? []) as Habit[]

  const goalsSection = goalsList.length === 0 ? '  No goals created yet.' : goalsList.map(g => {
    const goalMilestones = milestonesList.filter(m => m.goal_id === g.id)
    const completedMilestones = goalMilestones.filter(m => m.completed).length
    const goalTransactions = transactionsList.filter(t => t.goal_id === g.id)
    const goalImages = visionList.filter(v => v.goal_id === g.id)

    const daysLeft = g.target_date
      ? Math.ceil((new Date(g.target_date).getTime() - now.getTime()) / 86400000)
      : null

    let goalStr = `  [GOAL] "${g.title}"
    - ID: ${g.id} (use this exact UUID in tool calls)
    - Category: ${g.category} | Status: ${g.status ?? 'active'} | Priority: ${g.priority ?? 'medium'}
    - Progress: ${g.progress_percentage ?? 0}%`

    if (g.description) goalStr += `\n    - Description: ${g.description}`
    if (g.target_date) goalStr += `\n    - Deadline: ${new Date(g.target_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} (${daysLeft !== null ? (daysLeft < 0 ? `${Math.abs(daysLeft)} days OVERDUE` : `${daysLeft} days remaining`) : 'no deadline'})`
    if (g.estimated_cost) goalStr += `\n    - Financial target: $${g.estimated_cost.toLocaleString()} | Saved: $${(g.current_savings ?? 0).toLocaleString()} (${g.estimated_cost > 0 ? Math.round(((g.current_savings ?? 0) / g.estimated_cost) * 100) : 0}%)`

    if (goalMilestones.length > 0) {
      goalStr += `\n    - Milestones: ${completedMilestones}/${goalMilestones.length} completed`
      const pending = goalMilestones.filter(m => !m.completed).slice(0, 3)
      if (pending.length > 0) goalStr += `\n      Next: ${pending.map(m => `"${m.title}" (id: ${(m as Milestone & { id?: string }).id ?? 'unknown'})`).join(', ')}`
    }

    if (goalTransactions.length > 0) {
      const recent = goalTransactions.slice(0, 3)
      goalStr += `\n    - Recent transactions: ${recent.map(t => `${t.transaction_type === 'withdrawal' ? '-' : '+'}$${t.amount} (${t.description || t.transaction_type})`).join(', ')}`
    }

    if (goalImages.length > 0) {
      goalStr += `\n    - Vision board: ${goalImages.length} image${goalImages.length > 1 ? 's' : ''}${goalImages.some(i => i.caption) ? ` (${goalImages.filter(i => i.caption).map(i => `"${i.caption}"`).join(', ')})` : ''}`
    }

    return goalStr
  }).join('\n\n')

  // Build habits section
  const habitsSection = habitsList.length === 0 ? '  No habits created yet.' : habitsList.map(h => {
    const logs = habitLogsList.filter(l => l.habit_id === h.id)
    const completedToday = logs.some(l => l.completed_date === now.toISOString().split('T')[0])
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      return d.toISOString().split('T')[0]
    })
    const completedLast7 = logs.filter(l => last7Days.includes(l.completed_date)).length

    let habitStr = `  [HABIT] "${h.title}"
    - ID: ${h.id} (use this exact UUID in tool calls)
    - Frequency: ${h.frequency}${h.frequency === 'weekly' && h.target_days ? ` (days: ${h.target_days.map(d => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]).join(', ')})` : ''}
    - Current streak: ${h.current_streak} days | Best streak: ${h.longest_streak} days
    - Completed today: ${completedToday ? 'YES' : 'NO'}
    - Last 7 days: ${completedLast7}/7 completions`

    if (h.description) habitStr += `\n    - Note: ${h.description}`
    return habitStr
  }).join('\n\n')

  // Unread notifications
  type Notification = { title: string; message: string; is_read: boolean; created_at: string }
  const notifList = (notifications ?? []) as Notification[]
  const notifSection = notifList.length > 0
    ? notifList.map(n => `  - ${n.title}: ${n.message}`).join('\n')
    : '  No unread notifications.'

  // Overall stats
  const totalGoals = goalsList.length
  const activeGoals = goalsList.filter(g => g.status === 'active').length
  const completedGoals = goalsList.filter(g => g.status === 'completed').length
  const overdueGoals = goalsList.filter(g => g.target_date && new Date(g.target_date) < now && g.status !== 'completed').length
  const avgProgress = totalGoals > 0 ? Math.round(goalsList.reduce((s, g) => s + (g.progress_percentage ?? 0), 0) / totalGoals) : 0
  const habitsCompletedToday = habitsList.filter(h => habitLogsList.some(l => l.habit_id === h.id && l.completed_date === now.toISOString().split('T')[0])).length

  return `=== CURRENT DATE & TIME ===
Date: ${timeStr}
Day: ${dayOfWeek} ${timeOfDay}
User's timezone: ${p?.timezone ?? 'UTC'}

=== USER PROFILE ===
Name: ${userName}
Member since: ${memberSince}
Total goals: ${totalGoals} (${activeGoals} active, ${completedGoals} completed${overdueGoals > 0 ? `, ${overdueGoals} OVERDUE` : ''})
Average goal progress: ${avgProgress}%
Habits today: ${habitsCompletedToday}/${habitsList.length} completed

=== GOALS (with milestones, savings & vision board) ===
${goalsSection}

=== HABITS (with streaks & completion data) ===
${habitsSection}

=== UNREAD NOTIFICATIONS ===
${notifSection}`
}
