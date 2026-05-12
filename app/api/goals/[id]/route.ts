import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateGoalSchema } from '@/lib/validations/goals'
import { handleApiError, unauthorized, notFound } from '@/lib/utils/api-errors'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return unauthorized()

    const { id } = await params
    const { data, error } = await supabase.from('goals').select('*').eq('id', id).eq('user_id', user.id).is('deleted_at', null).single()
    if (error || !data) return notFound('Goal not found')
    return NextResponse.json({ goal: data })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return unauthorized()

    const { id } = await params
    const body = await request.json()
    const validated = updateGoalSchema.parse(body)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('goals') as any)
      .update(validated)
      .eq('id', id)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .select()
      .single()

    if (error || !data) return notFound('Goal not found')
    return NextResponse.json({ goal: data })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return unauthorized()

    const { id } = await params

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('goals') as any)
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .is('deleted_at', null)

    if (error) return notFound('Goal not found')
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
