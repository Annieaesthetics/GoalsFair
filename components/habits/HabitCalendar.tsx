'use client'

interface HabitCalendarProps {
  completedDates: string[]
}

export function HabitCalendar({ completedDates }: HabitCalendarProps) {
  const completedSet = new Set(completedDates)

  // Build last 84 days (12 weeks)
  const today = new Date()
  const days: { date: string; completed: boolean; isToday: boolean }[] = []

  for (let i = 83; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    days.push({
      date: dateStr,
      completed: completedSet.has(dateStr),
      isToday: i === 0,
    })
  }

  // Pad to start on Sunday
  const firstDay = new Date(days[0].date).getDay()
  const padded = Array(firstDay).fill(null).concat(days)

  // Split into weeks
  const weeks: (typeof days[0] | null)[][] = []
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7))
  }

  const completionRate = Math.round((completedDates.filter(d => {
    const date = new Date(d)
    const diff = (today.getTime() - date.getTime()) / 86400000
    return diff <= 30
  }).length / 30) * 100)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-gray-400">Last 12 weeks</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">{completionRate}% last 30 days</span>
      </div>
      <div className="flex gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day, di) => (
              <div
                key={di}
                title={day?.date}
                className={`w-3 h-3 rounded-sm transition-colors ${
                  !day ? 'opacity-0' :
                  day.isToday ? 'ring-1 ring-emerald-600 ' + (day.completed ? 'bg-emerald-600' : 'bg-gray-100 dark:bg-gray-900') :
                  day.completed ? 'bg-emerald-500' : 'bg-gray-100 dark:bg-gray-900'
                }`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        <span>Less</span>
        <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-900" />
        <div className="w-3 h-3 rounded-sm bg-emerald-200 dark:bg-emerald-900" />
        <div className="w-3 h-3 rounded-sm bg-emerald-400" />
        <div className="w-3 h-3 rounded-sm bg-emerald-600" />
        <span>More</span>
      </div>
    </div>
  )
}
