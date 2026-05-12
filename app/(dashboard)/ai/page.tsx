import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AIAgentClient } from '@/components/ai/agent/AIAgentClient'
import { getAvailableModels } from '@/lib/ai/models'

export default async function AIPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: conversations } = await supabase
    .from('ai_conversations')
    .select('id, title, mode, model, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(50)

  const { data: permissions } = await supabase
    .from('ai_agent_permissions')
    .select('action_type, always_allow')
    .eq('user_id', user.id)

  const availableModels = getAvailableModels()

  return (
    <AIAgentClient
      initialConversations={(conversations ?? []) as any[]}
      initialPermissions={(permissions ?? []) as any[]}
      availableModels={availableModels}
      userId={user.id}
    />
  )
}
