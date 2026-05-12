'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Bot, X, Minus, Maximize2, Send, Loader2, Zap,
  MessageSquare, Copy, Check, Volume2, VolumeX,
  ChevronDown, RotateCcw, Keyboard
} from 'lucide-react'
import Link from 'next/link'

type Message = {
  role: 'user' | 'assistant' | 'tool'
  content: string
  streaming?: boolean
  id: string
}

const TOOL_ICONS: Record<string, string> = {
  create_goal: '🎯', create_habit: '✅', add_deposit: '💰',
  add_withdrawal: '💸', web_search: '🔍', send_notification: '🔔',
  create_milestone: '📍', log_habit: '📝', save_memory: '🧠',
  create_goal_plan: '📋', load_skills: '📚',
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-400 hover:text-black dark:hover:text-white transition-all"
      title="Copy message"
      aria-label="Copy message"
    >
      {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
    </button>
  )
}

export function FloatingAIButton() {
  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'chat' | 'agent'>('chat')
  const [muted, setMuted] = useState(false)
  const [fontSize, setFontSize] = useState<'sm' | 'base'>('sm')
  const [activeToolName, setActiveToolName] = useState<string | null>(null)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const msgId = useRef(0)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Keyboard shortcut: Ctrl+/ to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault()
        setOpen(o => !o)
        setMinimized(false)
      }
      if (e.key === 'Escape' && open) setMinimized(true)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  const sendMessage = useCallback(async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content || loading) return

    const userMsg: Message = { role: 'user', content, id: String(msgId.current++) }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    const assistantId = String(msgId.current++)
    setMessages(prev => [...prev, { role: 'assistant', content: '', streaming: true, id: assistantId }])

    try {
      const res = await fetch('/api/ai/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role === 'tool' ? 'assistant' : m.role, content: m.content })),
          mode,
        }),
      })

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      if (!reader) return

      let fullText = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        fullText += chunk

        // Detect tool being used
        const toolMatch = fullText.match(/__TOOL_RUNNING__(.*?)__END_TOOL_RUNNING__/)
        if (toolMatch) setActiveToolName(toolMatch[1])
        else setActiveToolName(null)

        // Strip all markers for display
        const display = fullText
          .replace(/__PENDING_ACTIONS__[\s\S]*?__END_ACTIONS__/g, '')
          .replace(/__TOOL_RUNNING__[\s\S]*?__END_TOOL_RUNNING__/g, '')
          .replace(/__TOOL_RESULT__[\s\S]*?__END_TOOL_RESULT__/g, '')
          .replace(/<tool_calls>[\s\S]*?<\/tool_calls>/g, '')
          .replace(/<tool_calls>[\s\S]*/g, '')
          .trim()

        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: display } : m))
      }

      setActiveToolName(null)
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, streaming: false } : m))
    } catch {
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: 'Connection failed. Try again.', streaming: false } : m))
    }
    setLoading(false)
  }, [input, loading, messages, mode])

  const textSize = fontSize === 'sm' ? 'text-xs' : 'text-sm'

  return (
    <>
      {/* Floating button — bottom-right, above any content */}
      {!open && (
        <button
          onClick={() => { setOpen(true); setMinimized(false) }}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-violet-600 hover:bg-violet-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
          aria-label="Open AI Assistant (Ctrl+/)"
          title="Open AI Assistant (Ctrl+/)"
        >
          <Bot className="w-5 h-5" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" aria-hidden="true" />
        </button>
      )}

      {/* Chat panel — positioned to NOT overlap the main send button */}
      {open && (
        <div
          role="dialog"
          aria-label="AI Assistant"
          aria-modal="false"
          className={`fixed z-50 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl flex flex-col transition-all duration-200 ${
            minimized
              ? 'bottom-6 right-6 w-64 h-12'
              : 'bottom-6 right-6 w-88 h-[480px]'
          }`}
          style={{ width: minimized ? 256 : 352 }}
        >
          {/* Header */}
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100 dark:border-gray-900 shrink-0">
            <div className="w-6 h-6 bg-gradient-to-br from-violet-100 to-emerald-100 dark:from-violet-950/50 dark:to-emerald-950/50 rounded-full flex items-center justify-center shrink-0">
              <Bot className="w-3 h-3 text-violet-600" aria-hidden="true" />
            </div>
            <span className="text-xs font-medium text-black dark:text-white flex-1">
              AI Assistant
              {activeToolName && (
                <span className="ml-2 text-violet-600 animate-pulse">
                  {TOOL_ICONS[activeToolName] ?? '⚙️'} {activeToolName.replace(/_/g, ' ')}...
                </span>
              )}
            </span>

            {!minimized && (
              <div className="flex items-center gap-0.5">
                {/* Mode toggle */}
                <div className="flex gap-0.5 p-0.5 bg-gray-100 dark:bg-gray-900 rounded-md mr-1">
                  <button
                    onClick={() => setMode('chat')}
                    className={`px-1.5 py-0.5 text-xs rounded transition-colors ${mode === 'chat' ? 'bg-white dark:bg-black text-black dark:text-white' : 'text-gray-500'}`}
                    title="Chat mode — conversation only"
                    aria-pressed={mode === 'chat'}
                  >
                    <MessageSquare className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setMode('agent')}
                    className={`px-1.5 py-0.5 text-xs rounded transition-colors ${mode === 'agent' ? 'bg-white dark:bg-black text-amber-500' : 'text-gray-500'}`}
                    title="Agent mode — can take actions"
                    aria-pressed={mode === 'agent'}
                  >
                    <Zap className="w-3 h-3" />
                  </button>
                </div>

                {/* Font size toggle */}
                <button
                  onClick={() => setFontSize(s => s === 'sm' ? 'base' : 'sm')}
                  className="p-1 rounded text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                  title="Toggle font size"
                  aria-label="Toggle font size"
                >
                  <span className="text-xs font-bold">A</span>
                </button>

                {/* Mute */}
                <button
                  onClick={() => setMuted(m => !m)}
                  className="p-1 rounded text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                  title={muted ? 'Unmute' : 'Mute notifications'}
                  aria-label={muted ? 'Unmute' : 'Mute'}
                >
                  {muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                </button>

                {/* Clear */}
                <button
                  onClick={() => setMessages([])}
                  className="p-1 rounded text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                  title="Clear conversation"
                  aria-label="Clear conversation"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>

                {/* Shortcuts */}
                <button
                  onClick={() => setShowShortcuts(s => !s)}
                  className="p-1 rounded text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                  title="Keyboard shortcuts"
                  aria-label="Keyboard shortcuts"
                >
                  <Keyboard className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Full screen */}
            <Link
              href="/ai"
              className="p-1 rounded text-gray-400 hover:text-black dark:hover:text-white transition-colors"
              title="Open full screen"
              aria-label="Open full screen AI"
            >
              <Maximize2 className="w-3 h-3" />
            </Link>

            {/* Minimize */}
            <button
              onClick={() => setMinimized(s => !s)}
              className="p-1 rounded text-gray-400 hover:text-black dark:hover:text-white transition-colors"
              aria-label={minimized ? 'Expand' : 'Minimize'}
            >
              {minimized ? <ChevronDown className="w-3 h-3 rotate-180" /> : <Minus className="w-3 h-3" />}
            </button>

            {/* Close */}
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded text-gray-400 hover:text-red-500 transition-colors"
              aria-label="Close AI Assistant"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {!minimized && (
            <>
              {/* Shortcuts panel */}
              {showShortcuts && (
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-950 border-b border-gray-100 dark:border-gray-900 text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                  <div className="font-medium text-black dark:text-white mb-1">Keyboard Shortcuts</div>
                  <div className="flex justify-between"><span>Open/Close</span><kbd className="px-1 bg-gray-200 dark:bg-gray-800 rounded">Ctrl+/</kbd></div>
                  <div className="flex justify-between"><span>Minimize</span><kbd className="px-1 bg-gray-200 dark:bg-gray-800 rounded">Esc</kbd></div>
                  <div className="flex justify-between"><span>Send</span><kbd className="px-1 bg-gray-200 dark:bg-gray-800 rounded">Enter</kbd></div>
                </div>
              )}

              {/* Messages */}
              <div
                className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50 dark:bg-gray-950"
                role="log"
                aria-live="polite"
                aria-label="Chat messages"
              >
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                    <Bot className="w-7 h-7 text-gray-300 dark:text-gray-700" aria-hidden="true" />
                    <div>
                      <p className={`${textSize} font-medium text-black dark:text-white`}>
                        {mode === 'agent' ? 'Agent Mode' : 'Chat Mode'}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {mode === 'agent' ? 'I can take actions for you' : 'Ask me anything'}
                      </p>
                    </div>
                    <Link href="/ai" className="text-xs text-violet-600 hover:underline">
                      Open full screen →
                    </Link>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`group flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      {msg.role === 'tool' ? (
                        <div className={`w-full px-2.5 py-1.5 rounded-lg ${textSize} font-medium ${
                          msg.content.startsWith('✓')
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900'
                            : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900'
                        }`}>
                          {msg.content}
                        </div>
                      ) : (
                        <>
                          <div className={`max-w-[85%] px-3 py-2 rounded-xl ${textSize} leading-relaxed ${
                            msg.role === 'user'
                              ? 'bg-black dark:bg-white text-white dark:text-black rounded-tr-sm'
                              : 'bg-white dark:bg-gray-900 text-black dark:text-white border border-gray-100 dark:border-gray-800 rounded-tl-sm'
                          }`}>
                            {msg.content}
                            {msg.streaming && (
                              <span className="inline-block w-1 h-3 bg-violet-600 animate-pulse ml-0.5 align-middle rounded-sm" aria-hidden="true" />
                            )}
                          </div>
                          {msg.role === 'assistant' && !msg.streaming && (
                            <CopyButton text={msg.content} />
                          )}
                        </>
                      )}
                    </div>
                  ))
                )}
                <div ref={bottomRef} aria-hidden="true" />
              </div>

              {/* Agent mode indicator */}
              {mode === 'agent' && (
                <div className="px-3 py-1 bg-amber-50 dark:bg-amber-950/20 border-t border-amber-100 dark:border-amber-900/50 flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-amber-500 shrink-0" aria-hidden="true" />
                  <span className="text-xs text-amber-600 dark:text-amber-400">Agent can take actions</span>
                </div>
              )}

              {/* Input */}
              <div className="p-2.5 border-t border-gray-100 dark:border-gray-900 bg-white dark:bg-black">
                <div className="flex gap-2 items-center">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                    placeholder={mode === 'agent' ? 'Ask agent to act...' : 'Ask anything...'}
                    className="flex-1 px-3 py-2 text-xs border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-black text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent"
                    aria-label="Message input"
                    disabled={loading}
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={loading || !input.trim()}
                    className="p-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-colors disabled:opacity-40 shrink-0"
                    aria-label="Send message"
                  >
                    {loading
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                      : <Send className="w-3.5 h-3.5" aria-hidden="true" />
                    }
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
