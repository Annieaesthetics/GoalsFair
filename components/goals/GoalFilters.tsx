'use client'

import { useRouter, usePathname } from 'next/navigation'

const CATEGORIES = ['financial', 'career', 'health', 'education', 'personal', 'travel', 'relationships', 'environment']
const STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'paused', label: 'Paused' },
  { value: 'archived', label: 'Archived' },
]

interface GoalFiltersProps {
  activeCategory?: string
  activeStatus?: string
}

export function GoalFilters({ activeCategory, activeStatus }: GoalFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()

  const setFilter = (key: string, value: string | undefined) => {
    const params = new URLSearchParams()
    if (key !== 'category' && activeCategory) params.set('category', activeCategory)
    if (key !== 'status' && activeStatus) params.set('status', activeStatus)
    if (value) params.set(key, value)
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  return (
    <div className="flex flex-wrap gap-2">
      {/* Category filters */}
      {CATEGORIES.map(cat => (
        <button
          key={cat}
          onClick={() => setFilter('category', activeCategory === cat ? undefined : cat)}
          className={`px-3 py-1 text-xs rounded-full border transition-colors capitalize ${
            activeCategory === cat
              ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
              : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-600'
          }`}
        >
          {cat}
        </button>
      ))}

      <div className="w-px h-5 bg-gray-200 dark:bg-gray-800 self-center mx-1" />

      {/* Status filters */}
      {STATUSES.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => setFilter('status', activeStatus === value ? undefined : value)}
          className={`px-3 py-1 text-xs rounded-full border transition-colors ${
            activeStatus === value
              ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
              : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-600'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
