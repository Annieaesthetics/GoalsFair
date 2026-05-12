'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

interface Transaction {
  id: string
  amount: number
  transaction_type: string | null
  description: string | null
  transaction_date: string | null
  created_at: string | null
}

interface AddTransactionFormProps {
  goalId: string
  onSuccess: (transaction: Transaction) => void
}

export function AddTransactionForm({ goalId, onSuccess }: AddTransactionFormProps) {
  const [type, setType] = useState<'deposit' | 'withdrawal'>('deposit')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || parseFloat(amount) <= 0) { setError('Enter a valid amount'); return }
    setLoading(true)
    setError('')

    const res = await fetch('/api/savings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        goal_id: goalId,
        amount: parseFloat(amount),
        transaction_type: type,
        description: description || null,
        transaction_date: date,
      }),
    })

    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Failed to add transaction'); setLoading(false); return }

    onSuccess(data.transaction)
    setAmount('')
    setDescription('')
    setDate(new Date().toISOString().split('T')[0])
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-5 border border-gray-100 dark:border-gray-900 rounded-xl">
      <h3 className="text-sm font-medium text-black dark:text-white">Add Transaction</h3>

      {/* Type toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setType('deposit')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm rounded-lg border transition-colors ${
            type === 'deposit'
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
              : 'border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:border-gray-300'
          }`}
        >
          <Plus className="w-3.5 h-3.5" /> Deposit
        </button>
        <button
          type="button"
          onClick={() => setType('withdrawal')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm rounded-lg border transition-colors ${
            type === 'withdrawal'
              ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
              : 'border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:border-gray-300'
          }`}
        >
          <Minus className="w-3.5 h-3.5" /> Withdrawal
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-black dark:text-white mb-1">Amount ($)</label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0.00"
            min="0.01"
            step="0.01"
            required
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-black dark:text-white mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-black dark:text-white mb-1">Note (optional)</label>
        <input
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="e.g. Monthly savings"
          className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
        />
      </div>

      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50"
      >
        {loading ? 'Adding...' : `Add ${type === 'deposit' ? 'Deposit' : 'Withdrawal'}`}
      </button>
    </form>
  )
}
