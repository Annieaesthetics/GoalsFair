'use client'

interface SavingsGaugeProps {
  current: number
  target: number
  color?: string
}

export function SavingsGauge({ current, target, color = '#059669' }: SavingsGaugeProps) {
  const progress = target > 0 ? Math.min((current / target) * 100, 100) : 0
  const remaining = Math.max(target - current, 0)

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-bold text-black dark:text-white">
            ${current.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">saved</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold text-black dark:text-white">
            ${target.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">target</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-3 bg-gray-100 dark:bg-gray-900 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progress}%`, backgroundColor: color }}
        />
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="font-medium" style={{ color }}>{progress.toFixed(1)}% complete</span>
        {remaining > 0 && (
          <span className="text-gray-500 dark:text-gray-400">
            ${remaining.toLocaleString()} remaining
          </span>
        )}
        {remaining === 0 && (
          <span className="text-emerald-600 font-medium">Goal reached!</span>
        )}
      </div>
    </div>
  )
}
