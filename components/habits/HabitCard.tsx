'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Flame, MoreHorizontal, Trash2, Target } from 'lucide-react'
import { HabitLogButton } from './HabitLogButton'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface HabitCardProps {
  habit: {
    id: string
    title: string
    description: string | null
    frequency: string
    target_days: number[] | null
    current_streak: number
    longest_streak: number
    goal_id: string | null
    goal_title?: string | null
    completed_today: boolean
  }
  onDelete: (id: string) => void
  onToggle: (habitId: string, completed: boolean) => void
}

export function HabitCard({ habit, onDelete, onToggle }: HabitCardProps) {
  const [completedToday, setCompletedToday] = useState(habit.completed_today)
  const [streak, setStreak] = useState(habit.current_streak)

  const handleToggle = (_: string, completed: boolean) => {
    setCompletedToday(completed)
    setStreak(s => completed ? s + 1 : Math.max(s - 1, 0))
    onToggle(habit.id, completed)
  }

  const handleDelete = async () => {
    if (!confirm('Delete this habit?')) return
    onDelete(habit.id)
    await fetch(`/api/habits/${habit.id}`, { method: 'DELETE' })
  }

  return (
    <div className={`group p-4 border rounded-xl transition-colors ${
      completedToday
        ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20'
        : 'border-gray-100 dark:border-gray-900 hover:border-gray-200 dark:hover:border-gray-800'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <HabitLogButton habitId={habit.id} completedToday={completedToday} onToggle={handleToggle} />
          <div className="flex-1 min-w-0">
            <div className={`text-sm font-medium truncate ${completedToday ? 'text-gray-400 dark:text-gray-600 line-through' : 'text-black dark:text-white'}`}>
              {habit.title}
            </div>
            {habit.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{habit.description}</p>
            )}
            <div className="flex items-center gap-3 mt-2">
              {/* Streak */}
              <div className="flex items-center gap-1">
                <Flame className={`w-3.5 h-3.5 ${streak >= 7 ? 'text-orange-500' : 'text-gray-300 dark:text-gray-700'}`} />
                <span className="text-xs font-medium text-black dark:text-white">{streak}</span>
                <span className="text-xs text-gray-400">streak</span>
              </div>
              {/* Frequency */}
              <span className="text-xs text-gray-400 capitalize">{habit.frequency}</span>
              {/* Target days for weekly */}
              {habit.frequency === 'weekly' && habit.target_days && (
                <div className="flex gap-0.5">
                  {DAY_LABELS.map((d, i) => (
                    <span key={i} className={`text-xs px-1 rounded ${
                      habit.target_days!.includes(i)
                        ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400'
                        : 'text-gray-300 dark:text-gray-700'
                    }`}>{d[0]}</span>
                  ))}
                </div>
              )}
            </div>
            {/* Linked goal */}
            {habit.goal_title && (
              <Link href={`/goals/${habit.goal_id}`} className="inline-flex items-center gap-1 mt-1.5 text-xs text-gray-400 hover:text-emerald-600 transition-colors">
                <Target className="w-3 h-3" />
                {habit.goal_title}
              </Link>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900 transition-all">
              <MoreHorizontal className="w-4 h-4 text-gray-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleDelete} className="text-red-600 dark:text-red-400">
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
