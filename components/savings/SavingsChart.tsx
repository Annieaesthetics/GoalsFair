'use client'

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface SavingsChartProps {
  transactions: {
    amount: number
    transaction_type: string | null
    transaction_date: string | null
    created_at: string | null
  }[]
  target: number
}

export function SavingsChart({ transactions }: SavingsChartProps) {
  // Build cumulative savings over time
  const sorted = [...transactions].sort((a, b) => {
    const da = new Date(a.transaction_date ?? a.created_at ?? 0).getTime()
    const db = new Date(b.transaction_date ?? b.created_at ?? 0).getTime()
    return da - db
  })

  let running = 0
  const data = sorted.map(tx => {
    const delta = tx.transaction_type === 'withdrawal' ? -tx.amount : tx.amount
    running += delta
    return {
      date: new Date(tx.transaction_date ?? tx.created_at ?? 0).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      saved: Math.max(running, 0),
    }
  })

  if (data.length === 0) return null

  return (
    <div className="h-40">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#059669" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#059669" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
          <Tooltip
            contentStyle={{ background: 'var(--background)', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Saved']}
          />
          <Area type="monotone" dataKey="saved" stroke="#059669" strokeWidth={2} fill="url(#savingsGradient)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
