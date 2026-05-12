'use client'

import { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'

interface HabitLogButtonProps {
  habitId: string
  completedToday: boolean
  onToggle: (habitId: string, completed: boolean) => void
}

export function HabitLogButton({ habitId, completedToday, onToggle }: HabitLogButtonProps) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(completedToday)

  const handleClick = async () => {
    if (loading) return
    setLoading(true)
    const newState = !done
    setDone(newState) // optimistic

    try {
      const res = await fetch('/api/habits/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          habit_id: habitId,
          completed_date: new Date().toISOString().split('T')[0],
        }),
      })
      if (!res.ok) setDone(!newState) // revert on error
      else onToggle(habitId, newState)
    } catch {
      setDone(!newState)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
        done
          ? 'bg-emerald-600 text-white'
          : 'border-2 border-gray-200 dark:border-gray-800 hover:border-emerald-600 text-transparent hover:text-emerald-600'
      }`}
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
    </button>
  )
}
