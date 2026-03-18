import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createMilestoneSchema } from '@/lib/validations/milestones'
import { handleApiError, unauthorized, forbidden } from '@/lib/utils/api-errors'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return unauthorized()
    }

    const body = await request.json()
    const validated = createMilestoneSchema.parse(body)

    const { data: goal } = await supabase
      .from('goals')
      .select('user_id')
      .eq('id', validated.goal_id)
      .single()

    if (!goal || goal.user_id !== user.id) {
      return forbidden('Cannot create milestone for this goal')
    }

    const { data, error } = await supabase
      .from('goal_milestones')
      .insert(validated)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ milestone: data }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
