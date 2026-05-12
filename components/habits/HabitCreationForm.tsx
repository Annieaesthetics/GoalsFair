'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface Goal { id: string; title: string }

interface HabitCreationFormProps {
  goals: Goal[]
  onSuccess: (habit: any) => void
  onClose: () => void
}

export function HabitCreationForm({ goals, onSuccess, onClose }: HabitCreationFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily')
  const [targetDays, setTargetDays] = useState<number[]>([1, 2, 3, 4, 5])
  const [goalId, setGoalId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const toggleDay = (day: number) =>
    setTargetDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort())

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    setError('')

    const body: Record<string, unknown> = {
      title: title.trim(),
      description: description || undefined,
      frequency,
    }
    if (goalId) body.goal_id = goalId
    if (frequency === 'weekly') body.target_days = targetDays

    const res = await fetch('/api/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Failed to create habit'); setLoading(false); return }
    onSuccess(data.habit)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-black dark:text-white">New Habit</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-black dark:text-white mb-1.5">Habit name *</label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Morning run, Read 20 pages"
              required
              className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-black dark:text-white mb-1.5">Description</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Optional note"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
            />
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-xs font-medium text-black dark:text-white mb-1.5">Frequency</label>
            <div className="flex gap-2">
              {(['daily', 'weekly'] as const).map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFrequency(f)}
                  className={`flex-1 py-2 text-sm rounded-lg border transition-colors capitalize ${
                    frequency === f
                      ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                      : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-400'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Target days for weekly */}
          {frequency === 'weekly' && (
            <div>
              <label className="block text-xs font-medium text-black dark:text-white mb-1.5">Target days</label>
              <div className="flex gap-1.5">
                {DAY_LABELS.map((d, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleDay(i)}
                    className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors ${
                      targetDays.includes(i)
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'border-gray-200 dark:border-gray-800 text-gray-500 hover:border-gray-400'
                    }`}
                  >
                    {d[0]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Link to goal */}
          {goals.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-black dark:text-white mb-1.5">Link to goal</label>
              <select
                value={goalId}
                onChange={e => setGoalId(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="">Select a goal (optional)</option>
                {goals.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
              </select>
            </div>
          )}

          {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm border border-gray-200 dark:border-gray-800 rounded-full text-gray-600 dark:text-gray-400 hover:border-gray-400 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading || !title.trim()} className="flex-1 py-2.5 text-sm bg-black dark:bg-white text-white dark:text-black rounded-full hover:opacity-80 transition-opacity disabled:opacity-50">
              {loading ? 'Creating...' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
