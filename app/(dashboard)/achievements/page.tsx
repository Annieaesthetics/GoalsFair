import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Trophy, Lock } from 'lucide-react'

const TIER_COLORS: Record<string, string> = {
  bronze: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900',
  silver: 'text-gray-500 bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800',
  gold: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-900',
  platinum: 'text-violet-600 bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-900',
}

export default async function AchievementsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: allAchievements } = await supabase.from('achievements').select('*').order('tier').order('title')
  const { data: userAchievements } = await supabase.from('user_achievements').select('achievement_id, unlocked_at').eq('user_id', user.id)

  type Achievement = { id: string; title: string; description: string; icon: string; tier: string | null; category: string }
  type UserAchievement = { achievement_id: string; unlocked_at: string }

  const achievements = (allAchievements ?? []) as Achievement[]
  const unlocked = new Set((userAchievements ?? [] as UserAchievement[]).map((u: UserAchievement) => u.achievement_id))
  const unlockedMap = Object.fromEntries((userAchievements ?? [] as UserAchievement[]).map((u: UserAchievement) => [u.achievement_id, u.unlocked_at]))

  const unlockedCount = unlocked.size
  const totalCount = achievements.length

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-black dark:text-white">Achievements</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {unlockedCount}/{totalCount} unlocked
        </p>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="h-2 bg-gray-100 dark:bg-gray-900 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-600 rounded-full transition-all"
            style={{ width: totalCount > 0 ? `${(unlockedCount / totalCount) * 100}%` : '0%' }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>{Math.round(totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0)}% complete</span>
          <span>{totalCount - unlockedCount} remaining</span>
        </div>
      </div>

      {/* Achievements grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map(a => {
          const isUnlocked = unlocked.has(a.id)
          const unlockedAt = unlockedMap[a.id]
          const tierStyle = TIER_COLORS[a.tier ?? 'bronze'] ?? TIER_COLORS.bronze

          return (
            <div
              key={a.id}
              className={`p-4 border rounded-xl transition-all ${
                isUnlocked ? tierStyle : 'border-gray-100 dark:border-gray-900 opacity-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isUnlocked ? 'bg-white/50 dark:bg-black/30' : 'bg-gray-100 dark:bg-gray-900'}`}>
                  {isUnlocked
                    ? <Trophy className="w-5 h-5" />
                    : <Lock className="w-4 h-4 text-gray-400" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-sm font-medium text-black dark:text-white truncate">{a.title}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full capitalize font-medium ${
                      a.tier === 'platinum' ? 'bg-violet-100 dark:bg-violet-900/50 text-violet-600' :
                      a.tier === 'gold' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600' :
                      a.tier === 'silver' ? 'bg-gray-100 dark:bg-gray-800 text-gray-500' :
                      'bg-amber-100 dark:bg-amber-900/50 text-amber-600'
                    }`}>{a.tier}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{a.description}</p>
                  {isUnlocked && unlockedAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      Unlocked {new Date(unlockedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
