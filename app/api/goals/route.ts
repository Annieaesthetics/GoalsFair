import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createGoalSchema } from '@/lib/validations/goals'
import { handleApiError, unauthorized } from '@/lib/utils/api-errors'
import { rateLimit } from '@/lib/utils/rate-limit'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return unauthorized()
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const status = searchParams.get('status')

    let query = supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (category) {
      query = query.eq('category', category)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ goals: data })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return unauthorized()
    }

    const { success, remaining, reset } = await rateLimit(`goals:${user.id}`, 20, 60)
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': reset.toString() } }
      )
    }

    const body = await request.json()
    const validated = createGoalSchema.parse(body)

    const { data, error } = await supabase
      .from('goals')
      .insert({
        user_id: user.id,
        ...validated,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ goal: data }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
