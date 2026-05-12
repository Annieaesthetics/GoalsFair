import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { action_type, always_allow } = await request.json()
  if (!action_type) return NextResponse.json({ error: 'action_type required' }, { status: 400 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('ai_agent_permissions') as any)
    .upsert({ user_id: user.id, action_type, always_allow: always_allow ?? true }, { onConflict: 'user_id,action_type' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('ai_agent_permissions')
    .select('action_type, always_allow')
    .eq('user_id', user.id)

  return NextResponse.json({ permissions: data ?? [] })
}
