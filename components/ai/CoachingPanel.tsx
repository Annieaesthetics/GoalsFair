'use client'

import { useState } from 'react'
import { Sparkles, RefreshCw, Loader2 } from 'lucide-react'

export function CoachingPanel() {
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasLoaded, setHasLoaded] = useState(false)

  const fetchCoaching = async () => {
    setLoading(true)
    setError('')
    setResponse('')

    try {
      const res = await fetch('/api/ai/coaching', { method: 'POST' })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to get coaching')
        setLoading(false)
        return
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      if (!reader) return

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        setResponse(prev => prev + decoder.decode(value))
      }
      setHasLoaded(true)
    } catch {
      setError('Failed to connect to AI service')
    }
    setLoading(false)
  }

  return (
    <div className="p-5 border border-gray-100 dark:border-gray-900 rounded-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-600" />
          <h3 className="text-sm font-medium text-black dark:text-white">AI Coach</h3>
        </div>
        <button
          onClick={fetchCoaching}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          {hasLoaded ? 'Refresh' : 'Get coaching'}
        </button>
      </div>

      {!response && !loading && !error && (
        <div className="py-6 text-center">
          <Sparkles className="w-8 h-8 text-gray-200 dark:text-gray-800 mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Get personalized coaching based on your goals and habits</p>
          <button
            onClick={fetchCoaching}
            className="mt-3 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm rounded-full transition-colors"
          >
            Get my coaching
          </button>
        </div>
      )}

      {loading && !response && (
        <div className="flex items-center gap-2 py-4">
          <Loader2 className="w-4 h-4 animate-spin text-violet-600" />
          <span className="text-sm text-gray-500 dark:text-gray-400">Analyzing your progress...</span>
        </div>
      )}

      {response && (
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {response}
          {loading && <span className="inline-block w-1 h-4 bg-violet-600 animate-pulse ml-0.5 align-middle" />}
        </p>
      )}

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}

      <p className="text-xs text-gray-400 dark:text-gray-600">Powered by Groq · Mistral · Anthropic · 10 requests/day</p>
    </div>
  )
}
