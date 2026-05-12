-- Migration 015: AI Agent System
-- Chat conversations and messages with persistent history

CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Conversation',
  mode TEXT DEFAULT 'chat' CHECK (mode IN ('chat', 'agent')),
  model TEXT DEFAULT 'groq/llama-3.3-70b-versatile',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
  content TEXT NOT NULL,
  tool_call JSONB,        -- agent action that was taken
  tool_result JSONB,      -- result of the action
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent memory: AI remembers facts about the user across sessions
CREATE TABLE ai_agent_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  memory_key TEXT NOT NULL,
  memory_value TEXT NOT NULL,
  source TEXT DEFAULT 'user',  -- 'user' | 'agent' | 'inferred'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, memory_key)
);

-- Agent permissions: "always allow" for specific action types
CREATE TABLE ai_agent_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,  -- 'create_goal', 'create_habit', 'create_milestone', etc.
  always_allow BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, action_type)
);

-- Indexes
CREATE INDEX idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_updated ON ai_conversations(updated_at DESC);
CREATE INDEX idx_ai_messages_conversation_id ON ai_messages(conversation_id);
CREATE INDEX idx_ai_messages_created ON ai_messages(created_at);
CREATE INDEX idx_ai_agent_memory_user_id ON ai_agent_memory(user_id);
CREATE INDEX idx_ai_agent_permissions_user_id ON ai_agent_permissions(user_id);

-- Triggers
CREATE TRIGGER update_ai_conversations_updated_at
  BEFORE UPDATE ON ai_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_agent_memory_updated_at
  BEFORE UPDATE ON ai_agent_memory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own conversations" ON ai_conversations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own messages" ON ai_messages FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own memory" ON ai_agent_memory FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own permissions" ON ai_agent_permissions FOR ALL USING (auth.uid() = user_id);

COMMENT ON TABLE ai_conversations IS 'AI chat sessions with history';
COMMENT ON TABLE ai_messages IS 'Individual messages in AI conversations';
COMMENT ON TABLE ai_agent_memory IS 'Persistent AI memory about the user';
COMMENT ON TABLE ai_agent_permissions IS 'User-granted always-allow permissions for agent actions';
