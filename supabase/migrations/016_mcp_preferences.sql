-- Add installed_mcps column to user_preferences for MCP extension tracking
ALTER TABLE user_preferences
  ADD COLUMN IF NOT EXISTS installed_mcps text[] DEFAULT '{}';
