import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { HabitsClient } from '@/components/habits/HabitsClient'

export default async function HabitsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch habits with goal titles
  const { data: rawHabits } = await supabase
    .from('habits')
    .select('id, title, description, frequency, target_days, current_streak, longest_streak, goal_id, is_active')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch today's completions
  const today = new Date().toISOString().split('T')[0]
  const { data: todayLogs } = await supabase
    .from('habit_logs')
    .select('habit_id')
    .eq('user_id', user.id)
    .eq('completed_date', today)

  // Fetch all completions for calendar (last 90 days)
  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
  const { data: allLogs } = await supabase
    .from('habit_logs')
    .select('habit_id, completed_date')
    .eq('user_id', user.id)
    .gte('completed_date', ninetyDaysAgo.toISOString().split('T')[0])

  // Fetch goals for the creation form
  const { data: rawGoals } = await supabase
    .from('goals')
    .select('id, title')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  const completedTodayIds = new Set((todayLogs ?? []).map(l => (l as { habit_id: string }).habit_id))

  type HabitRow = {
    id: string; title: string; description: string | null; frequency: string;
    target_days: number[] | null; current_streak: number; longest_streak: number;
    goal_id: string | null; is_active: boolean | null; completed_today: boolean;
    goal_title?: string | null
  }

  type LogRow = { habit_id: string; completed_date: string }
  type GoalRow = { id: string; title: string }

  const habits = ((rawHabits ?? []) as HabitRow[]).map(h => ({
    ...h,
    completed_today: completedTodayIds.has(h.id),
  }))

  const logsByHabit: Record<string, string[]> = {}
  ;((allLogs ?? []) as LogRow[]).forEach(l => {
    if (!logsByHabit[l.habit_id]) logsByHabit[l.habit_id] = []
    logsByHabit[l.habit_id].push(l.completed_date)
  })

  const goals = (rawGoals ?? []) as GoalRow[]

  return (
    <HabitsClient
      initialHabits={habits}
      logsByHabit={logsByHabit}
      goals={goals}
    />
  )
}
