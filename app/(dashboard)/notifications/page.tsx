import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NotificationsClient } from '@/components/notifications/NotificationsClient'

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rawNotifications } = await supabase
    .from('notifications')
    .select('id, type, title, message, icon, is_read, read_at, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  type NotifRow = { id: string; type: string; title: string; message: string; icon: string; is_read: boolean | null; read_at: string | null; created_at: string | null }

  return <NotificationsClient initialNotifications={(rawNotifications ?? []) as NotifRow[]} />
}
