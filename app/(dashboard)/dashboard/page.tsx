import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Target, TrendingUp, CheckSquare, Flame, ArrowRight } from 'lucide-react'
import { CoachingPanel } from '@/components/ai/CoachingPanel'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const [
    { count: totalGoals },
    { count: activeGoals },
    { count: completedGoals },
    { count: totalHabits },
  ] = await Promise.all([
    supabase.from('goals').select('*', { count: 'exact', head: true }).eq('user_id', user.id).is('deleted_at', null),
    supabase.from('goals').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'active').is('deleted_at', null),
    supabase.from('goals').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'completed').is('deleted_at', null),
    supabase.from('habits').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
  ])

  const name = (profile as { full_name: string | null } | null)?.full_name || user.email?.split('@')[0] || 'there'

  const stats = [
    { label: 'Total Goals', value: totalGoals ?? 0, icon: Target, href: '/goals', color: 'text-emerald-600' },
    { label: 'Active Goals', value: activeGoals ?? 0, icon: TrendingUp, href: '/goals', color: 'text-sky-600' },
    { label: 'Completed', value: completedGoals ?? 0, icon: CheckSquare, href: '/goals', color: 'text-lime-600' },
    { label: 'Habits', value: totalHabits ?? 0, icon: Flame, href: '/habits', color: 'text-orange-600' },
  ]

  return (
    <div className="max-w-4xl space-y-10">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-semibold text-black dark:text-white">
          Good day, {name}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Here's a snapshot of your progress
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, href, color }) => (
          <Link
            key={label}
            href={href}
            className="group p-5 border border-gray-100 dark:border-gray-900 rounded-xl hover:border-gray-200 dark:hover:border-gray-800 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <Icon className={`w-4 h-4 ${color}`} />
              <ArrowRight className="w-3 h-3 text-gray-300 dark:text-gray-700 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors" />
            </div>
            <div className="text-3xl font-bold text-black dark:text-white mb-1">{value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <Link
            href="/goals/new"
            className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-900 rounded-xl hover:border-emerald-200 dark:hover:border-emerald-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Target className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-black dark:text-white">Create a new goal</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-700 group-hover:text-emerald-600 transition-colors" />
          </Link>

          <Link
            href="/habits"
            className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-900 rounded-xl hover:border-lime-200 dark:hover:border-lime-900 hover:bg-lime-50 dark:hover:bg-lime-950/30 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <CheckSquare className="w-4 h-4 text-lime-600" />
              <span className="text-sm font-medium text-black dark:text-white">Log today's habits</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-700 group-hover:text-lime-600 transition-colors" />
          </Link>
        </div>
      </div>

      {/* AI Coaching */}
      <CoachingPanel />
    </div>
  )
}
