import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AnalyticsClient } from '@/components/analytics/AnalyticsClient'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

  const [
    { data: goals },
    { data: habits },
    { data: habitLogs },
    { data: transactions },
  ] = await Promise.all([
    supabase.from('goals').select('id, title, category, status, progress_percentage, created_at, target_date').eq('user_id', user.id).is('deleted_at', null),
    supabase.from('habits').select('id, title, frequency, current_streak, longest_streak').eq('user_id', user.id),
    supabase.from('habit_logs').select('habit_id, completed_date').eq('user_id', user.id).gte('completed_date', ninetyDaysAgo.toISOString().split('T')[0]),
    supabase.from('savings_transactions').select('amount, transaction_type, transaction_date, goal_id').eq('user_id', user.id).order('transaction_date', { ascending: true }),
  ])

  return (
    <AnalyticsClient
      goals={(goals ?? []) as any[]}
      habits={(habits ?? []) as any[]}
      habitLogs={(habitLogs ?? []) as any[]}
      transactions={(transactions ?? []) as any[]}
    />
  )
}
