import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createMilestoneSchema } from '@/lib/validations/milestones'
import { handleApiError, unauthorized, forbidden } from '@/lib/utils/api-errors'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return unauthorized()

    const body = await request.json()
    const validated = createMilestoneSchema.parse(body)

    const { data: goal } = await supabase.from('goals').select('user_id').eq('id', validated.goal_id).single()
    if (!goal || (goal as { user_id: string }).user_id !== user.id) return forbidden('Cannot create milestone for this goal')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('goal_milestones') as any)
      .insert(validated)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ milestone: data }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
