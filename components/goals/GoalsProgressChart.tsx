'use client'

import { useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell
} from 'recharts'

type GoalRow = {
  id: string
  title: string
  category: string
  status: string | null
  progress_percentage: number | null
  target_date: string | null
}

interface GoalsProgressChartProps {
  goals: GoalRow[]
  selectedCategories: string[]
}

const CATEGORY_COLORS: Record<string, string> = {
  financial: '#059669', career: '#0ea5e9', health: '#f97316',
  education: '#8b5cf6', personal: '#ec4899', travel: '#f59e0b',
  relationships: '#ef4444', environment: '#22c55e',
}
const CATEGORY_LABELS: Record<string, string> = {
  financial: 'Financial', career: 'Career', health: 'Health',
  education: 'Education', personal: 'Personal', travel: 'Travel',
  relationships: 'Relationships', environment: 'Environment',
}

type ViewMode = 'progress' | 'active' | 'completed' | 'paused' | 'all'
type ChartType = 'area' | 'bar' | 'radar'

const VIEW_MODES: { value: ViewMode; label: string }[] = [
  { value: 'progress', label: 'Avg Progress' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'paused', label: 'Paused' },
  { value: 'all', label: 'All Goals' },
]

export function GoalsProgressChart({ goals, selectedCategories }: GoalsProgressChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('progress')
  const [chartType, setChartType] = useState<ChartType>('area')

  if (goals.length === 0) return null

  // Build per-category data
  const categoryMap: Record<string, GoalRow[]> = {}
  goals.forEach(g => {
    if (!categoryMap[g.category]) categoryMap[g.category] = []
    categoryMap[g.category].push(g)
  })

  const chartData = Object.entries(categoryMap).map(([cat, items]) => {
    const avg = Math.round(items.reduce((s, g) => s + (g.progress_percentage ?? 0), 0) / items.length)
    return {
      name: CATEGORY_LABELS[cat] ?? cat,
      category: cat,
      progress: avg,
      active: items.filter(g => g.status === 'active').length,
      completed: items.filter(g => g.status === 'completed').length,
      paused: items.filter(g => g.status === 'paused').length,
      total: items.length,
      color: CATEGORY_COLORS[cat] ?? '#059669',
    }
  })

  const dataKey = viewMode === 'progress' ? 'progress'
    : viewMode === 'active' ? 'active'
    : viewMode === 'completed' ? 'completed'
    : viewMode === 'paused' ? 'paused'
    : 'total'

  const yMax = viewMode === 'progress' ? 100 : undefined

  const primaryColor = selectedCategories.length === 1
    ? CATEGORY_COLORS[selectedCategories[0]] ?? '#059669'
    : '#059669'

  const overallValue = viewMode === 'progress'
    ? Math.round(goals.reduce((s, g) => s + (g.progress_percentage ?? 0), 0) / goals.length)
    : viewMode === 'active' ? goals.filter(g => g.status === 'active').length
    : viewMode === 'completed' ? goals.filter(g => g.status === 'completed').length
    : viewMode === 'paused' ? goals.filter(g => g.status === 'paused').length
    : goals.length

  const tooltipFormatter = (value: number) =>
    viewMode === 'progress' ? [`${value}%`, 'Avg Progress'] : [`${value}`, 'Goals']

  return (
    <div className="p-6 border border-gray-100 dark:border-gray-900 rounded-xl space-y-5">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-medium text-black dark:text-white">
            {selectedCategories.length === 1
              ? `${CATEGORY_LABELS[selectedCategories[0]]} — ${VIEW_MODES.find(v => v.value === viewMode)?.label}`
              : selectedCategories.length > 1
              ? `${selectedCategories.length} Categories — ${VIEW_MODES.find(v => v.value === viewMode)?.label}`
              : `All Goals — ${VIEW_MODES.find(v => v.value === viewMode)?.label}`}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {goals.length} goal{goals.length !== 1 ? 's' : ''} · {chartData.length} categor{chartData.length !== 1 ? 'ies' : 'y'}
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-3xl font-bold text-black dark:text-white">
            {overallValue}{viewMode === 'progress' ? '%' : ''}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {viewMode === 'progress' ? 'avg progress' : VIEW_MODES.find(v => v.value === viewMode)?.label.toLowerCase()}
          </div>
        </div>
      </div>

      {/* View mode tabs */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex gap-1 flex-wrap">
          {VIEW_MODES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setViewMode(value)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                viewMode === value
                  ? 'bg-black dark:bg-white text-white dark:text-black font-medium'
                  : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {/* Chart type switcher */}
        <div className="flex gap-1">
          {(['area', 'bar', 'radar'] as ChartType[]).map(type => (
            <button
              key={type}
              onClick={() => setChartType(type)}
              className={`px-2.5 py-1 text-xs rounded-lg transition-colors capitalize ${
                chartType === type
                  ? 'bg-gray-100 dark:bg-gray-900 text-black dark:text-white font-medium'
                  : 'text-gray-400 hover:text-black dark:hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'radar' ? (
            <RadarChart data={chartData}>
              <PolarGrid stroke="#e5e7eb" className="dark:stroke-gray-800" />
              <PolarAngleAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <Radar dataKey={dataKey} stroke={primaryColor} fill={primaryColor} fillOpacity={0.15} strokeWidth={2} />
              <Tooltip formatter={tooltipFormatter} contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }} />
            </RadarChart>
          ) : chartType === 'bar' ? (
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" className="dark:stroke-gray-900" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <YAxis domain={yMax ? [0, yMax] : undefined} tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}${viewMode === 'progress' ? '%' : ''}`} />
              <Tooltip formatter={tooltipFormatter} contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey={dataKey} radius={[4, 4, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={primaryColor} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" className="dark:stroke-gray-900" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <YAxis domain={yMax ? [0, yMax] : undefined} tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}${viewMode === 'progress' ? '%' : ''}`} />
              <Tooltip formatter={tooltipFormatter} contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey={dataKey} stroke={primaryColor} strokeWidth={2.5} fill="url(#chartGradient)" dot={{ fill: primaryColor, strokeWidth: 0, r: 4 }} activeDot={{ r: 6 }} />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Category legend */}
      {chartData.length > 1 && (
        <div className="flex flex-wrap gap-3 pt-1 border-t border-gray-50 dark:border-gray-950">
          {chartData.map(d => (
            <div key={d.category} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
              <span>{d.name}:</span>
              <span className="font-medium text-black dark:text-white">
                {viewMode === 'progress' ? `${d.progress}%` : `${d[dataKey as keyof typeof d]}`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
