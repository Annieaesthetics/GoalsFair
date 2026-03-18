import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updatePreferencesSchema } from '@/lib/validations/preferences'
import { handleApiError, unauthorized } from '@/lib/utils/api-errors'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return unauthorized()
    }

    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) throw error

    return NextResponse.json({ preferences: data })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return unauthorized()
    }

    const body = await request.json()
    const validated = updatePreferencesSchema.parse(body)

    const { data, error } = await supabase
      .from('user_preferences')
      .update(validated)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ preferences: data })
  } catch (error) {
    return handleApiError(error)
  }
}
