import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { handleApiError, unauthorized, forbidden } from '@/lib/utils/api-errors'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return unauthorized()

    const { id } = await params

    const { data: habit } = await supabase.from('habits').select('user_id').eq('id', id).single()
    if (!habit || (habit as { user_id: string }).user_id !== user.id) return forbidden('Access denied')

    const { error } = await supabase.from('habits').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
