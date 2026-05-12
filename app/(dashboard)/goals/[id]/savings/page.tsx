import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, DollarSign } from 'lucide-react'
import { SavingsDashboard } from '@/components/savings/SavingsDashboard'

export default async function GoalSavingsPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { id } = await params

  const { data: goal } = await supabase
    .from('goals')
    .select('id, title, category, estimated_cost, current_savings, target_date')
    .eq('id', id)
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .single()

  if (!goal) notFound()

  const g = goal as {
    id: string; title: string; category: string;
    estimated_cost: number | null; current_savings: number | null; target_date: string | null
  }

  if (g.category !== 'financial') {
    redirect(`/goals/${id}`)
  }

  const { data: transactions } = await supabase
    .from('savings_transactions')
    .select('id, amount, transaction_type, description, transaction_date, created_at')
    .eq('goal_id', id)
    .order('transaction_date', { ascending: false })

  type TxRow = { id: string; amount: number; transaction_type: string | null; description: string | null; transaction_date: string | null; created_at: string | null }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <Link href={`/goals/${id}`} className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Goal
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-black dark:text-white">{g.title}</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Savings tracker</p>
          </div>
        </div>
      </div>

      <SavingsDashboard
        goalId={id}
        initialSavings={g.current_savings ?? 0}
        target={g.estimated_cost ?? 0}
        targetDate={g.target_date}
        initialTransactions={(transactions ?? []) as TxRow[]}
      />
    </div>
  )
}
