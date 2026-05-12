'use client'

import { useState, useMemo } from 'react'
import { Plus, CheckSquare, Flame, TrendingUp, Calendar } from 'lucide-react'
import { HabitCard } from './HabitCard'
import { HabitCreationForm } from './HabitCreationForm'
import { HabitCalendar } from './HabitCalendar'

type HabitRow = {
  id: string; title: string; description: string | null; frequency: string;
  target_days: number[] | null; current_streak: number; longest_streak: number;
  goal_id: string | null; is_active: boolean | null; completed_today: boolean;
  goal_title?: string | null
}

type GoalRow = { id: string; title: string }

interface HabitsClientProps {
  initialHabits: HabitRow[]
  logsByHabit: Record<string, string[]>
  goals: GoalRow[]
}

export function HabitsClient({ initialHabits, logsByHabit, goals }: HabitsClientProps) {
  const [habits, setHabits] = useState(initialHabits)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<'all' | 'today' | 'done' | 'daily' | 'weekly'>('today')
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null)

  const handleNewHabit = (habit: HabitRow) => {
    setHabits(prev => [{ ...habit, completed_today: false }, ...prev])
    setShowForm(false)
  }

  const handleDelete = (id: string) => setHabits(prev => prev.filter(h => h.id !== id))

  const handleToggle = (habitId: string, completed: boolean) => {
    setHabits(prev => prev.map(h => h.id === habitId ? { ...h, completed_today: completed, current_streak: completed ? h.current_streak + 1 : Math.max(h.current_streak - 1, 0) } : h))
  }

  const filteredHabits = useMemo(() => {
    return habits.filter(h => {
      if (filter === 'today') return !h.completed_today
      if (filter === 'done') return h.completed_today
      if (filter === 'daily') return h.frequency === 'daily'
      if (filter === 'weekly') return h.frequency === 'weekly'
      return true
    })
  }, [habits, filter])

  const totalCompleted = habits.filter(h => h.completed_today).length
  const totalToday = habits.length
  const bestStreak = Math.max(...habits.map(h => h.longest_streak), 0)
  const currentBestStreak = Math.max(...habits.map(h => h.current_streak), 0)

  // All completed dates for the selected habit calendar
  const calendarDates = selectedHabit
    ? (logsByHabit[selectedHabit] ?? [])
    : Object.values(logsByHabit).flat()

  const FILTERS = [
    { value: 'today', label: 'Remaining' },
    { value: 'done', label: 'Done today' },
    { value: 'all', label: 'All' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
  ] as const

  return (
    <div className="max-w-3xl space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-black dark:text-white">Habits</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {totalCompleted}/{totalToday} completed today
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-full hover:opacity-80 transition-opacity"
        >
          <Plus className="w-4 h-4" /> New Habit
        </button>
      </div>

      {/* Stats */}
      {habits.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 border border-gray-100 dark:border-gray-900 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Today</span>
            </div>
            <div className="text-2xl font-bold text-black dark:text-white">{totalCompleted}/{totalToday}</div>
            <div className="mt-2 h-1.5 bg-gray-100 dark:bg-gray-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all"
                style={{ width: totalToday > 0 ? `${(totalCompleted / totalToday) * 100}%` : '0%' }}
              />
            </div>
          </div>

          <div className="p-4 border border-gray-100 dark:border-gray-900 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Best streak</span>
            </div>
            <div className="text-2xl font-bold text-black dark:text-white">{currentBestStreak}</div>
            <div className="text-xs text-gray-400 mt-1">Record: {bestStreak} days</div>
          </div>

          <div className="p-4 border border-gray-100 dark:border-gray-900 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-sky-600" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Habits</span>
            </div>
            <div className="text-2xl font-bold text-black dark:text-white">{habits.length}</div>
            <div className="text-xs text-gray-400 mt-1">
              {habits.filter(h => h.frequency === 'daily').length} daily · {habits.filter(h => h.frequency === 'weekly').length} weekly
            </div>
          </div>
        </div>
      )}

      {/* Calendar */}
      {habits.length > 0 && (
        <div className="p-5 border border-gray-100 dark:border-gray-900 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-black dark:text-white">
                {selectedHabit ? habits.find(h => h.id === selectedHabit)?.title : 'All habits'}
              </span>
            </div>
            {selectedHabit && (
              <button onClick={() => setSelectedHabit(null)} className="text-xs text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                Show all
              </button>
            )}
          </div>
          <HabitCalendar completedDates={calendarDates} />
          {/* Habit selector for calendar */}
          {habits.length > 1 && (
            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-gray-50 dark:border-gray-950">
              {habits.map(h => (
                <button
                  key={h.id}
                  onClick={() => setSelectedHabit(selectedHabit === h.id ? null : h.id)}
                  className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                    selectedHabit === h.id
                      ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                      : 'border-gray-200 dark:border-gray-800 text-gray-500 hover:border-gray-400'
                  }`}
                >
                  {h.title}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      {habits.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                filter === value
                  ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                  : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-400'
              }`}
            >
              {label}
              {value === 'today' && habits.filter(h => !h.completed_today).length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-black dark:bg-white text-white dark:text-black rounded-full text-xs">
                  {habits.filter(h => !h.completed_today).length}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Habits list */}
      {filteredHabits.length > 0 ? (
        <div className="space-y-3">
          {filteredHabits.map(habit => (
            <HabitCard key={habit.id} habit={habit} onDelete={handleDelete} onToggle={handleToggle} />
          ))}
        </div>
      ) : habits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
          <CheckSquare className="w-8 h-8 text-gray-300 dark:text-gray-700 mb-3" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No habits yet</p>
          <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">Build consistency with daily and weekly habits</p>
          <button onClick={() => setShowForm(true)} className="mt-4 text-sm text-emerald-600 hover:underline">
            Create your first habit
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {filter === 'today' ? 'All habits completed for today!' : 'No habits match this filter'}
          </p>
        </div>
      )}

      {/* Creation form modal */}
      {showForm && (
        <HabitCreationForm
          goals={goals}
          onSuccess={handleNewHabit}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  )
}
