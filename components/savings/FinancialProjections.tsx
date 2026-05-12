import { Calendar, TrendingUp, Clock } from 'lucide-react'

interface FinancialProjectionsProps {
  current: number
  target: number
  targetDate: string | null
}

export function FinancialProjections({ current, target, targetDate }: FinancialProjectionsProps) {
  const remaining = Math.max(target - current, 0)

  if (remaining === 0) {
    return (
      <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl">
        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Goal reached! Congratulations!</p>
      </div>
    )
  }

  const today = new Date()
  const deadline = targetDate ? new Date(targetDate) : null
  const daysLeft = deadline ? Math.ceil((deadline.getTime() - today.getTime()) / 86400000) : null
  const weeksLeft = daysLeft ? daysLeft / 7 : null
  const monthsLeft = daysLeft ? daysLeft / 30.44 : null

  const weeklyRequired = weeksLeft && weeksLeft > 0 ? remaining / weeksLeft : null
  const monthlyRequired = monthsLeft && monthsLeft > 0 ? remaining / monthsLeft : null

  // Projected completion based on last 30 days average

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-black dark:text-white">Projections</h3>
      <div className="grid grid-cols-2 gap-3">
        {monthlyRequired !== null && (
          <div className="p-3 border border-gray-100 dark:border-gray-900 rounded-xl">
            <div className="flex items-center gap-1.5 mb-1">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Monthly needed</span>
            </div>
            <div className="text-lg font-bold text-black dark:text-white">
              ${monthlyRequired.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
        )}

        {weeklyRequired !== null && (
          <div className="p-3 border border-gray-100 dark:border-gray-900 rounded-xl">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Weekly needed</span>
            </div>
            <div className="text-lg font-bold text-black dark:text-white">
              ${weeklyRequired.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
        )}

        {daysLeft !== null && (
          <div className="p-3 border border-gray-100 dark:border-gray-900 rounded-xl">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Days remaining</span>
            </div>
            <div className={`text-lg font-bold ${daysLeft < 30 ? 'text-red-500' : 'text-black dark:text-white'}`}>
              {daysLeft < 0 ? 'Overdue' : daysLeft}
            </div>
          </div>
        )}

        <div className="p-3 border border-gray-100 dark:border-gray-900 rounded-xl">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Still needed</span>
          </div>
          <div className="text-lg font-bold text-black dark:text-white">
            ${remaining.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  )
}
