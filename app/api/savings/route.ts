import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createSavingsTransactionSchema } from '@/lib/validations/savings'
import { handleApiError, unauthorized, forbidden } from '@/lib/utils/api-errors'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return unauthorized()

    const body = await request.json()
    const validated = createSavingsTransactionSchema.parse(body)

    const { data: goal } = await supabase.from('goals').select('user_id, category').eq('id', validated.goal_id).single()
    const g = goal as { user_id: string; category: string } | null

    if (!g || g.user_id !== user.id) return forbidden('Cannot create transaction for this goal')
    if (g.category !== 'financial') return forbidden('Savings transactions only allowed for financial goals')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('savings_transactions') as any)
      .insert({ user_id: user.id, ...validated })
      .select()
      .single()

    if (error) {
      console.error('Savings insert error:', JSON.stringify(error))
      throw error
    }
    return NextResponse.json({ transaction: data }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
