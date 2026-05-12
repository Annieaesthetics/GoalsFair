import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { loadSkill, saveSkill, deleteSkill } from '@/lib/ai/skills'

export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name } = await params
  const content = loadSkill(name)
  if (!content) return NextResponse.json({ error: 'Skill not found' }, { status: 404 })
  return NextResponse.json({ name, content })
}

export async function PUT(request: Request, { params }: { params: Promise<{ name: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name } = await params
  const { content } = await request.json()
  if (!content) return NextResponse.json({ error: 'content required' }, { status: 400 })

  saveSkill(name, content)
  return NextResponse.json({ success: true })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name } = await params
  const deleted = deleteSkill(name)
  if (!deleted) return NextResponse.json({ error: 'Cannot delete base skill or skill not found' }, { status: 400 })
  return NextResponse.json({ success: true })
}
