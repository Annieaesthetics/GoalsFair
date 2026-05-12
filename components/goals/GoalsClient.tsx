'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Target, Search, LayoutGrid, List, ArrowUpDown, TrendingUp, CheckCircle2, Clock, PauseCircle } from 'lucide-react'
import { GoalCard } from './GoalCard'
import { GoalsProgressChart } from './GoalsProgressChart'

type GoalRow = {
  id: string
  title: string
  description: string | null
  category: string
  status: string | null
  progress_percentage: number | null
  target_date: string | null
}

const CATEGORIES = ['financial', 'career', 'health', 'education', 'personal', 'travel', 'relationships', 'environment']
const STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'paused', label: 'Paused' },
  { value: 'archived', label: 'Archived' },
]
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'progress_high', label: 'Progress ↑' },
  { value: 'progress_low', label: 'Progress ↓' },
  { value: 'deadline', label: 'Deadline' },
  { value: 'title', label: 'A → Z' },
]

interface GoalsClientProps {
  allGoals: GoalRow[]
}

export function GoalsClient({ allGoals }: GoalsClientProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showSearch, setShowSearch] = useState(false)

  const toggleCategory = (cat: string) =>
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])

  const filteredGoals = useMemo(() => {
    let result = allGoals.filter(g => {
      const catMatch = selectedCategories.length === 0 || selectedCategories.includes(g.category)
      const statusMatch = !selectedStatus || g.status === selectedStatus
      const searchMatch = !search || g.title.toLowerCase().includes(search.toLowerCase())
      return catMatch && statusMatch && searchMatch
    })

    switch (sortBy) {
      case 'oldest': result = [...result].reverse(); break
      case 'progress_high': result = [...result].sort((a, b) => (b.progress_percentage ?? 0) - (a.progress_percentage ?? 0)); break
      case 'progress_low': result = [...result].sort((a, b) => (a.progress_percentage ?? 0) - (b.progress_percentage ?? 0)); break
      case 'deadline': result = [...result].sort((a, b) => {
        if (!a.target_date) return 1
        if (!b.target_date) return -1
        return new Date(a.target_date).getTime() - new Date(b.target_date).getTime()
      }); break
      case 'title': result = [...result].sort((a, b) => a.title.localeCompare(b.title)); break
    }
    return result
  }, [allGoals, selectedCategories, selectedStatus, search, sortBy])

  // Stats
  const stats = useMemo(() => ({
    total: allGoals.length,
    active: allGoals.filter(g => g.status === 'active').length,
    completed: allGoals.filter(g => g.status === 'completed').length,
    paused: allGoals.filter(g => g.status === 'paused').length,
    avgProgress: allGoals.length > 0
      ? Math.round(allGoals.reduce((s, g) => s + (g.progress_percentage ?? 0), 0) / allGoals.length)
      : 0,
  }), [allGoals])

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-black dark:text-white">Goals</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {filteredGoals.length} of {allGoals.length} goal{allGoals.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Feature 1: Search toggle */}
          <button
            onClick={() => setShowSearch(s => !s)}
            className={`p-2 rounded-lg transition-colors ${showSearch ? 'bg-gray-100 dark:bg-gray-900 text-black dark:text-white' : 'text-gray-400 hover:text-black dark:hover:text-white'}`}
          >
            <Search className="w-4 h-4" />
          </button>
          {/* Feature 2: View toggle */}
          <button onClick={() => setViewMode(v => v === 'grid' ? 'list' : 'grid')} className="p-2 rounded-lg text-gray-400 hover:text-black dark:hover:text-white transition-colors">
            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
          </button>
          {/* Feature 3: Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="appearance-none pl-7 pr-3 py-1.5 text-xs border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ArrowUpDown className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
          </div>
          <Link href="/goals/new" className="inline-flex items-center gap-1.5 px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-full hover:opacity-80 transition-opacity">
            <span className="text-base leading-none">+</span> New Goal
          </Link>
        </div>
      </div>

      {/* Feature 1: Search bar */}
      {showSearch && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            autoFocus
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search goals..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-black text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
          />
        </div>
      )}

      {/* Feature 4: Stats summary bar */}
      {allGoals.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: TrendingUp, label: 'Avg Progress', value: `${stats.avgProgress}%`, color: 'text-emerald-600' },
            { icon: Target, label: 'Active', value: stats.active, color: 'text-sky-600' },
            { icon: CheckCircle2, label: 'Completed', value: stats.completed, color: 'text-lime-600' },
            { icon: PauseCircle, label: 'Paused', value: stats.paused, color: 'text-amber-600' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="flex items-center gap-2.5 p-3 border border-gray-100 dark:border-gray-900 rounded-xl">
              <Icon className={`w-4 h-4 shrink-0 ${color}`} />
              <div>
                <div className="text-sm font-semibold text-black dark:text-white">{value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      {allGoals.length > 0 && (
        <GoalsProgressChart
          goals={filteredGoals.length > 0 ? filteredGoals : allGoals}
          selectedCategories={selectedCategories}
        />
      )}

      {/* Filters */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors capitalize ${
                selectedCategories.includes(cat)
                  ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                  : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-600'
              }`}
            >
              {cat}
            </button>
          ))}
          {selectedCategories.length > 0 && (
            <button onClick={() => setSelectedCategories([])} className="px-3 py-1 text-xs rounded-full border border-dashed border-gray-300 dark:border-gray-700 text-gray-400 hover:text-black dark:hover:text-white transition-colors">
              Clear
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="w-px h-5 bg-gray-200 dark:bg-gray-800 self-center" />
          {STATUSES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setSelectedStatus(selectedStatus === value ? null : value)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                selectedStatus === value
                  ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                  : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Feature 5: Deadline warning banner */}
      {(() => {
        const overdue = filteredGoals.filter(g => g.target_date && new Date(g.target_date) < new Date() && g.status !== 'completed')
        return overdue.length > 0 ? (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl">
            <Clock className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-xs text-red-700 dark:text-red-400">
              <span className="font-medium">{overdue.length} goal{overdue.length > 1 ? 's' : ''} overdue</span>
              {' — '}{overdue.map(g => g.title).join(', ')}
            </p>
          </div>
        ) : null
      })()}

      {/* Goals Grid or List */}
      {filteredGoals.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGoals.map(goal => <GoalCard key={goal.id} goal={goal} />)}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredGoals.map(goal => (
              <Link key={goal.id} href={`/goals/${goal.id}`} className="flex items-center gap-4 p-4 border border-gray-100 dark:border-gray-900 rounded-xl hover:border-gray-200 dark:hover:border-gray-800 transition-colors group">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-black dark:text-white truncate">{goal.title}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{goal.category} · {goal.status}</div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {goal.target_date && (
                    <span className="text-xs text-gray-400">{new Date(goal.target_date).toLocaleDateString()}</span>
                  )}
                  <div className="w-24 h-1.5 bg-gray-100 dark:bg-gray-900 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${goal.progress_percentage ?? 0}%` }} />
                  </div>
                  <span className="text-xs font-medium text-black dark:text-white w-8 text-right">{goal.progress_percentage ?? 0}%</span>
                </div>
              </Link>
            ))}
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
          <Target className="w-8 h-8 text-gray-300 dark:text-gray-700 mb-3" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {selectedCategories.length > 0 || selectedStatus || search ? 'No goals match your filters' : 'No goals yet'}
          </p>
          {selectedCategories.length === 0 && !selectedStatus && !search && (
            <Link href="/goals/new" className="mt-4 text-sm text-emerald-600 hover:underline">Create a goal</Link>
          )}
        </div>
      )}
    </div>
  )
}
