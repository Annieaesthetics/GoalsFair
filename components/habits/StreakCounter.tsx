'use client'

import { Flame, TrendingUp } from 'lucide-react'

interface StreakCounterProps {
  current: number
  longest: number
  size?: 'sm' | 'md' | 'lg'
}

export function StreakCounter({ current, longest, size = 'md' }: StreakCounterProps) {
  const isHot = current >= 7
  const sizes = {
    sm: { icon: 'w-3.5 h-3.5', num: 'text-lg', label: 'text-xs' },
    md: { icon: 'w-4 h-4', num: 'text-2xl', label: 'text-xs' },
    lg: { icon: 'w-5 h-5', num: 'text-3xl', label: 'text-sm' },
  }
  const s = sizes[size]

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-1.5">
        <Flame className={`${s.icon} ${isHot ? 'text-orange-500' : 'text-gray-300 dark:text-gray-700'}`} />
        <div>
          <div className={`${s.num} font-bold text-black dark:text-white leading-none`}>{current}</div>
          <div className={`${s.label} text-gray-500 dark:text-gray-400`}>day streak</div>
        </div>
      </div>
      {longest > 0 && (
        <div className="flex items-center gap-1.5">
          <TrendingUp className={`${s.icon} text-emerald-600`} />
          <div>
            <div className={`${s.num} font-bold text-black dark:text-white leading-none`}>{longest}</div>
            <div className={`${s.label} text-gray-500 dark:text-gray-400`}>best streak</div>
          </div>
        </div>
      )}
    </div>
  )
}
