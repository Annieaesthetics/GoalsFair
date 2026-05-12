'use client'

import Link from 'next/link'
import { DollarSign, Briefcase, Heart, GraduationCap, Sparkles, Plane, Users, Leaf, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { GoalProgressRing } from './GoalProgressRing'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

const CATEGORY_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  financial:     { icon: DollarSign,     color: '#059669', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
  career:        { icon: Briefcase,      color: '#0ea5e9', bg: 'bg-sky-50 dark:bg-sky-950/30' },
  health:        { icon: Heart,          color: '#f97316', bg: 'bg-orange-50 dark:bg-orange-950/30' },
  education:     { icon: GraduationCap,  color: '#8b5cf6', bg: 'bg-violet-50 dark:bg-violet-950/30' },
  personal:      { icon: Sparkles,       color: '#ec4899', bg: 'bg-pink-50 dark:bg-pink-950/30' },
  travel:        { icon: Plane,          color: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  relationships: { icon: Users,          color: '#ef4444', bg: 'bg-red-50 dark:bg-red-950/30' },
  environment:   { icon: Leaf,           color: '#22c55e', bg: 'bg-green-50 dark:bg-green-950/30' },
}

const STATUS_LABEL: Record<string, string> = {
  active:    'Active',
  completed: 'Completed',
  paused:    'Paused',
  archived:  'Archived',
}
interface GoalCardProps {
  goal: {
    id: string
    title: string
    category: string
    status: string | null
    progress_percentage: number | null
    target_date: string | null
    description: string | null
  }
  onDelete?: (id: string) => void
}

export function GoalCard({ goal, onDelete }: GoalCardProps) {
  const config = CATEGORY_CONFIG[goal.category] ?? CATEGORY_CONFIG.personal
  const Icon = config.icon
  const progress = goal.progress_percentage ?? 0

  const daysLeft = goal.target_date
    ? Math.ceil((new Date(goal.target_date).getTime() - Date.now()) / 86400000)
    : null

  return (
    <div className="group relative p-5 border border-gray-100 dark:border-gray-900 rounded-xl hover:border-gray-200 dark:hover:border-gray-800 transition-colors bg-white dark:bg-black">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${config.bg}`}>
          <Icon className="w-4 h-4" style={{ color: config.color }} />
        </div>
        <div className="flex items-center gap-2">
          <GoalProgressRing progress={progress} size={36} strokeWidth={3} color={config.color} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900 transition-all">
                <MoreHorizontal className="w-4 h-4 text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/goals/${goal.id}/edit`}>
                  <Pencil className="w-4 h-4 mr-2" /> Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete?.(goal.id)} className="text-red-600 dark:text-red-400">
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <Link href={`/goals/${goal.id}`} className="block">
        <h3 className="font-medium text-black dark:text-white text-sm mb-1 line-clamp-2">{goal.title}</h3>
        {goal.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{goal.description}</p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-gray-400 dark:text-gray-600 capitalize">
            {STATUS_LABEL[goal.status ?? 'active']}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium" style={{ color: config.color }}>{progress}%</span>
            {daysLeft !== null && (
              <span className={`text-xs ${daysLeft < 7 ? 'text-red-500' : 'text-gray-400 dark:text-gray-600'}`}>
                {daysLeft < 0 ? 'Overdue' : `${daysLeft}d left`}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}
