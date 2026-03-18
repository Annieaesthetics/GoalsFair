import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateMilestoneSchema } from '@/lib/validations/milestones'
import { handleApiError, unauthorized, notFound } from '@/lib/utils/api-errors'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return unauthorized()
    }

    const { id } = await params
    const body = await request.json()
    const validated = updateMilestoneSchema.parse(body)

    const { data, error } = await supabase
      .from('goal_milestones')
      .update(validated)
      .eq('id', id)
      .select('*, goals!inner(user_id)')
      .single()

    if (error || !data || data.goals.user_id !== user.id) {
      return notFound('Milestone not found')
    }

    return NextResponse.json({ milestone: data })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return unauthorized()
    }

    const { id } = await params

    const { data: milestone } = await supabase
      .from('goal_milestones')
      .select('*, goals!inner(user_id)')
      .eq('id', id)
      .single()

    if (!milestone || milestone.goals.user_id !== user.id) {
      return notFound('Milestone not found')
    }

    const { error } = await supabase.from('goal_milestones').delete().eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
