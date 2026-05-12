'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Bell, Palette, LogOut, Save, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface SettingsClientProps {
  user: { id: string; email: string }
  profile: { full_name: string | null; avatar_url: string | null; timezone: string }
  preferences: { theme: string; email_notifications: boolean; push_notifications: boolean; weekly_digest: boolean }
}

const TIMEZONES = ['UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Asia/Shanghai', 'Australia/Sydney']

export function SettingsClient({ user, profile, preferences }: SettingsClientProps) {
  const router = useRouter()
  const [fullName, setFullName] = useState(profile.full_name ?? '')
  const [timezone, setTimezone] = useState(profile.timezone ?? 'UTC')
  const [theme, setTheme] = useState(preferences.theme)
  const [emailNotifs, setEmailNotifs] = useState(preferences.email_notifications)
  const [weeklyDigest, setWeeklyDigest] = useState(preferences.weekly_digest)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()

    await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from('profiles') as any).update({ full_name: fullName, timezone }).eq('id', user.id),
      fetch('/api/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, email_notifications: emailNotifs, weekly_digest: weeklyDigest }),
      }),
    ])

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    router.refresh()
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!value)}
      className={`w-10 h-6 rounded-full transition-colors relative ${value ? 'bg-emerald-600' : 'bg-gray-200 dark:bg-gray-800'}`}
    >
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${value ? 'translate-x-5' : 'translate-x-1'}`} />
    </button>
  )

  const Section = ({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-gray-400" />
        <h2 className="text-sm font-medium text-black dark:text-white">{title}</h2>
      </div>
      <div className="space-y-3 pl-6">{children}</div>
    </div>
  )

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-black dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{user.email}</p>
      </div>

      <Section icon={User} title="Profile">
        <div>
          <label className="block text-xs font-medium text-black dark:text-white mb-1.5">Full name</label>
          <input
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-black dark:text-white mb-1.5">Timezone</label>
          <select
            value={timezone}
            onChange={e => setTimezone(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
          </select>
        </div>
      </Section>

      <div className="border-t border-gray-100 dark:border-gray-900" />

      <Section icon={Palette} title="Appearance">
        <div className="flex gap-2">
          {(['light', 'dark', 'system'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`flex-1 py-2 text-xs rounded-lg border transition-colors capitalize ${
                theme === t
                  ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white font-medium'
                  : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-400'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </Section>

      <div className="border-t border-gray-100 dark:border-gray-900" />

      <Section icon={Bell} title="Notifications">
        {[
          { label: 'Email notifications', desc: 'Goal reminders and updates', value: emailNotifs, onChange: setEmailNotifs },
          { label: 'Weekly digest', desc: 'Summary of your weekly progress', value: weeklyDigest, onChange: setWeeklyDigest },
        ].map(({ label, desc, value, onChange }) => (
          <div key={label} className="flex items-center justify-between">
            <div>
              <div className="text-sm text-black dark:text-white">{label}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{desc}</div>
            </div>
            <Toggle value={value} onChange={onChange} />
          </div>
        ))}
      </Section>

      <div className="border-t border-gray-100 dark:border-gray-900" />

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleSignOut}
          className="inline-flex items-center gap-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-full hover:opacity-80 transition-opacity disabled:opacity-50"
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}
