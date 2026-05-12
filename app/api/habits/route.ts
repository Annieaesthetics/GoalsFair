import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createHabitSchema } from '@/lib/validations/habits'
import { handleApiError, unauthorized, forbidden } from '@/lib/utils/api-errors'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return unauthorized()

    const { searchParams } = new URL(request.url)
    const goalId = searchParams.get('goal_id')

    let query = supabase.from('habits').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    if (goalId) query = query.eq('goal_id', goalId)

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ habits: data })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return unauthorized()

    const body = await request.json()
    const validated = createHabitSchema.parse(body)

    // If goal_id provided, verify ownership
    if (validated.goal_id) {
      const { data: goal } = await supabase.from('goals').select('user_id').eq('id', validated.goal_id).single()
      if (!goal || (goal as { user_id: string }).user_id !== user.id) return forbidden('Cannot create habit for this goal')
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('habits') as any)
      .insert({ ...validated, user_id: user.id })
      .select()
      .single()

    if (error) {
      console.error('Habit insert error:', JSON.stringify(error))
      throw error
    }
    return NextResponse.json({ habit: data }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
