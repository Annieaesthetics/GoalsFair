import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Pencil, DollarSign, Briefcase, Heart, GraduationCap, Sparkles, Plane, Users, Leaf, Calendar, TrendingUp } from 'lucide-react'
import { GoalProgressRing } from '@/components/goals/GoalProgressRing'
import { MilestoneList } from '@/components/goals/MilestoneList'

const CATEGORY_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  financial:     { icon: DollarSign,    color: '#059669', label: 'Financial' },
  career:        { icon: Briefcase,     color: '#0ea5e9', label: 'Career' },
  health:        { icon: Heart,         color: '#f97316', label: 'Health' },
  education:     { icon: GraduationCap, color: '#8b5cf6', label: 'Education' },
  personal:      { icon: Sparkles,      color: '#ec4899', label: 'Personal' },
  travel:        { icon: Plane,         color: '#f59e0b', label: 'Travel' },
  relationships: { icon: Users,         color: '#ef4444', label: 'Relationships' },
  environment:   { icon: Leaf,          color: '#22c55e', label: 'Environment' },
}

const STATUS_COLORS: Record<string, string> = {
  active:    'text-sky-600 bg-sky-50 dark:bg-sky-950/30',
  completed: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30',
  paused:    'text-amber-600 bg-amber-50 dark:bg-amber-950/30',
  archived:  'text-gray-500 bg-gray-100 dark:bg-gray-900',
}

const STATUS_LABEL: Record<string, string> = {
  active:    'Active',
  completed: 'Completed',
  paused:    'Paused',
  archived:  'Archived',
}

export default async function GoalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { id } = await params

  const { data: goal } = await supabase
    .from('goals')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .single()

  if (!goal) notFound()

  const g = goal as {
    id: string; title: string; description: string | null; category: string;
    status: string | null; progress_percentage: number | null; target_date: string | null;
    estimated_cost: number | null; current_savings: number | null; is_public: boolean | null;
  }

  const { data: milestones } = await supabase
    .from('goal_milestones')
    .select('id, title, completed, display_order, due_date')
    .eq('goal_id', id)
    .order('display_order', { ascending: true })

  const config = CATEGORY_CONFIG[g.category] ?? CATEGORY_CONFIG.personal
  const Icon = config.icon
  const progress = g.progress_percentage ?? 0
  const status = g.status ?? 'active'

  const daysLeft = g.target_date
    ? Math.ceil((new Date(g.target_date).getTime() - Date.now()) / 86400000)
    : null

  return (
    <div className="max-w-2xl space-y-8">
      {/* Back */}
      <Link href="/goals" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> All Goals
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-gray-950 shrink-0">
            <Icon className="w-5 h-5" style={{ color: config.color }} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{config.label}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[status]}`}>
                {STATUS_LABEL[status]}
              </span>
            </div>
            <h1 className="text-xl font-semibold text-black dark:text-white">{g.title}</h1>
          </div>
        </div>
        <Link href={`/goals/${id}/edit`} className="p-2 rounded-lg text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
          <Pencil className="w-4 h-4" />
        </Link>
      </div>

      {/* Description */}
      {g.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{g.description}</p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 border border-gray-100 dark:border-gray-900 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <GoalProgressRing progress={progress} size={32} strokeWidth={3} color={config.color} />
            <span className="text-lg font-bold text-black dark:text-white">{progress}%</span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Progress</div>
        </div>

        {g.target_date && (
          <div className="p-4 border border-gray-100 dark:border-gray-900 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className={`text-lg font-bold ${daysLeft !== null && daysLeft < 7 ? 'text-red-500' : 'text-black dark:text-white'}`}>
                {daysLeft !== null ? (daysLeft < 0 ? 'Overdue' : `${daysLeft}d`) : '—'}
              </span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(g.target_date).toLocaleDateString()}
            </div>
          </div>
        )}

        {g.estimated_cost && (
          <div className="p-4 border border-gray-100 dark:border-gray-900 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              <span className="text-lg font-bold text-black dark:text-white">
                ${(g.current_savings ?? 0).toLocaleString()}
              </span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              of ${g.estimated_cost.toLocaleString()}
            </div>
          </div>
        )}
      </div>

      {/* Milestones */}
      <div className="border-t border-gray-100 dark:border-gray-900 pt-8">
        <MilestoneList goalId={id} initialMilestones={milestones ?? []} />
      </div>

      {/* Savings link for financial goals */}
      {g.category === 'financial' && g.estimated_cost && (
        <div className="border-t border-gray-100 dark:border-gray-900 pt-8">
          <Link
            href={`/goals/${id}/savings`}
            className="flex items-center justify-between p-4 border border-emerald-100 dark:border-emerald-900 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <div>
                <div className="text-sm font-medium text-black dark:text-white">Savings Tracker</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  ${(g.current_savings ?? 0).toLocaleString()} of ${g.estimated_cost.toLocaleString()} saved
                </div>
              </div>
            </div>
            <TrendingUp className="w-4 h-4 text-gray-300 dark:text-gray-700 group-hover:text-emerald-600 transition-colors" />
          </Link>
        </div>
      )}
    </div>
  )
}
