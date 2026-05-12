'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  Send, Loader2, Bot, User, Plus, Trash2, MessageSquare,
  Zap, ChevronDown, Check, X, AlertTriangle, Copy,
  RotateCcw, Brain, Sparkles, Package,
} from 'lucide-react'
import type { ModelProvider } from '@/lib/ai/models'

import { ExtensionsPanel } from './ExtensionsPanel'

const TOOL_ICONS: Record<string, string> = {
  create_goal: '🎯', create_habit: '✅', add_deposit: '💰',
  add_withdrawal: '💸', web_search: '🔍', send_notification: '🔔',
  create_milestone: '📍', log_habit: '📝', save_memory: '🧠',
  create_goal_plan: '📋', update_goal_status: '🔄', load_skills: '📚',
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-400 hover:text-black dark:hover:text-white transition-all shrink-0"
      title="Copy message" aria-label="Copy message"
    >
      {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
    </button>
  )
}

type Message = {
  role: 'user' | 'assistant' | 'tool'
  content: string
  streaming?: boolean
  isRetry?: boolean
}

type Conversation = {
  id: string
  title: string
  mode: 'chat' | 'agent'
  model: string
  updated_at: string
}

type Permission = { action_type: string; always_allow: boolean }

type PendingAction = {
  tool: string
  params: Record<string, unknown>
  reason: string
  requiresConfirmation: 'always' | 'always_allow' | 'silent'
  description: string
  agentName: string
}

type ToolResult = { tool: string; result: string; success: boolean }

const SUGGESTIONS = [
  'What should I focus on today?',
  'Analyze my goal progress',
  'Create a plan to achieve my goals',
  'What habits should I build?',
  'How am I doing financially?',
]

const AGENT_COLORS: Record<string, string> = {
  action: 'text-emerald-600', finance: 'text-amber-600',
  planner: 'text-violet-600', researcher: 'text-sky-600',
  habit_coach: 'text-orange-600', notification: 'text-pink-600',
  orchestrator: 'text-gray-600',
}

// Strip internal protocol markers from text shown to user
function cleanMarkers(text: string): string {
  return text
    .replace(/__NEW_TURN__/g, '')
    .replace(/__TOOL_RUNNING__[\s\S]*?__END_TOOL_RUNNING__/g, '')
    .replace(/__TOOL_RESULT__[\s\S]*?__END_TOOL_RESULT__/g, '')
    .replace(/__PENDING_ACTIONS__[\s\S]*?__END_ACTIONS__/g, '')
    .replace(/__ERROR__[\s\S]*?__END_ERROR__/g, '')
    .replace(/<tool_calls>[\s\S]*?<\/tool_calls>/g, '')
    .replace(/<tool_calls>[\s\S]*/g, '')
    .trim()
}

interface AIAgentClientProps {
  initialConversations: Conversation[]
  initialPermissions: Permission[]
  availableModels: (ModelProvider & { available: boolean })[]
  userId: string
}

export function AIAgentClient({ initialConversations, initialPermissions, availableModels }: AIAgentClientProps) {
  const [conversations, setConversations] = useState(initialConversations)
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'chat' | 'agent'>('chat')
  const [selectedModel, setSelectedModel] = useState(availableModels.find(m => m.available)?.id ?? '')
  const [showModelPicker, setShowModelPicker] = useState(false)
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([])
  const [permissions, setPermissions] = useState<Permission[]>(initialPermissions)
  const [showSidebar, setShowSidebar] = useState(true)
  const [showExtensions, setShowExtensions] = useState(false)
  const [executingAction, setExecutingAction] = useState<string | null>(null)
  const [activeToolName, setActiveToolName] = useState<string | null>(null)
  const [fontSize, setFontSize] = useState<'sm' | 'base'>('sm')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  // Snapshot of messages at the time agent was invoked — used for retries
  const lastMsgsRef = useRef<Message[]>([])
  const lastConvIdRef = useRef<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const isAlwaysAllowed = (tool: string) => permissions.some(p => p.action_type === tool && p.always_allow)

  const loadConversation = useCallback(async (convId: string) => {
    setActiveConvId(convId)
    const res = await fetch(`/api/ai/conversations/${convId}`)
    const data = await res.json()
    setMessages(data.messages ?? [])
    const conv = conversations.find(c => c.id === convId)
    if (conv) { setMode(conv.mode as 'chat' | 'agent'); setSelectedModel(conv.model) }
  }, [conversations])

  const createConversation = async () => {
    try {
      const res = await fetch('/api/ai/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Conversation', mode, model: selectedModel }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        console.error('Failed to create conversation:', err)
        return null
      }
      const data = await res.json()
      if (!data.conversation) return null
      setConversations(prev => [data.conversation, ...prev])
      setActiveConvId(data.conversation.id)
      setMessages([])
      return data.conversation.id as string
    } catch (e) {
      console.error('createConversation error:', e)
      return null
    }
  }

  const deleteConversation = async (id: string) => {
    await fetch(`/api/ai/conversations/${id}`, { method: 'DELETE' })
    setConversations(prev => prev.filter(c => c.id !== id))
    if (activeConvId === id) { setActiveConvId(null); setMessages([]) }
  }

  // Execute a single tool action, returns result for follow-up
  const executeAction = async (
    action: PendingAction,
    convId: string,
  ): Promise<ToolResult> => {
    setExecutingAction(action.tool)
    try {
      const res = await fetch('/api/ai/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: action.tool, params: action.params, conversationId: convId }),
      })
      const data = await res.json()
      setExecutingAction(null)
      return { tool: action.tool, result: data.message ?? data.error ?? 'Done', success: res.ok && data.success !== false }
    } catch (e) {
      setExecutingAction(null)
      return { tool: action.tool, result: String(e), success: false }
    }
  }

  // Core agentic loop — streams response, handles multi-turn, tool results, self-correction
  const runAgentStream = useCallback(async (
    msgs: Message[],
    convId: string,
    toolResult?: ToolResult,
  ) => {
    // Add fresh streaming bubble
    setMessages(prev => [...prev, { role: 'assistant', content: '', streaming: true }])

    try {
      const res = await fetch('/api/ai/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: msgs.map(m => ({
            role: m.role === 'tool' ? 'assistant' : m.role,
            content: m.content,
          })),
          conversationId: convId,
          mode,
          modelId: selectedModel,
          toolResult,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setMessages(prev => prev.map((m, i) =>
          i === prev.length - 1 ? { ...m, content: err.error ?? 'Error', streaming: false } : m
        ))
        return
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      if (!reader) return

      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        // New turn — agent continues with a fresh bubble after tool execution
        if (buffer.includes('__NEW_TURN__')) {
          const idx = buffer.indexOf('__NEW_TURN__')
          const before = buffer.slice(0, idx)
          const after = buffer.slice(idx + '__NEW_TURN__'.length)
          setMessages(prev => prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: cleanMarkers(before), streaming: false } : m
          ))
          setMessages(prev => [...prev, { role: 'assistant', content: '', streaming: true }])
          buffer = after
          continue
        }

        // Tool running indicator
        const runningMatch = buffer.match(/__TOOL_RUNNING__(.*?)__END_TOOL_RUNNING__/)
        if (runningMatch) {
          const toolName = runningMatch[1]
          setActiveToolName(toolName)
          setMessages(prev => [
            ...prev.slice(0, -1),
            { role: 'tool', content: `⏳ ${TOOL_ICONS[toolName] ?? '⚙️'} Running ${toolName.replace(/_/g, ' ')}...` },
            { role: 'assistant', content: '', streaming: true },
          ])
          buffer = buffer.replace(/__TOOL_RUNNING__.*?__END_TOOL_RUNNING__/, '')
          continue
        }

        // Tool result — replace the ⏳ bubble
        const resultMatch = buffer.match(/__TOOL_RESULT__(.*?)__END_TOOL_RESULT__/)
        if (resultMatch) {
          try {
            const r = JSON.parse(resultMatch[1]) as { tool: string; success: boolean; message: string }
            setMessages(prev => {
              const reversed = [...prev].reverse()
              const idx = reversed.findIndex(m => m.role === 'tool' && m.content.startsWith('⏳'))
              if (idx === -1) return [...prev, { role: 'tool', content: `${r.success ? '✓' : '✗'} ${r.message}` }]
              const realIdx = prev.length - 1 - idx
              return prev.map((m, i) => i === realIdx ? { ...m, content: `${r.success ? '✓' : '✗'} ${r.message}` } : m)
            })
          } catch { /* skip */ }
          buffer = buffer.replace(/__TOOL_RESULT__.*?__END_TOOL_RESULT__/, '')
          continue
        }

        // Pending actions — needs user confirmation
        if (buffer.includes('__PENDING_ACTIONS__') && buffer.includes('__END_ACTIONS__')) {
          const actionMatch = buffer.match(/__PENDING_ACTIONS__([\s\S]*?)__END_ACTIONS__/)
          if (actionMatch) {
            const cleanText = cleanMarkers(buffer.replace(/__PENDING_ACTIONS__[\s\S]*?__END_ACTIONS__/, ''))
            setMessages(prev => prev.map((m, i) =>
              i === prev.length - 1 ? { ...m, content: cleanText, streaming: false } : m
            ))
            try {
              const actions: PendingAction[] = JSON.parse(actionMatch[1])
              // Pre-approved always_allow tools execute immediately and trigger follow-up
              const autoApproved = actions.filter(a =>
                a.requiresConfirmation === 'always_allow' && isAlwaysAllowed(a.tool)
              )
              const needsConfirm = actions.filter(a => !autoApproved.includes(a))

              for (const action of autoApproved) {
                const r = await executeAction(action, convId)
                setMessages(prev => [...prev, {
                  role: 'tool',
                  content: `${r.success ? '✓' : '✗'} ${r.result}`,
                }])
                // Feed result back — agent continues reasoning
                await runAgentStream(
                  [...msgs, { role: 'assistant', content: cleanText }],
                  convId,
                  r,
                )
              }
              if (needsConfirm.length > 0) setPendingActions(needsConfirm)
            } catch { /* skip */ }
            return
          }
        }

        // Stream visible text
        const visible = cleanMarkers(buffer)
        setMessages(prev => prev.map((m, i) =>
          i === prev.length - 1 ? { ...m, content: visible } : m
        ))
      }

      // Finalize last bubble
      setMessages(prev => prev.map((m, i) =>
        i === prev.length - 1 ? { ...m, content: cleanMarkers(buffer), streaming: false } : m
      ))
    } catch {
      setMessages(prev => prev.map((m, i) =>
        i === prev.length - 1 ? { ...m, content: 'Connection failed. Try again.', streaming: false } : m
      ))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, selectedModel, permissions])

  const sendMessage = async (text?: string) => {
    const content = (text ?? input).trim()
    if (!content || loading) return

    let convId = activeConvId
    if (!convId) {
      convId = await createConversation()
      if (!convId) {
        setMessages(prev => prev.map((m, i) => i === prev.length - 1 ? { ...m, content: 'Failed to create conversation. Please check your connection.', streaming: false } : m))
        setLoading(false)
        return
      }
    }

    const userMsg: Message = { role: 'user', content }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    // Snapshot for retry
    lastMsgsRef.current = newMessages
    lastConvIdRef.current = convId

    await runAgentStream(newMessages, convId!)

    // Auto-title after first message
    if (newMessages.length === 1) {
      const title = content.slice(0, 40) + (content.length > 40 ? '...' : '')
      await fetch(`/api/ai/conversations/${convId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      })
      setConversations(prev => prev.map(c => c.id === convId ? { ...c, title } : c))
    }

    setLoading(false)
  }

  // Retry last agent call — self-correction trigger
  const retryLast = async () => {
    if (!lastConvIdRef.current || loading) return
    setLoading(true)
    // Remove last assistant/tool messages back to last user message
    setMessages(prev => {
      const lastUserIdx = [...prev].reverse().findIndex(m => m.role === 'user')
      if (lastUserIdx === -1) return prev
      return prev.slice(0, prev.length - lastUserIdx)
    })
    await runAgentStream(lastMsgsRef.current, lastConvIdRef.current)
    setLoading(false)
  }

  // User approves a pending action → execute → feed result back to agent
  const confirmAction = async (action: PendingAction, alwaysAllow = false) => {
    if (!activeConvId) return
    if (alwaysAllow) {
      // Save always-allow permission to DB
      await fetch('/api/ai/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action_type: action.tool, always_allow: true }),
      }).catch(() => {}) // non-critical, update local state regardless
      setPermissions(prev => [
        ...prev.filter(p => p.action_type !== action.tool),
        { action_type: action.tool, always_allow: true },
      ])
    }

    setPendingActions(prev => prev.filter(a => a.tool !== action.tool))

    const r = await executeAction(action, activeConvId)
    setMessages(prev => [...prev, { role: 'tool', content: `${r.success ? '✓' : '✗'} ${r.result}` }])
    setLoading(true)

    // Agent continues after seeing the result
    await runAgentStream(
      [...messages, { role: 'tool', content: `${r.success ? '✓' : '✗'} ${r.result}` }],
      activeConvId,
      r,
    )
    setLoading(false)
  }

  const rejectAction = (tool: string) => {
    setPendingActions(prev => prev.filter(a => a.tool !== tool))
    const msg: Message = { role: 'tool', content: `✗ Action "${tool}" was denied by user.` }
    setMessages(prev => [...prev, msg])
    // Agent self-corrects after denial
    if (activeConvId) {
      setLoading(true)
      runAgentStream(
        [...messages, msg],
        activeConvId,
        { tool, result: 'User denied this action.', success: false },
      ).then(() => setLoading(false))
    }
  }

  const currentModel = availableModels.find(m => m.id === selectedModel)
  const availableOnly = availableModels.filter(m => m.available)
  const groupedModels = availableModels.reduce((acc, m) => {
    if (!acc[m.provider]) acc[m.provider] = []
    acc[m.provider].push(m)
    return acc
  }, {} as Record<string, typeof availableModels>)

  return (
    <div className="flex h-[calc(100vh-3.5rem)] -mx-8 -my-8">

      {/* ── Sidebar ── */}
      {showSidebar && (
        <div className="w-64 border-r border-gray-200 dark:border-gray-900 flex flex-col bg-white dark:bg-black shrink-0">
          <div className="p-3 border-b border-gray-200 dark:border-gray-900">
            <button
              onClick={createConversation}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" /> New Chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {conversations.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">No conversations yet</p>
            ) : (
              conversations.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => loadConversation(conv.id)}
                  className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    activeConvId === conv.id
                      ? 'bg-gray-100 dark:bg-gray-900'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-950'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="text-xs text-gray-700 dark:text-gray-300 flex-1 truncate">{conv.title}</span>
                  <div className="flex items-center gap-1">
                    {conv.mode === 'agent' && <Zap className="w-3 h-3 text-amber-500" />}
                    <button
                      onClick={e => { e.stopPropagation(); deleteConversation(conv.id) }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-red-500 transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── Main chat area ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-gray-950">

        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-200 dark:border-gray-900 bg-white dark:bg-black">
          <button
            onClick={() => setShowSidebar(s => !s)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
          </button>

          {/* Chat / Agent toggle */}
          <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-900 rounded-lg">
            <button
              onClick={() => setMode('chat')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-colors font-medium ${
                mode === 'chat'
                  ? 'bg-white dark:bg-black text-black dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-black dark:hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" /> Chat
            </button>
            <button
              onClick={() => setMode('agent')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-colors font-medium ${
                mode === 'agent'
                  ? 'bg-white dark:bg-black text-black dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-black dark:hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" /> Agent
            </button>
          </div>

          {/* Model selector */}
          <div className="relative">
            <button
              onClick={() => setShowModelPicker(s => !s)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 dark:border-gray-800 rounded-lg hover:border-gray-400 transition-colors bg-white dark:bg-black"
            >
              <Brain className="w-3.5 h-3.5 text-violet-600" />
              <span className="text-gray-700 dark:text-gray-300">{currentModel?.name ?? 'Select model'}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {showModelPicker && (
              <div className="absolute top-full left-0 mt-1 w-72 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg z-50 overflow-hidden">
                <div className="max-h-80 overflow-y-auto p-2">
                  {Object.entries(groupedModels).map(([provider, models]) => (
                    <div key={provider}>
                      <div className="px-2 py-1 text-xs font-medium text-gray-400 uppercase tracking-wide">{provider}</div>
                      {models.map(m => (
                        <button
                          key={m.id}
                          onClick={() => { setSelectedModel(m.id); setShowModelPicker(false) }}
                          disabled={!m.available}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors ${
                            !m.available ? 'opacity-40 cursor-not-allowed' :
                            selectedModel === m.id
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-950 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {selectedModel === m.id && <Check className="w-3 h-3 text-emerald-600" />}
                            <span className="font-medium">{m.name}</span>
                            <span className="text-gray-400">{m.description}</span>
                          </div>
                          {!m.available && <span className="text-xs text-amber-500 font-medium">Add API key</span>}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex-1" />

          {/* Retry last response */}
          {messages.some(m => m.role === 'assistant') && !loading && (
            <button
              onClick={retryLast}
              title="Retry last response"
              className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          {activeConvId && (
            <button
              onClick={() => { setMessages([]); setActiveConvId(null) }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-black dark:hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          {/* Font size toggle */}
          <button
            onClick={() => setFontSize(s => s === 'sm' ? 'base' : 'sm')}
            className="p-1.5 rounded-lg text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
            title={`Font size: ${fontSize === 'sm' ? 'Normal' : 'Large'} (click to toggle)`}
            aria-label="Toggle font size"
          >
            <span className="text-xs font-bold leading-none">Aa</span>
          </button>

          {/* Search messages */}
          <button
            onClick={() => setShowSearch(s => !s)}
            className={`p-1.5 rounded-lg transition-colors ${showSearch ? 'bg-violet-100 dark:bg-violet-950/50 text-violet-600' : 'text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-900'}`}
            title="Search messages"
            aria-label="Search messages"
          >
            <Sparkles className="w-4 h-4" />
          </button>

          {/* Extensions */}
          <button
            onClick={() => setShowExtensions(s => !s)}
            className={`p-1.5 rounded-lg transition-colors ${
              showExtensions
                ? 'bg-violet-100 dark:bg-violet-950/50 text-violet-600'
                : 'text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-900'
            }`}
            title="Skills & Extensions"
            aria-label="Skills & Extensions"
          >
            <Package className="w-4 h-4" />
          </button>
        </div>

        {/* Active tool indicator */}
        {activeToolName && (
          <div className="flex items-center gap-2 px-4 py-1.5 bg-violet-50 dark:bg-violet-950/20 border-b border-violet-100 dark:border-violet-900/50">
            <span className="text-sm animate-pulse">{TOOL_ICONS[activeToolName] ?? '⚙️'}</span>
            <span className="text-xs text-violet-600 dark:text-violet-400 font-medium">
              Running: {activeToolName.replace(/_/g, ' ')}...
            </span>
            <Loader2 className="w-3 h-3 text-violet-600 animate-spin ml-auto" />
          </div>
        )}

        {/* Search bar */}
        {showSearch && (
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-900 bg-white dark:bg-black">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search messages..."
              className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-600"
              aria-label="Search messages"
              autoFocus
            />
            {searchQuery && (
              <p className="text-xs text-gray-400 mt-1">
                {messages.filter(m => m.content.toLowerCase().includes(searchQuery.toLowerCase())).length} results
              </p>
            )}
          </div>
        )}

        {/* ── Messages ── */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-6">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-emerald-100 dark:from-violet-950/50 dark:to-emerald-950/50 rounded-2xl flex items-center justify-center">
                {mode === 'agent' ? <Zap className="w-8 h-8 text-amber-500" /> : <Sparkles className="w-8 h-8 text-violet-600" />}
              </div>
              <div className="text-center">
                <h2 className="text-lg font-semibold text-black dark:text-white">
                  {mode === 'agent' ? 'Agent Mode' : 'Chat Mode'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
                  {mode === 'agent'
                    ? 'I can take actions: create goals, habits, log savings, and more. Just ask!'
                    : 'Ask me anything about your goals, habits, and progress. Switch to Agent mode to take actions.'}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-2 w-full max-w-md">
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => sendMessage(s)}
                    className="px-4 py-2.5 text-sm text-left border border-gray-200 dark:border-gray-800 rounded-xl hover:border-emerald-400 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors text-gray-600 dark:text-gray-400">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages
              .filter(m => !searchQuery || m.content.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {msg.role !== 'tool' && (
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    msg.role === 'user'
                      ? 'bg-black dark:bg-white'
                      : 'bg-gradient-to-br from-violet-100 to-emerald-100 dark:from-violet-950/50 dark:to-emerald-950/50'
                  }`}>
                    {msg.role === 'user'
                      ? <User className="w-3.5 h-3.5 text-white dark:text-black" />
                      : <Bot className="w-3.5 h-3.5 text-violet-600" />
                    }
                  </div>
                )}
                <div className={`flex flex-col gap-1 max-w-[75%] ${msg.role === 'tool' ? 'w-full' : ''}`}>
                  {msg.role === 'tool' ? (
                    <div className={`px-3 py-2 rounded-lg text-xs font-medium ${
                      msg.content.startsWith('✓')
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900'
                        : msg.content.startsWith('⏳')
                        ? 'bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-800 animate-pulse'
                        : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900'
                    }`}>
                      {msg.content}
                    </div>
                  ) : (
                    <>
                      <div className={`px-4 py-3 rounded-2xl ${fontSize === 'sm' ? 'text-sm' : 'text-base'} leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-black dark:bg-white text-white dark:text-black rounded-tr-sm'
                          : 'bg-white dark:bg-gray-900 text-black dark:text-white border border-gray-200 dark:border-gray-800 rounded-tl-sm'
                      }`}>
                        {msg.content}
                        {msg.streaming && (
                          <span className="inline-block w-1 h-4 bg-violet-600 animate-pulse ml-0.5 align-middle rounded-sm" />
                        )}
                      </div>
                      {msg.role === 'assistant' && !msg.streaming && msg.content && (
                        <div className="flex items-center gap-1 px-1">
                          <CopyButton text={msg.content} />
                          <span className="text-xs text-gray-300 dark:text-gray-700">{msg.content.split(' ').length} words</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* ── Confirmation popups ── */}
        {pendingActions.length > 0 && (
          <div className="px-4 pb-2 space-y-2">
            {pendingActions.map((action, i) => (
              <div key={i} className="border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium uppercase tracking-wide ${AGENT_COLORS[action.agentName] ?? 'text-gray-600'}`}>
                        {action.agentName} agent
                      </span>
                      <span className="text-xs text-gray-500">wants to:</span>
                    </div>
                    <p className="text-sm font-medium text-black dark:text-white">{action.description}</p>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex flex-wrap gap-x-3 gap-y-0.5">
                      {Object.entries(action.params).map(([k, v]) => (
                        <span key={k}><span className="font-medium">{k}:</span> {String(v)}</span>
                      ))}
                    </div>
                    {action.reason && (
                      <p className="text-xs text-gray-400 mt-1 italic">&quot;{action.reason}&quot;</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => confirmAction(action)}
                    disabled={!!executingAction}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-lg transition-colors disabled:opacity-50"
                  >
                    {executingAction === action.tool
                      ? <Loader2 className="w-3 h-3 animate-spin" />
                      : <Check className="w-3 h-3" />}
                    Approve
                  </button>
                  {action.requiresConfirmation === 'always_allow' && (
                    <button
                      onClick={() => confirmAction(action, true)}
                      disabled={!!executingAction}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Zap className="w-3 h-3" /> Always Allow
                    </button>
                  )}
                  <button
                    onClick={() => rejectAction(action.tool)}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-lg hover:border-red-300 hover:text-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" /> Deny
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Input bar ── */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-900 bg-white dark:bg-black">
          {mode === 'agent' && (
            <div className="flex items-center gap-1.5 mb-2">
              <Zap className="w-3 h-3 text-amber-500" />
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                Agent Mode — I can take actions, search the web, and self-correct
              </span>
            </div>
          )}
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
              placeholder={mode === 'agent' ? 'Ask me to create goals, update habits, search the web...' : 'Ask anything about your goals...'}
              rows={1}
              className="flex-1 px-4 py-3 text-sm border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-black text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent resize-none"
              style={{ minHeight: 44, maxHeight: 120 }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="p-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-colors disabled:opacity-40 shrink-0"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1.5 text-center">
            {availableOnly.length} model{availableOnly.length !== 1 ? 's' : ''} available · 100 messages/day · Enter to send · ↺ to retry
          </p>
        </div>
      </div>

      {/* Click outside closes model picker */}
      {showModelPicker && (
        <div className="fixed inset-0 z-40" onClick={() => setShowModelPicker(false)} />
      )}

      {/* ── Extensions panel ── */}
      {showExtensions && (
        <div className="w-96 border-l border-gray-200 dark:border-gray-900 flex flex-col bg-white dark:bg-black shrink-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-900">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-violet-600" />
              <span className="text-sm font-medium text-black dark:text-white">Skills & Extensions</span>
            </div>
            <button
              onClick={() => setShowExtensions(false)}
              className="p-1 rounded-lg text-gray-400 hover:text-black dark:hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 min-h-0">
            <ExtensionsPanel availableModels={availableModels} />
          </div>
        </div>
      )}
    </div>
  )
}
