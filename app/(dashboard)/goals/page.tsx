import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GoalsClient } from '@/components/goals/GoalsClient'

type GoalRow = {
  id: string
  title: string
  description: string | null
  category: string
  status: string | null
  progress_percentage: number | null
  target_date: string | null
}

export default async function GoalsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rawGoals } = await supabase
    .from('goals')
    .select('id, title, description, category, status, progress_percentage, target_date')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  const goals = (rawGoals ?? []) as GoalRow[]

  return <GoalsClient allGoals={goals} />
}
