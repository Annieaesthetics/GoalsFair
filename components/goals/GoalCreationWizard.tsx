'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, DollarSign, Briefcase, Heart, GraduationCap, Sparkles, Plane, Users, Leaf } from 'lucide-react'

const CATEGORIES = [
  { value: 'financial',     label: 'Financial',     icon: DollarSign,    color: 'text-emerald-600', border: 'border-emerald-200 dark:border-emerald-800', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
  { value: 'career',        label: 'Career',        icon: Briefcase,     color: 'text-sky-600',     border: 'border-sky-200 dark:border-sky-800',         bg: 'bg-sky-50 dark:bg-sky-950/30' },
  { value: 'health',        label: 'Health',        icon: Heart,         color: 'text-orange-600',  border: 'border-orange-200 dark:border-orange-800',   bg: 'bg-orange-50 dark:bg-orange-950/30' },
  { value: 'education',     label: 'Education',     icon: GraduationCap, color: 'text-violet-600',  border: 'border-violet-200 dark:border-violet-800',   bg: 'bg-violet-50 dark:bg-violet-950/30' },
  { value: 'personal',      label: 'Personal',      icon: Sparkles,      color: 'text-pink-600',    border: 'border-pink-200 dark:border-pink-800',       bg: 'bg-pink-50 dark:bg-pink-950/30' },
  { value: 'travel',        label: 'Travel',        icon: Plane,         color: 'text-amber-600',   border: 'border-amber-200 dark:border-amber-800',     bg: 'bg-amber-50 dark:bg-amber-950/30' },
  { value: 'relationships', label: 'Relationships', icon: Users,         color: 'text-red-600',     border: 'border-red-200 dark:border-red-800',         bg: 'bg-red-50 dark:bg-red-950/30' },
  { value: 'environment',   label: 'Environment',   icon: Leaf,          color: 'text-green-600',   border: 'border-green-200 dark:border-green-800',     bg: 'bg-green-50 dark:bg-green-950/30' },
]

const PRIORITIES = [
  { value: 'low',    label: 'Low',    desc: 'Nice to have' },
  { value: 'medium', label: 'Medium', desc: 'Important' },
  { value: 'high',   label: 'High',   desc: 'Critical' },
]

const STEPS = ['Category', 'Details', 'Priority', 'Timeline', 'Review']

export function GoalCreationWizard() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    category: '',
    title: '',
    description: '',
    priority: 'medium',
    target_date: '',
    estimated_cost: '',
    is_public: false,
  })

  const update = (key: string, value: string | boolean) => setForm(f => ({ ...f, [key]: value }))

  const canNext = () => {
    if (step === 0) return !!form.category
    if (step === 1) return form.title.trim().length >= 3
    return true
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const body: Record<string, unknown> = {
        title: form.title,
        description: form.description || undefined,
        category: form.category,
        priority: form.priority,
        is_public: form.is_public,
      }
      if (form.target_date) body.target_date = form.target_date
      if (form.estimated_cost) body.estimated_cost = parseFloat(form.estimated_cost)

      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create goal')
      router.push(`/goals/${data.goal.id}`)
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setLoading(false)
    }
  }

  const selectedCategory = CATEGORIES.find(c => c.value === form.category)

  return (
    <div className="max-w-xl">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-10">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
              i < step ? 'bg-emerald-600 text-white' :
              i === step ? 'bg-black dark:bg-white text-white dark:text-black' :
              'bg-gray-100 dark:bg-gray-900 text-gray-400'
            }`}>
              {i < step ? <Check className="w-3 h-3" /> : i + 1}
            </div>
            {i < STEPS.length - 1 && <div className={`h-px w-8 ${i < step ? 'bg-emerald-600' : 'bg-gray-100 dark:bg-gray-900'}`} />}
          </div>
        ))}
      </div>

      {/* Step 0: Category */}
      {step === 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-black dark:text-white">What type of goal?</h2>
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map(({ value, label, icon: Icon, color, border, bg }) => (
              <button
                key={value}
                onClick={() => update('category', value)}
                className={`flex items-center gap-3 p-4 border rounded-xl text-left transition-all ${
                  form.category === value
                    ? `${border} ${bg}`
                    : 'border-gray-100 dark:border-gray-900 hover:border-gray-200 dark:hover:border-gray-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${color}`} />
                <span className="text-sm font-medium text-black dark:text-white">{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 1: Details */}
      {step === 1 && (
        <div className="space-y-5">
          <h2 className="text-xl font-semibold text-black dark:text-white">Describe your goal</h2>
          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-1.5">Goal title *</label>
            <input
              type="text"
              value={form.title}
              onChange={e => update('title', e.target.value)}
              placeholder="e.g. Save $10,000 for emergency fund"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={e => update('description', e.target.value)}
              placeholder="Why is this goal important to you?"
              rows={3}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent resize-none"
            />
          </div>
          {form.category === 'financial' && (
            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-1.5">Target amount ($)</label>
              <input
                type="number"
                value={form.estimated_cost}
                onChange={e => update('estimated_cost', e.target.value)}
                placeholder="10000"
                min="0"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
              />
            </div>
          )}
        </div>
      )}

      {/* Step 2: Priority */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-black dark:text-white">Set priority</h2>
          <div className="space-y-3">
            {PRIORITIES.map(({ value, label, desc }) => (
              <button
                key={value}
                onClick={() => update('priority', value)}
                className={`w-full flex items-center justify-between p-4 border rounded-xl text-left transition-all ${
                  form.priority === value
                    ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-950'
                    : 'border-gray-100 dark:border-gray-900 hover:border-gray-200 dark:hover:border-gray-800'
                }`}
              >
                <div>
                  <div className="text-sm font-medium text-black dark:text-white">{label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{desc}</div>
                </div>
                {form.priority === value && <Check className="w-4 h-4 text-emerald-600" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Timeline */}
      {step === 3 && (
        <div className="space-y-5">
          <h2 className="text-xl font-semibold text-black dark:text-white">Set a deadline</h2>
          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-1.5">Target date (optional)</label>
            <input
              type="date"
              value={form.target_date}
              onChange={e => update('target_date', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
            />
          </div>
          <div className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-900 rounded-xl">
            <div>
              <div className="text-sm font-medium text-black dark:text-white">Make goal public</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Others can see and follow your progress</div>
            </div>
            <button
              onClick={() => update('is_public', !form.is_public)}
              className={`w-10 h-6 rounded-full transition-colors ${form.is_public ? 'bg-emerald-600' : 'bg-gray-200 dark:bg-gray-800'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full mx-1 transition-transform ${form.is_public ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <div className="space-y-5">
          <h2 className="text-xl font-semibold text-black dark:text-white">Review your goal</h2>
          <div className="space-y-3 p-5 border border-gray-100 dark:border-gray-900 rounded-xl">
            {selectedCategory && (
              <div className="flex items-center gap-2 mb-4">
                <selectedCategory.icon className={`w-4 h-4 ${selectedCategory.color}`} />
                <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">{form.category}</span>
              </div>
            )}
            <div>
              <div className="text-xs text-gray-400 mb-0.5">Title</div>
              <div className="text-sm font-medium text-black dark:text-white">{form.title}</div>
            </div>
            {form.description && (
              <div>
                <div className="text-xs text-gray-400 mb-0.5">Description</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{form.description}</div>
              </div>
            )}
            <div className="flex gap-6">
              <div>
                <div className="text-xs text-gray-400 mb-0.5">Priority</div>
                <div className="text-sm text-black dark:text-white capitalize">{form.priority}</div>
              </div>
              {form.target_date && (
                <div>
                  <div className="text-xs text-gray-400 mb-0.5">Deadline</div>
                  <div className="text-sm text-black dark:text-white">{new Date(form.target_date).toLocaleDateString()}</div>
                </div>
              )}
              {form.estimated_cost && (
                <div>
                  <div className="text-xs text-gray-400 mb-0.5">Target</div>
                  <div className="text-sm text-black dark:text-white">${parseFloat(form.estimated_cost).toLocaleString()}</div>
                </div>
              )}
            </div>
          </div>
          {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8">
        <button
          onClick={() => step === 0 ? router.back() : setStep(s => s - 1)}
          className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {step === 0 ? 'Cancel' : 'Back'}
        </button>

        {step < 4 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={!canNext()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-full hover:opacity-80 transition-opacity disabled:opacity-30"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-full transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Goal'}
            {!loading && <Check className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  )
}
