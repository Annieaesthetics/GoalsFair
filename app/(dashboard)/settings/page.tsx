import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsClient } from '@/components/settings/SettingsClient'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('full_name, avatar_url, timezone').eq('id', user.id).single()
  const { data: prefs } = await supabase.from('user_preferences').select('theme, email_notifications, push_notifications, weekly_digest').eq('user_id', user.id).single()

  return (
    <SettingsClient
      user={{ id: user.id, email: user.email ?? '' }}
      profile={(profile as { full_name: string | null; avatar_url: string | null; timezone: string } | null) ?? { full_name: null, avatar_url: null, timezone: 'UTC' }}
      preferences={(prefs as { theme: string; email_notifications: boolean; push_notifications: boolean; weekly_digest: boolean } | null) ?? { theme: 'system', email_notifications: true, push_notifications: true, weekly_digest: true }}
    />
  )
}
