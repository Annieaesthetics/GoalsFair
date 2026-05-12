'use client'

import { useState, useEffect } from 'react'
import { FileText, Plus, Save, Trash2, Package, ExternalLink, Check, X, Loader2, Globe, Zap } from 'lucide-react'
import type { MCPServer } from '@/lib/ai/mcp-registry'
import type { ModelProvider } from '@/lib/ai/models'

type Skill = { name: string; isBase: boolean; size: number; lastModified: string }

interface ExtensionsPanelProps {
  availableModels: (ModelProvider & { available: boolean })[]
}

export function ExtensionsPanel({ availableModels }: ExtensionsPanelProps) {
  const [tab, setTab] = useState<'skills' | 'mcp' | 'models'>('skills')
  const [skills, setSkills] = useState<Skill[]>([])
  const [mcpRegistry, setMcpRegistry] = useState<MCPServer[]>([])
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)
  const [skillContent, setSkillContent] = useState('')
  const [newSkillName, setNewSkillName] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mcpFilter, setMcpFilter] = useState('All')

  useEffect(() => {
    if (tab === 'skills') loadSkills()
    if (tab === 'mcp') loadMCP()
  }, [tab])

  const loadSkills = async () => {
    setLoading(true)
    const res = await fetch('/api/ai/skills')
    const data = await res.json()
    setSkills(data.skills ?? [])
    setLoading(false)
  }

  const loadMCP = async () => {
    setLoading(true)
    const res = await fetch('/api/ai/mcp')
    const data = await res.json()
    setMcpRegistry(data.registry ?? [])
    setLoading(false)
  }

  const openSkill = async (name: string) => {
    setSelectedSkill(name)
    const res = await fetch(`/api/ai/skills/${name}`)
    const data = await res.json()
    setSkillContent(data.content ?? '')
  }

  const saveSkill = async () => {
    if (!selectedSkill) return
    setSaving(true)
    await fetch(`/api/ai/skills/${selectedSkill}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: skillContent }),
    })
    setSaving(false)
    loadSkills()
  }

  const createSkill = async () => {
    if (!newSkillName.trim()) return
    const name = newSkillName.trim().toLowerCase().replace(/\s+/g, '_')
    await fetch('/api/ai/skills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, content: `# ${newSkillName}\n\n## Overview\nCustom skill for the AI agent.\n\n## Instructions\n(Add your instructions here)\n` }),
    })
    setNewSkillName('')
    loadSkills()
    openSkill(name)
  }

  const deleteSkill = async (name: string) => {
    if (!confirm(`Delete skill "${name}"?`)) return
    await fetch(`/api/ai/skills/${name}`, { method: 'DELETE' })
    if (selectedSkill === name) { setSelectedSkill(null); setSkillContent('') }
    loadSkills()
  }

  const toggleMCP = async (serverId: string, installed: boolean) => {
    await fetch('/api/ai/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serverId, action: installed ? 'uninstall' : 'install' }),
    })
    loadMCP()
  }

  const categories = ['All', ...new Set(mcpRegistry.map(s => s.category))]
  const filteredMCP = mcpFilter === 'All' ? mcpRegistry : mcpRegistry.filter(s => s.category === mcpFilter)

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex border-b border-gray-200 dark:border-gray-900 shrink-0">
        {[
          { id: 'skills', label: 'Skills', icon: FileText },
          { id: 'mcp', label: 'Extensions', icon: Package },
          { id: 'models', label: 'Models', icon: Zap },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id as typeof tab)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
              tab === id
                ? 'border-violet-600 text-violet-600'
                : 'border-transparent text-gray-500 hover:text-black dark:hover:text-white'
            }`}
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* Skills Tab */}
      {tab === 'skills' && (
        <div className="flex flex-1 min-h-0">
          {/* Skill list */}
          <div className="w-48 border-r border-gray-200 dark:border-gray-900 flex flex-col shrink-0">
            <div className="p-2 border-b border-gray-100 dark:border-gray-900">
              <div className="flex gap-1">
                <input
                  type="text"
                  value={newSkillName}
                  onChange={e => setNewSkillName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && createSkill()}
                  placeholder="New skill name..."
                  className="flex-1 px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-violet-600"
                />
                <button onClick={createSkill} disabled={!newSkillName.trim()} className="p-1.5 bg-violet-600 text-white rounded-lg disabled:opacity-40 hover:bg-violet-700 transition-colors">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-1 space-y-0.5">
              {loading ? (
                <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-gray-400" /></div>
              ) : (
                skills.map(skill => (
                  <div
                    key={skill.name}
                    onClick={() => openSkill(skill.name)}
                    className={`group flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
                      selectedSkill === skill.name
                        ? 'bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-950 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <FileText className="w-3 h-3 shrink-0" />
                    <span className="text-xs flex-1 truncate">{skill.name}</span>
                    {skill.isBase ? (
                      <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100">base</span>
                    ) : (
                      <button
                        onClick={e => { e.stopPropagation(); deleteSkill(skill.name) }}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Skill editor */}
          <div className="flex-1 flex flex-col min-w-0">
            {selectedSkill ? (
              <>
                <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-gray-900 shrink-0">
                  <span className="text-xs font-medium text-black dark:text-white">{selectedSkill}.md</span>
                  <button
                    onClick={saveSkill}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs rounded-lg transition-colors disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                    Save
                  </button>
                </div>
                <textarea
                  value={skillContent}
                  onChange={e => setSkillContent(e.target.value)}
                  className="flex-1 p-3 text-xs font-mono bg-white dark:bg-black text-black dark:text-white resize-none focus:outline-none border-0"
                  placeholder="Write skill instructions in Markdown..."
                />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <FileText className="w-8 h-8 text-gray-300 dark:text-gray-700 mb-2" />
                <p className="text-xs text-gray-500 dark:text-gray-400">Select a skill to edit</p>
                <p className="text-xs text-gray-400 mt-1">Skills define the agent's personality and capabilities</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MCP Extensions Tab */}
      {tab === 'mcp' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Install MCP servers to extend agent capabilities
            </p>
            <a href="https://github.com/modelcontextprotocol/servers" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-violet-600 hover:underline">
              <Globe className="w-3 h-3" /> MCP Registry <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map(cat => (
              <button key={cat} onClick={() => setMcpFilter(cat)}
                className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                  mcpFilter === cat
                    ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                    : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-400'
                }`}>
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
          ) : (
            <div className="space-y-2">
              {filteredMCP.map(server => (
                <div key={server.id} className={`p-3 border rounded-xl transition-colors ${
                  server.installed
                    ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20'
                    : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                }`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium text-black dark:text-white">{server.name}</span>
                        <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-900 text-gray-500 rounded-full">{server.category}</span>
                        {server.installed && <span className="text-xs text-emerald-600 font-medium">Installed</span>}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{server.description}</p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {server.tools.map(t => (
                          <span key={t} className="text-xs px-1.5 py-0.5 bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 rounded">
                            {t}
                          </span>
                        ))}
                      </div>
                      {server.configRequired && !server.installed && (
                        <p className="text-xs text-amber-600 mt-1">
                          Requires: {server.configRequired.join(', ')} in .env.local
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a href={server.url} target="_blank" rel="noopener noreferrer"
                        className="p-1.5 text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => toggleMCP(server.id, server.installed)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                          server.installed
                            ? 'bg-red-50 dark:bg-red-950/30 text-red-600 border border-red-200 dark:border-red-900 hover:bg-red-100'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        {server.installed ? <><X className="w-3 h-3" /> Remove</> : <><Plus className="w-3 h-3" /> Install</>}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Models Tab */}
      {tab === 'models' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Add API keys to .env.local to enable models
          </p>
          {Object.entries(
            availableModels.reduce((acc, m) => {
              if (!acc[m.provider]) acc[m.provider] = []
              acc[m.provider].push(m)
              return acc
            }, {} as Record<string, typeof availableModels>)
          ).map(([provider, models]) => (
            <div key={provider} className="space-y-1">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide px-1">{provider}</div>
              {models.map(m => (
                <div key={m.id} className={`flex items-center justify-between p-3 border rounded-xl ${
                  m.available
                    ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20'
                    : 'border-gray-200 dark:border-gray-800 opacity-60'
                }`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-black dark:text-white">{m.name}</span>
                      {m.supportsTools && <span className="text-xs px-1.5 py-0.5 bg-violet-50 dark:bg-violet-950/30 text-violet-600 rounded">tools</span>}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{m.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {m.available
                      ? <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium"><Check className="w-3 h-3" /> Active</span>
                      : <span className="text-xs text-amber-500 font-medium">Add {m.envKey}</span>
                    }
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
