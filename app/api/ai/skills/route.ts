import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { listSkills, saveSkill } from '@/lib/ai/skills'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({ skills: listSkills() })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, content } = await request.json()
  if (!name || !content) return NextResponse.json({ error: 'name and content required' }, { status: 400 })

  const safeName = name.replace(/[^a-z0-9_-]/gi, '_').toLowerCase()
  saveSkill(safeName, content)
  return NextResponse.json({ success: true, name: safeName })
}
