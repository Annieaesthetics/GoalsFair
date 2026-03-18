-- Migration 013: Row Level Security (RLS) policies
-- Description: Enable RLS and create policies for all user-facing tables

-- Enable RLS on all user tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_tag_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_projections ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_completion_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_board_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- User preferences policies
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Goals policies
CREATE POLICY "Users can view own goals" ON goals
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert own goals" ON goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON goals
  FOR DELETE USING (auth.uid() = user_id);

-- Goal images policies
CREATE POLICY "Users can view goal images" ON goal_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM goals 
      WHERE goals.id = goal_images.goal_id 
      AND (goals.user_id = auth.uid() OR goals.is_public = true)
    )
  );

CREATE POLICY "Users can insert own goal images" ON goal_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM goals 
      WHERE goals.id = goal_images.goal_id 
      AND goals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own goal images" ON goal_images
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM goals 
      WHERE goals.id = goal_images.goal_id 
      AND goals.user_id = auth.uid()
    )
  );

-- Goal tags policies (public read, authenticated write)
CREATE POLICY "Anyone can view tags" ON goal_tags
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create tags" ON goal_tags
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Goal tag relations policies
CREATE POLICY "Users can view tag relations" ON goal_tag_relations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM goals 
      WHERE goals.id = goal_tag_relations.goal_id 
      AND (goals.user_id = auth.uid() OR goals.is_public = true)
    )
  );

CREATE POLICY "Users can manage own goal tags" ON goal_tag_relations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM goals 
      WHERE goals.id = goal_tag_relations.goal_id 
      AND goals.user_id = auth.uid()
    )
  );

-- Milestones policies
CREATE POLICY "Users can view milestones" ON goal_milestones
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM goals 
      WHERE goals.id = goal_milestones.goal_id 
      AND (goals.user_id = auth.uid() OR goals.is_public = true)
    )
  );

CREATE POLICY "Users can manage own milestones" ON goal_milestones
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM goals 
      WHERE goals.id = goal_milestones.goal_id 
      AND goals.user_id = auth.uid()
    )
  );

-- Savings transactions policies
CREATE POLICY "Users can view own transactions" ON savings_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM goals 
      WHERE goals.id = savings_transactions.goal_id 
      AND goals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own transactions" ON savings_transactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM goals 
      WHERE goals.id = savings_transactions.goal_id 
      AND goals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own transactions" ON savings_transactions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM goals 
      WHERE goals.id = savings_transactions.goal_id 
      AND goals.user_id = auth.uid()
    )
  );

-- Financial projections policies
CREATE POLICY "Users can view own projections" ON financial_projections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM goals 
      WHERE goals.id = financial_projections.goal_id 
      AND goals.user_id = auth.uid()
    )
  );

-- Habits policies
CREATE POLICY "Users can view own habits" ON habits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habits" ON habits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habits" ON habits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own habits" ON habits
  FOR DELETE USING (auth.uid() = user_id);

-- Habit logs policies
CREATE POLICY "Users can view own habit logs" ON habit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM habits 
      WHERE habits.id = habit_logs.habit_id 
      AND habits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own habit logs" ON habit_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM habits 
      WHERE habits.id = habit_logs.habit_id 
      AND habits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own habit logs" ON habit_logs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM habits 
      WHERE habits.id = habit_logs.habit_id 
      AND habits.user_id = auth.uid()
    )
  );

-- Reminders policies
CREATE POLICY "Users can view own reminders" ON reminders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reminders" ON reminders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders" ON reminders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminders" ON reminders
  FOR DELETE USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" ON notifications
  FOR DELETE USING (auth.uid() = user_id);

-- Activity logs policies
CREATE POLICY "Users can view own activity" ON activity_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Goal completion events policies
CREATE POLICY "Users can view own completion events" ON goal_completion_events
  FOR SELECT USING (auth.uid() = user_id);

-- Achievements policies (public read)
CREATE POLICY "Anyone can view achievements" ON achievements
  FOR SELECT USING (true);

-- User achievements policies
CREATE POLICY "Users can view own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

-- Shared boards policies
CREATE POLICY "Users can view own boards" ON shared_boards
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert own boards" ON shared_boards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own boards" ON shared_boards
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own boards" ON shared_boards
  FOR DELETE USING (auth.uid() = user_id);

-- Shared board goals policies
CREATE POLICY "Users can view shared board goals" ON shared_board_goals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM shared_boards 
      WHERE shared_boards.id = shared_board_goals.board_id 
      AND (shared_boards.user_id = auth.uid() OR shared_boards.is_public = true)
    )
  );

CREATE POLICY "Users can manage own board goals" ON shared_board_goals
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM shared_boards 
      WHERE shared_boards.id = shared_board_goals.board_id 
      AND shared_boards.user_id = auth.uid()
    )
  );

-- Board comments policies
CREATE POLICY "Anyone can view approved comments" ON board_comments
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Authenticated users can insert comments" ON board_comments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own comments" ON board_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON board_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Audit logs policies (read-only for users)
CREATE POLICY "Users can view own audit logs" ON audit_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Affirmations policies (public read)
CREATE POLICY "Anyone can view affirmations" ON affirmations
  FOR SELECT USING (true);

-- Comments
COMMENT ON POLICY "Users can view own profile" ON profiles IS 'Users can only view their own profile data';
COMMENT ON POLICY "Users can view own goals" ON goals IS 'Users can view their own goals or public goals';
COMMENT ON POLICY "Users can view own habits" ON habits IS 'Users can only view and manage their own habits';
