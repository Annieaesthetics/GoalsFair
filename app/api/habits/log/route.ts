import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logHabitSchema } from '@/lib/validations/habits'
import { handleApiError, unauthorized, forbidden } from '@/lib/utils/api-errors'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return unauthorized()

    const body = await request.json()
    const validated = logHabitSchema.parse(body)

    const { data: habit } = await supabase.from('habits').select('user_id').eq('id', validated.habit_id).single()
    if (!habit || (habit as { user_id: string }).user_id !== user.id) return forbidden('Cannot log this habit')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('habit_logs') as any)
      .insert({
        user_id: user.id,
        habit_id: validated.habit_id,
        completed_date: validated.completed_date ?? new Date().toISOString().split('T')[0],
        notes: validated.notes,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ log: data }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
