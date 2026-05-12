'use client'

import { useMemo } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts'
import { Target, CheckSquare, TrendingUp, Flame, DollarSign, Trophy } from 'lucide-react'

type Goal = { id: string; title: string; category: string; status: string | null; progress_percentage: number | null; created_at: string | null; target_date: string | null }
type Habit = { id: string; title: string; frequency: string; current_streak: number; longest_streak: number }
type HabitLog = { habit_id: string; completed_date: string }
type Transaction = { amount: number; transaction_type: string | null; transaction_date: string | null; goal_id: string }

const CATEGORY_COLORS: Record<string, string> = {
  financial: '#059669', career: '#0ea5e9', health: '#f97316',
  education: '#8b5cf6', personal: '#ec4899', travel: '#f59e0b',
  relationships: '#ef4444', environment: '#22c55e',
}

interface AnalyticsClientProps {
  goals: Goal[]
  habits: Habit[]
  habitLogs: HabitLog[]
  transactions: Transaction[]
}

export function AnalyticsClient({ goals, habits, habitLogs, transactions }: AnalyticsClientProps) {
  // Goal stats
  const goalsByCategory = useMemo(() => {
    const map: Record<string, number> = {}
    goals.forEach(g => { map[g.category] = (map[g.category] ?? 0) + 1 })
    return Object.entries(map).map(([name, value]) => ({ name, value, color: CATEGORY_COLORS[name] ?? '#059669' }))
  }, [goals])

  const goalsByStatus = useMemo(() => [
    { name: 'Active', value: goals.filter(g => g.status === 'active').length, color: '#0ea5e9' },
    { name: 'Completed', value: goals.filter(g => g.status === 'completed').length, color: '#059669' },
    { name: 'Paused', value: goals.filter(g => g.status === 'paused').length, color: '#f59e0b' },
    { name: 'Archived', value: goals.filter(g => g.status === 'archived').length, color: '#9ca3af' },
  ].filter(s => s.value > 0), [goals])

  // Habit completion last 30 days
  const habitHeatmap = useMemo(() => {
    const today = new Date()
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date(today)
      d.setDate(today.getDate() - (29 - i))
      const dateStr = d.toISOString().split('T')[0]
      const count = habitLogs.filter(l => l.completed_date === dateStr).length
      return {
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        completions: count,
        rate: habits.length > 0 ? Math.round((count / habits.length) * 100) : 0,
      }
    })
  }, [habitLogs, habits])

  // Savings over time
  const savingsChart = useMemo(() => {
    let running = 0
    return transactions.map(t => {
      running += t.transaction_type === 'withdrawal' ? -t.amount : t.amount
      return {
        date: t.transaction_date ? new Date(t.transaction_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '',
        total: Math.max(running, 0),
      }
    })
  }, [transactions])

  const avgProgress = goals.length > 0 ? Math.round(goals.reduce((s, g) => s + (g.progress_percentage ?? 0), 0) / goals.length) : 0
  const bestStreak = Math.max(...habits.map(h => h.longest_streak), 0)
  const totalSaved = transactions.reduce((s, t) => s + (t.transaction_type === 'withdrawal' ? -t.amount : t.amount), 0)
  const completionRate = habits.length > 0 && habitLogs.length > 0
    ? Math.round((habitLogs.filter(l => {
        const d = new Date(l.completed_date)
        return (new Date().getTime() - d.getTime()) <= 30 * 86400000
      }).length / (habits.length * 30)) * 100)
    : 0

  const statCards = [
    { icon: Target, label: 'Avg Goal Progress', value: `${avgProgress}%`, color: 'text-emerald-600' },
    { icon: CheckSquare, label: 'Habit Completion (30d)', value: `${completionRate}%`, color: 'text-sky-600' },
    { icon: Flame, label: 'Best Streak', value: `${bestStreak}d`, color: 'text-orange-500' },
    { icon: DollarSign, label: 'Total Saved', value: `$${Math.max(totalSaved, 0).toLocaleString()}`, color: 'text-lime-600' },
    { icon: Trophy, label: 'Goals Completed', value: goals.filter(g => g.status === 'completed').length, color: 'text-violet-600' },
    { icon: TrendingUp, label: 'Active Goals', value: goals.filter(g => g.status === 'active').length, color: 'text-pink-600' },
  ]

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-black dark:text-white">Analytics</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your progress at a glance</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="p-4 border border-gray-100 dark:border-gray-900 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-4 h-4 ${color}`} />
              <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
            </div>
            <div className="text-2xl font-bold text-black dark:text-white">{value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Habit completion rate */}
        {habitHeatmap.some(d => d.completions > 0) && (
          <div className="p-5 border border-gray-100 dark:border-gray-900 rounded-xl space-y-3">
            <h3 className="text-sm font-medium text-black dark:text-white">Habit Completions — Last 30 Days</h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={habitHeatmap} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" className="dark:stroke-gray-900" />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#9ca3af' }} tickLine={false} axisLine={false} interval={4} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="completions" fill="#059669" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Goals by category */}
        {goalsByCategory.length > 0 && (
          <div className="p-5 border border-gray-100 dark:border-gray-900 rounded-xl space-y-3">
            <h3 className="text-sm font-medium text-black dark:text-white">Goals by Category</h3>
            <div className="flex items-center gap-4">
              <div className="h-40 w-40 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={goalsByCategory} dataKey="value" cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3}>
                      {goalsByCategory.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5 flex-1">
                {goalsByCategory.map(({ name, value, color }) => (
                  <div key={name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">{name}</span>
                    </div>
                    <span className="text-xs font-medium text-black dark:text-white">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Savings over time */}
        {savingsChart.length > 1 && (
          <div className="p-5 border border-gray-100 dark:border-gray-900 rounded-xl space-y-3 lg:col-span-2">
            <h3 className="text-sm font-medium text-black dark:text-white">Cumulative Savings</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={savingsChart} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="savingsLine" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" className="dark:stroke-gray-900" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                  <Tooltip contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`$${v.toLocaleString()}`, 'Total saved']} />
                  <Line type="monotone" dataKey="total" stroke="#059669" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Goal status breakdown */}
        {goalsByStatus.length > 0 && (
          <div className="p-5 border border-gray-100 dark:border-gray-900 rounded-xl space-y-3">
            <h3 className="text-sm font-medium text-black dark:text-white">Goal Status</h3>
            <div className="space-y-2">
              {goalsByStatus.map(({ name, value, color }) => (
                <div key={name} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-20">{name}</span>
                  <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-900 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${goals.length > 0 ? (value / goals.length) * 100 : 0}%`, backgroundColor: color }} />
                  </div>
                  <span className="text-xs font-medium text-black dark:text-white w-4 text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top habits by streak */}
        {habits.length > 0 && (
          <div className="p-5 border border-gray-100 dark:border-gray-900 rounded-xl space-y-3">
            <h3 className="text-sm font-medium text-black dark:text-white">Top Habits by Streak</h3>
            <div className="space-y-2">
              {[...habits].sort((a, b) => b.current_streak - a.current_streak).slice(0, 5).map(h => (
                <div key={h.id} className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 dark:text-gray-400 flex-1 truncate">{h.title}</span>
                  <div className="flex items-center gap-1">
                    <Flame className={`w-3 h-3 ${h.current_streak >= 7 ? 'text-orange-500' : 'text-gray-300 dark:text-gray-700'}`} />
                    <span className="text-xs font-medium text-black dark:text-white">{h.current_streak}d</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
