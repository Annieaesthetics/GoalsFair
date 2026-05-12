'use client'

import { useState } from 'react'
import { Image as ImageIcon, MessageSquare, Sparkles } from 'lucide-react'
import { VisionBoard } from './VisionBoard'
import { AIChatPanel } from '@/components/ai/AIChatPanel'
import { CoachingPanel } from '@/components/ai/CoachingPanel'

type GoalRow = { id: string; title: string; category: string }
type ImageRow = { id: string; goal_id: string; image_url: string; caption: string | null; display_order: number }

interface VisionBoardClientProps {
  goals: GoalRow[]
  imagesByGoal: Record<string, ImageRow[]>
  userId: string
}

const CATEGORY_COLORS: Record<string, string> = {
  financial: '#059669', career: '#0ea5e9', health: '#f97316',
  education: '#8b5cf6', personal: '#ec4899', travel: '#f59e0b',
  relationships: '#ef4444', environment: '#22c55e',
}

type RightPanel = 'chat' | 'coaching'

export function VisionBoardClient({ goals, imagesByGoal, userId }: VisionBoardClientProps) {
  const [selectedGoalId, setSelectedGoalId] = useState<string>(goals[0]?.id ?? '')
  const [rightPanel, setRightPanel] = useState<RightPanel>('chat')

  const selectedGoal = goals.find(g => g.id === selectedGoalId)
  const images = selectedGoalId ? (imagesByGoal[selectedGoalId] ?? []) : []
  const totalImages = Object.values(imagesByGoal).flat().length

  return (
    <div className="max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-black dark:text-white">Vision Board</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {totalImages} image{totalImages !== 1 ? 's' : ''} · {goals.length} goal{goals.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6 items-start">
        {/* Left: Vision Board (3/5) */}
        <div className="lg:col-span-3 space-y-5">
          {goals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
              <ImageIcon className="w-10 h-10 text-gray-200 dark:text-gray-800 mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Create a goal first</p>
              <p className="text-xs text-gray-400 mt-1">Vision boards are linked to your goals</p>
            </div>
          ) : (
            <>
              {/* Goal tabs */}
              <div className="flex flex-wrap gap-2">
                {goals.map(g => (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGoalId(g.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border transition-all ${
                      selectedGoalId === g.id
                        ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white font-medium'
                        : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-400'
                    }`}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: CATEGORY_COLORS[g.category] ?? '#059669' }}
                    />
                    {g.title}
                    {(imagesByGoal[g.id]?.length ?? 0) > 0 && (
                      <span className={`text-xs ${selectedGoalId === g.id ? 'opacity-70' : 'text-gray-400'}`}>
                        {imagesByGoal[g.id].length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {selectedGoal && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[selectedGoal.category] ?? '#059669' }} />
                    <h2 className="text-sm font-medium text-black dark:text-white">{selectedGoal.title}</h2>
                    <span className="text-xs text-gray-400 capitalize">{selectedGoal.category}</span>
                  </div>
                  <VisionBoard goalId={selectedGoalId} initialImages={images} userId={userId} />
                </div>
              )}
            </>
          )}
        </div>

        {/* Right: AI Panel (2/5) */}
        <div className="lg:col-span-2 space-y-3 lg:sticky lg:top-6">
          {/* Panel switcher */}
          <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-900 rounded-xl">
            <button
              onClick={() => setRightPanel('chat')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs rounded-lg transition-colors font-medium ${
                rightPanel === 'chat'
                  ? 'bg-white dark:bg-black text-black dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" /> Chat
            </button>
            <button
              onClick={() => setRightPanel('coaching')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs rounded-lg transition-colors font-medium ${
                rightPanel === 'coaching'
                  ? 'bg-white dark:bg-black text-black dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> Coaching
            </button>
          </div>

          {/* Panel content */}
          {rightPanel === 'chat' ? (
            <div style={{ height: 520 }} className="flex flex-col">
              <AIChatPanel />
            </div>
          ) : (
            <CoachingPanel />
          )}
        </div>
      </div>
    </div>
  )
}
