'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Puzzle, BookOpen, Search, Download, Trash2, ExternalLink,
  Check, Plus, Edit2, Save, X, Loader2, Key, RefreshCw,
  ChevronDown, ChevronRight, Globe, Zap,
} from 'lucide-react'
import type { ModelProvider } from '@/lib/ai/models'
import { MCP_CATEGORIES } from '@/lib/ai/mcp-registry'

type MCPServer = {
  id: string
  name: string
  description: string
  url: string
  category: string
  tools: string[]
  installed: boolean
  configRequired?: string[]
}

type Skill = {
  name: string
  isBase: boolean
  size: number
  lastModified: string
}

type Tab = 'mcp' | 'skills' | 'search'

interface ExtensionsPanelProps {
  availableModels: (ModelProvider & { available: boolean })[]
}

export function ExtensionsPanel({ availableModels: _availableModels }: ExtensionsPanelProps) {
  const [tab, setTab] = useState<Tab>('mcp')

  // MCP state
  const [registry, setRegistry] = useState<MCPServer[]>([])
  const [mcpLoading, setMcpLoading] = useState(true)
  const [mcpWorking, setMcpWorking] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>('All')

  // Skills state
  const [skills, setSkills] = useState<Skill[]>([])
  const [skillsLoading, setSkillsLoading] = useState(false)
  const [editingSkill, setEditingSkill] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [savingSkill, setSavingSkill] = useState(false)
  const [newSkillName, setNewSkillName] = useState('')
  const [showNewSkill, setShowNewSkill] = useState(false)
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{ title: string; url: string; snippet: string }[]>([])
  const [searching, setSearching] = useState(false)
  const [searchSource, setSearchSource] = useState('')

  const loadMCP = useCallback(async () => {
    setMcpLoading(true)
    try {
      const res = await fetch('/api/ai/mcp')
      const data = await res.json()
      setRegistry(data.registry ?? [])
    } catch { /* ignore */ }
    setMcpLoading(false)
  }, [])

  const loadSkills = useCallback(async () => {
    setSkillsLoading(true)
    try {
      const res = await fetch('/api/ai/skills')
      const data = await res.json()
      setSkills(data.skills ?? [])
    } catch { /* ignore */ }
    setSkillsLoading(false)
  }, [])

  useEffect(() => { loadMCP() }, [loadMCP])
  useEffect(() => { if (tab === 'skills') loadSkills() }, [tab, loadSkills])

  const toggleMCP = async (server: MCPServer) => {
    setMcpWorking(server.id)
    try {
      await fetch('/api/ai/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serverId: server.id, action: server.installed ? 'uninstall' : 'install' }),
      })
      setRegistry(prev => prev.map(s => s.id === server.id ? { ...s, installed: !s.installed } : s))
    } catch { /* ignore */ }
    setMcpWorking(null)
  }

  const openEditSkill = async (name: string) => {
    setEditingSkill(name)
    try {
      const res = await fetch(`/api/ai/skills/${name}`)
      const data = await res.json()
      setEditContent(data.content ?? '')
    } catch { setEditContent('') }
  }

  const saveSkill = async (name: string) => {
    setSavingSkill(true)
    try {
      await fetch(`/api/ai/skills/${name}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent }),
      })
      setEditingSkill(null)
      loadSkills()
    } catch { /* ignore */ }
    setSavingSkill(false)
  }

  const deleteSkill = async (name: string) => {
    if (!confirm(`Delete skill "${name}"? This cannot be undone.`)) return
    await fetch(`/api/ai/skills/${name}`, { method: 'DELETE' })
    loadSkills()
  }

  const createSkill = async () => {
    if (!newSkillName.trim()) return
    setSavingSkill(true)
    try {
      await fetch('/api/ai/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSkillName.trim(), content: `# ${newSkillName}\n\n## Overview\nCustom skill for the agent.\n\n## Instructions\n(Add your instructions here)\n` }),
      })
      setNewSkillName('')
      setShowNewSkill(false)
      loadSkills()
    } catch { /* ignore */ }
    setSavingSkill(false)
  }

  const runSearch = async () => {
    if (!searchQuery.trim()) return
    setSearching(true)
    try {
      const res = await fetch('/api/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      })
      const data = await res.json()
      setSearchResults(data.results ?? [])
      setSearchSource(data.source ?? '')
    } catch { setSearchResults([]) }
    setSearching(false)
  }

  const filteredRegistry = activeCategory === 'All'
    ? registry
    : registry.filter(s => s.category === activeCategory)

  const installedCount = registry.filter(s => s.installed).length

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-900 shrink-0">
        {([
          { id: 'mcp', label: 'Extensions', icon: Puzzle },
          { id: 'skills', label: 'Skills', icon: BookOpen },
          { id: 'search', label: 'Web Search', icon: Globe },
        ] as { id: Tab; label: string; icon: React.ElementType }[]).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
              tab === id
                ? 'border-violet-600 text-violet-600'
                : 'border-transparent text-gray-500 hover:text-black dark:hover:text-white'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
            {id === 'mcp' && installedCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.5 bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-400 rounded-full text-[10px] font-semibold">
                {installedCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">

        {/* ── MCP TAB ── */}
        {tab === 'mcp' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Connect MCP servers to give the agent real-world capabilities.
              </p>
              <button onClick={loadMCP} className="p-1 text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Category filter */}
            <div className="flex flex-wrap gap-1.5">
              {['All', ...MCP_CATEGORIES].map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
                    activeCategory === cat
                      ? 'bg-violet-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {mcpLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="space-y-2">
                {filteredRegistry.map(server => (
                  <div
                    key={server.id}
                    className={`border rounded-xl p-3 transition-colors ${
                      server.installed
                        ? 'border-violet-200 dark:border-violet-900 bg-violet-50 dark:bg-violet-950/20'
                        : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-black'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        server.installed ? 'bg-violet-100 dark:bg-violet-900/50' : 'bg-gray-100 dark:bg-gray-900'
                      }`}>
                        <Puzzle className={`w-4 h-4 ${server.installed ? 'text-violet-600' : 'text-gray-400'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-black dark:text-white">{server.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-900 text-gray-500 rounded-full">{server.category}</span>
                          {server.installed && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 rounded-full flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5" /> Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{server.description}</p>

                        {/* Tools list */}
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {server.tools.map(t => (
                            <span key={t} className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 rounded font-mono">
                              {t}
                            </span>
                          ))}
                        </div>

                        {/* Config required */}
                        {server.configRequired && server.configRequired.length > 0 && (
                          <div className="flex items-center gap-1 mt-1.5">
                            <Key className="w-3 h-3 text-amber-500" />
                            <span className="text-[10px] text-amber-600 dark:text-amber-400">
                              Requires: {server.configRequired.join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => toggleMCP(server)}
                        disabled={mcpWorking === server.id}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors disabled:opacity-50 ${
                          server.installed
                            ? 'border border-red-200 dark:border-red-900 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30'
                            : 'bg-violet-600 hover:bg-violet-700 text-white'
                        }`}
                      >
                        {mcpWorking === server.id
                          ? <Loader2 className="w-3 h-3 animate-spin" />
                          : server.installed
                            ? <><Trash2 className="w-3 h-3" /> Uninstall</>
                            : <><Download className="w-3 h-3" /> Install</>
                        }
                      </button>
                      <a
                        href={server.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2 py-1.5 text-xs text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" /> Docs
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Link to MCP registry */}
            <a
              href="https://github.com/modelcontextprotocol/servers"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-xs text-gray-500 hover:text-violet-600 hover:border-violet-400 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Browse full MCP registry on GitHub
            </a>
          </div>
        )}

        {/* ── SKILLS TAB ── */}
        {tab === 'skills' && (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Skills define the agent&apos;s personality, reasoning, and behavior. Edit base skills or add custom ones.
              </p>
              <button
                onClick={() => setShowNewSkill(s => !s)}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs rounded-lg transition-colors shrink-0"
              >
                <Plus className="w-3 h-3" /> New
              </button>
            </div>

            {/* New skill form */}
            {showNewSkill && (
              <div className="border border-violet-200 dark:border-violet-900 rounded-xl p-3 bg-violet-50 dark:bg-violet-950/20 space-y-2">
                <p className="text-xs font-medium text-violet-700 dark:text-violet-400">Create custom skill</p>
                <div className="flex gap-2">
                  <input
                    value={newSkillName}
                    onChange={e => setNewSkillName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') createSkill() }}
                    placeholder="skill-name (e.g. coding, finance)"
                    className="flex-1 px-3 py-1.5 text-xs border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-600"
                  />
                  <button
                    onClick={createSkill}
                    disabled={savingSkill || !newSkillName.trim()}
                    className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs rounded-lg disabled:opacity-50 transition-colors"
                  >
                    {savingSkill ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Create'}
                  </button>
                </div>
              </div>
            )}

            {skillsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="space-y-1.5">
                {skills.map(skill => (
                  <div key={skill.name} className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                    {/* Skill header */}
                    <div
                      className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-950 transition-colors"
                      onClick={() => setExpandedSkill(expandedSkill === skill.name ? null : skill.name)}
                    >
                      {expandedSkill === skill.name
                        ? <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        : <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      }
                      <span className="text-sm font-medium text-black dark:text-white flex-1">{skill.name}</span>
                      <div className="flex items-center gap-1.5">
                        {skill.isBase ? (
                          <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 rounded-full">base</span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.5 bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-400 rounded-full">custom</span>
                        )}
                        <span className="text-[10px] text-gray-400">{(skill.size / 1024).toFixed(1)}kb</span>
                        <button
                          onClick={e => { e.stopPropagation(); openEditSkill(skill.name) }}
                          className="p-1 text-gray-400 hover:text-violet-600 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        {!skill.isBase && (
                          <button
                            onClick={e => { e.stopPropagation(); deleteSkill(skill.name) }}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Inline editor */}
                    {editingSkill === skill.name && (
                      <div className="border-t border-gray-200 dark:border-gray-800 p-3 space-y-2 bg-gray-50 dark:bg-gray-950">
                        <textarea
                          value={editContent}
                          onChange={e => setEditContent(e.target.value)}
                          className="w-full h-48 px-3 py-2 text-xs font-mono border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-600 resize-none"
                          spellCheck={false}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveSkill(skill.name)}
                            disabled={savingSkill}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-lg disabled:opacity-50 transition-colors"
                          >
                            {savingSkill ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                            Save
                          </button>
                          <button
                            onClick={() => setEditingSkill(null)}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-lg hover:border-gray-400 transition-colors"
                          >
                            <X className="w-3 h-3" /> Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── WEB SEARCH TAB ── */}
        {tab === 'search' && (
          <div className="p-4 space-y-4">
            <div className="space-y-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Test web search directly. The agent uses this in research and planning tasks.
              </p>
              <div className="flex items-center gap-1.5 text-xs">
                <div className={`w-2 h-2 rounded-full ${process.env.NEXT_PUBLIC_HAS_BRAVE ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                <span className="text-gray-500">
                  {searchSource === 'brave' ? 'Brave Search (active)' : 'DuckDuckGo fallback'}
                </span>
              </div>
            </div>

            {/* Search input */}
            <div className="flex gap-2">
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') runSearch() }}
                placeholder="Search the web..."
                className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-black text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-600"
              />
              <button
                onClick={runSearch}
                disabled={searching || !searchQuery.trim()}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm rounded-xl disabled:opacity-40 transition-colors"
              >
                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </button>
            </div>

            {/* Results */}
            {searchResults.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Zap className="w-3 h-3" />
                  {searchResults.length} results via {searchSource}
                </div>
                {searchResults.map((r, i) => (
                  <a
                    key={i}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block border border-gray-200 dark:border-gray-800 rounded-xl p-3 hover:border-violet-400 dark:hover:border-violet-700 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-black dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-1">
                        {r.title}
                      </p>
                      <ExternalLink className="w-3 h-3 text-gray-400 shrink-0 mt-0.5" />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{r.snippet}</p>
                    <p className="text-[10px] text-gray-400 mt-1 truncate">{r.url}</p>
                  </a>
                ))}
              </div>
            )}

            {searchResults.length === 0 && !searching && searchQuery && (
              <p className="text-xs text-gray-400 text-center py-4">No results found</p>
            )}

            {/* Agent search info */}
            <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-3 space-y-1.5">
              <p className="text-xs font-medium text-black dark:text-white">How the agent uses search</p>
              <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <li>• Researcher agent searches for strategies and best practices</li>
                <li>• Planner agent validates plans with real-world data</li>
                <li>• Action agent can search before executing tasks</li>
                <li>• Add <code className="px-1 bg-gray-100 dark:bg-gray-900 rounded">BRAVE_API_KEY</code> to .env.local for better results</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
