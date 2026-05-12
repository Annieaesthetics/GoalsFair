'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { use } from 'react'

const CATEGORIES = ['financial', 'career', 'health', 'education', 'personal', 'travel', 'relationships', 'environment']
const PRIORITIES = ['low', 'medium', 'high']
const STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'paused', label: 'Paused' },
]

export default function EditGoalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '', description: '', category: '', priority: 'medium',
    status: 'active', target_date: '', estimated_cost: '', is_public: false,
  })

  useEffect(() => {
    fetch(`/api/goals/${id}`)
      .then(r => r.json())
      .then(({ goal }) => {
        if (goal) setForm({
          title: goal.title ?? '',
          description: goal.description ?? '',
          category: goal.category ?? '',
          priority: goal.priority ?? 'medium',
          status: goal.status ?? 'active',
          target_date: goal.target_date ? goal.target_date.split('T')[0] : '',
          estimated_cost: goal.estimated_cost ? String(goal.estimated_cost) : '',
          is_public: goal.is_public ?? false,
        })
      })
  }, [id])

  const update = (key: string, value: string | boolean) => setForm(f => ({ ...f, [key]: value }))

  const handleSave = async () => {
    setLoading(true)
    setError('')
    const body: Record<string, unknown> = {
      title: form.title, description: form.description || undefined,
      category: form.category, priority: form.priority,
      status: form.status, is_public: form.is_public,
    }
    if (form.target_date) body.target_date = form.target_date
    if (form.estimated_cost) body.estimated_cost = parseFloat(form.estimated_cost)

    const res = await fetch(`/api/goals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.ok) { router.push(`/goals/${id}`); router.refresh() }
    else { const d = await res.json(); setError(d.error || 'Failed to save'); setLoading(false) }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this goal? This cannot be undone.')) return
    setDeleting(true)
    await fetch(`/api/goals/${id}`, { method: 'DELETE' })
    router.push('/goals')
    router.refresh()
  }

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <Link href={`/goals/${id}`} className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <h1 className="text-2xl font-semibold text-black dark:text-white">Edit Goal</h1>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-black dark:text-white mb-1.5">Title</label>
          <input type="text" value={form.title} onChange={e => update('title', e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent" />
        </div>

        <div>
          <label className="block text-sm font-medium text-black dark:text-white mb-1.5">Description</label>
          <textarea value={form.description} onChange={e => update('description', e.target.value)} rows={3}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-1.5">Category</label>
            <select value={form.category} onChange={e => update('category', e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600 capitalize">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-1.5">Status</label>
            <select value={form.status} onChange={e => update('status', e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600">
              {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-1.5">Priority</label>
            <select value={form.priority} onChange={e => update('priority', e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600 capitalize">
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-1.5">Target date</label>
            <input type="date" value={form.target_date} onChange={e => update('target_date', e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600" />
          </div>
        </div>

        {form.category === 'financial' && (
          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-1.5">Target amount ($)</label>
            <input type="number" value={form.estimated_cost} onChange={e => update('estimated_cost', e.target.value)} min="0"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600" />
          </div>
        )}

        {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}

        <div className="flex items-center justify-between pt-2">
          <button onClick={handleDelete} disabled={deleting}
            className="inline-flex items-center gap-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 disabled:opacity-50">
            <Trash2 className="w-4 h-4" /> {deleting ? 'Deleting...' : 'Delete goal'}
          </button>
          <button onClick={handleSave} disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-full hover:opacity-80 transition-opacity disabled:opacity-50">
            <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
