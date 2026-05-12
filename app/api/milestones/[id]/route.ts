import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateMilestoneSchema } from '@/lib/validations/milestones'
import { handleApiError, unauthorized, notFound, forbidden } from '@/lib/utils/api-errors'

async function verifyOwnership(supabase: Awaited<ReturnType<typeof createClient>>, milestoneId: string, userId: string) {
  const { data: milestone } = await supabase.from('goal_milestones').select('goal_id').eq('id', milestoneId).single()
  if (!milestone) return null
  const { data: goal } = await supabase.from('goals').select('user_id').eq('id', (milestone as { goal_id: string }).goal_id).single()
  if (!goal || (goal as { user_id: string }).user_id !== userId) return null
  return milestone
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return unauthorized()

    const { id } = await params
    const milestone = await verifyOwnership(supabase, id, user.id)
    if (!milestone) return forbidden('Access denied')

    const body = await request.json()
    const validated = updateMilestoneSchema.parse(body)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('goal_milestones') as any).update(validated).eq('id', id).select().single()
    if (error || !data) return notFound('Milestone not found')
    return NextResponse.json({ milestone: data })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return unauthorized()

    const { id } = await params
    const milestone = await verifyOwnership(supabase, id, user.id)
    if (!milestone) return forbidden('Access denied')

    const { error } = await supabase.from('goal_milestones').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
