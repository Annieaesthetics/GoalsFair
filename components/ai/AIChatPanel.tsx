'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, Loader2, RotateCcw, Bot, User } from 'lucide-react'

type Message = { role: 'user' | 'assistant'; content: string; streaming?: boolean }

const SUGGESTIONS = [
  'How am I doing with my goals?',
  'Give me motivation for today',
  'What should I focus on this week?',
  'Help me build a better routine',
]

export function AIChatPanel() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content || loading) return

    const userMsg: Message = { role: 'user', content }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    setError('')

    const assistantMsg: Message = { role: 'assistant', content: '', streaming: true }
    setMessages(prev => [...prev, assistantMsg])

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Failed to get response')
        setMessages(prev => prev.slice(0, -1))
        setLoading(false)
        return
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      if (!reader) return

      let fullText = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        fullText += decoder.decode(value)
        setMessages(prev => prev.map((m, i) =>
          i === prev.length - 1 ? { ...m, content: fullText } : m
        ))
      }

      setMessages(prev => prev.map((m, i) =>
        i === prev.length - 1 ? { ...m, streaming: false } : m
      ))
    } catch {
      setError('Connection failed')
      setMessages(prev => prev.slice(0, -1))
    }
    setLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full border border-gray-100 dark:border-gray-900 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-900 bg-white dark:bg-black">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-violet-100 dark:bg-violet-950/50 rounded-full flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-violet-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-black dark:text-white">AI Coach</div>
            <div className="text-xs text-gray-400">Powered by Groq</div>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="p-1.5 rounded-lg text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
            title="Clear chat"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-gray-950/50 min-h-0">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-8 space-y-4">
            <div className="w-12 h-12 bg-violet-100 dark:bg-violet-950/50 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-violet-600" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-black dark:text-white">Your AI Goal Coach</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Ask anything about your goals and habits</p>
            </div>
            <div className="grid grid-cols-1 gap-2 w-full max-w-xs">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="px-3 py-2 text-xs text-left border border-gray-200 dark:border-gray-800 rounded-lg hover:border-violet-300 dark:hover:border-violet-800 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors text-gray-600 dark:text-gray-400"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                msg.role === 'user'
                  ? 'bg-black dark:bg-white'
                  : 'bg-violet-100 dark:bg-violet-950/50'
              }`}>
                {msg.role === 'user'
                  ? <User className="w-3 h-3 text-white dark:text-black" />
                  : <Bot className="w-3 h-3 text-violet-600" />
                }
              </div>
              <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-black dark:bg-white text-white dark:text-black rounded-tr-sm'
                  : 'bg-white dark:bg-gray-900 text-black dark:text-white border border-gray-100 dark:border-gray-800 rounded-tl-sm'
              }`}>
                {msg.content}
                {msg.streaming && (
                  <span className="inline-block w-1 h-3.5 bg-violet-600 animate-pulse ml-0.5 align-middle rounded-sm" />
                )}
              </div>
            </div>
          ))
        )}
        {error && (
          <p className="text-xs text-red-600 dark:text-red-400 text-center">{error}</p>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-900 bg-white dark:bg-black">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your coach..."
            rows={1}
            className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-black text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent resize-none"
            style={{ minHeight: 38, maxHeight: 120 }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="p-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-colors disabled:opacity-40 shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1.5 text-center">50 messages/day · Enter to send</p>
      </div>
    </div>
  )
}
