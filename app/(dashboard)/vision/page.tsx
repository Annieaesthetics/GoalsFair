import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { VisionBoardClient } from '@/components/vision/VisionBoardClient'

export default async function VisionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rawGoals } = await supabase
    .from('goals')
    .select('id, title, category')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  type GoalRow = { id: string; title: string; category: string }
  const goals = (rawGoals ?? []) as GoalRow[]

  // Fetch images for all goals
  const goalIds = goals.map(g => g.id)
  const { data: rawImages } = goalIds.length > 0
    ? await supabase.from('goal_images').select('id, goal_id, image_url, caption, display_order').in('goal_id', goalIds).order('display_order')
    : { data: [] }

  type ImageRow = { id: string; goal_id: string; image_url: string; caption: string | null; display_order: number }
  const images = (rawImages ?? []) as ImageRow[]

  return (
    <VisionBoardClient
      goals={goals}
      imagesByGoal={images.reduce((acc, img) => {
        if (!acc[img.goal_id]) acc[img.goal_id] = []
        acc[img.goal_id].push(img)
        return acc
      }, {} as Record<string, ImageRow[]>)}
      userId={user.id}
    />
  )
}
