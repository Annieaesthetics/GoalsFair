import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logHabitSchema } from '@/lib/validations/habits'
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
    const validated = logHabitSchema.parse(body)

    const { data: habit } = await supabase
      .from('habits')
      .select('user_id')
      .eq('id', validated.habit_id)
      .single()

    if (!habit || habit.user_id !== user.id) {
      return forbidden('Cannot log completion for this habit')
    }

    const { data, error } = await supabase
      .from('habit_logs')
      .insert({
        ...validated,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ log: data }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
