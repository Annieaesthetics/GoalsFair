import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { handleApiError, unauthorized } from '@/lib/utils/api-errors'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return unauthorized()

    const unreadOnly = new URL(request.url).searchParams.get('unread') === 'true'
    let query = supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50)
    if (unreadOnly) query = query.eq('is_read', false)

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ notifications: data })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return unauthorized()

    const { notification_id, mark_all } = await request.json()
    const now = new Date().toISOString()

    if (mark_all) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('notifications') as any).update({ is_read: true, read_at: now }).eq('user_id', user.id).eq('is_read', false)
      if (error) throw error
      return NextResponse.json({ success: true })
    }

    if (!notification_id) return NextResponse.json({ error: 'notification_id required' }, { status: 400 })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('notifications') as any).update({ is_read: true, read_at: now }).eq('id', notification_id).eq('user_id', user.id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
