import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { MCP_REGISTRY } from '@/lib/ai/mcp-registry'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get user's installed MCPs from preferences
  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const installedIds: string[] = (prefs as { installed_mcps?: string[] } | null)?.installed_mcps ?? []

  const registry = MCP_REGISTRY.map(server => ({
    ...server,
    installed: installedIds.includes(server.id),
  }))

  return NextResponse.json({ registry, installed: installedIds })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { serverId, action } = await request.json()
  const server = MCP_REGISTRY.find(s => s.id === serverId)
  if (!server) return NextResponse.json({ error: 'Server not found' }, { status: 404 })

  const { data: prefs } = await supabase.from('user_preferences').select('*').eq('user_id', user.id).single()
  const installedIds: string[] = (prefs as { installed_mcps?: string[] } | null)?.installed_mcps ?? []

  let updated: string[]
  if (action === 'install') {
    updated = [...new Set([...installedIds, serverId])]
  } else {
    updated = installedIds.filter(id => id !== serverId)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('user_preferences') as any)
    .update({ installed_mcps: updated })
    .eq('user_id', user.id)

  return NextResponse.json({ success: true, installed: updated })
}
