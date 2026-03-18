-- Migration 010: Achievements system
-- Description: Gamification achievements with seed data

-- Achievements table
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL, -- Lucide icon name
  category TEXT NOT NULL CHECK (category IN ('goals', 'habits', 'savings', 'streaks', 'milestones', 'social')),
  tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  requirement_type TEXT NOT NULL CHECK (requirement_type IN (
    'goals_completed', 'habits_logged', 'streak_days', 'savings_amount', 
    'milestones_completed', 'days_active', 'goals_shared'
  )),
  requirement_value INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User achievements (junction table)
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Indexes
CREATE INDEX idx_achievements_category ON achievements(category);
CREATE INDEX idx_achievements_tier ON achievements(tier);
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX idx_user_achievements_unlocked_at ON user_achievements(unlocked_at);

-- Seed achievements data (30+ achievements)
INSERT INTO achievements (slug, title, description, icon, category, tier, requirement_type, requirement_value) VALUES
  -- Goals achievements
  ('first-goal', 'First Step', 'Create your first goal', 'Target', 'goals', 'bronze', 'goals_completed', 0),
  ('goal-achiever', 'Goal Achiever', 'Complete your first goal', 'Trophy', 'goals', 'bronze', 'goals_completed', 1),
  ('goal-master', 'Goal Master', 'Complete 5 goals', 'Award', 'goals', 'silver', 'goals_completed', 5),
  ('goal-legend', 'Goal Legend', 'Complete 10 goals', 'Crown', 'goals', 'gold', 'goals_completed', 10),
  ('goal-titan', 'Goal Titan', 'Complete 25 goals', 'Zap', 'goals', 'platinum', 'goals_completed', 25),
  
  -- Habits achievements
  ('habit-starter', 'Habit Starter', 'Log your first habit', 'Check', 'habits', 'bronze', 'habits_logged', 1),
  ('habit-builder', 'Habit Builder', 'Log 30 habit completions', 'CheckCheck', 'habits', 'silver', 'habits_logged', 30),
  ('habit-champion', 'Habit Champion', 'Log 100 habit completions', 'Medal', 'habits', 'gold', 'habits_logged', 100),
  ('habit-legend', 'Habit Legend', 'Log 365 habit completions', 'Star', 'habits', 'platinum', 'habits_logged', 365),
  
  -- Streak achievements
  ('week-warrior', 'Week Warrior', 'Maintain a 7-day habit streak', 'Flame', 'streaks', 'bronze', 'streak_days', 7),
  ('streak-master', 'Streak Master', 'Maintain a 30-day habit streak', 'Flame', 'streaks', 'silver', 'streak_days', 30),
  ('streak-legend', 'Streak Legend', 'Maintain a 100-day habit streak', 'Flame', 'streaks', 'gold', 'streak_days', 100),
  ('unstoppable', 'Unstoppable', 'Maintain a 365-day habit streak', 'Flame', 'streaks', 'platinum', 'streak_days', 365),
  
  -- Savings achievements
  ('first-save', 'First Save', 'Log your first savings transaction', 'DollarSign', 'savings', 'bronze', 'savings_amount', 1),
  ('saver', 'Saver', 'Save $100 total', 'PiggyBank', 'savings', 'bronze', 'savings_amount', 100),
  ('smart-saver', 'Smart Saver', 'Save $1,000 total', 'Wallet', 'savings', 'silver', 'savings_amount', 1000),
  ('wealth-builder', 'Wealth Builder', 'Save $5,000 total', 'TrendingUp', 'savings', 'gold', 'savings_amount', 5000),
  ('financial-guru', 'Financial Guru', 'Save $10,000 total', 'Gem', 'savings', 'platinum', 'savings_amount', 10000),
  
  -- Milestones achievements
  ('milestone-starter', 'Milestone Starter', 'Complete your first milestone', 'Flag', 'milestones', 'bronze', 'milestones_completed', 1),
  ('milestone-crusher', 'Milestone Crusher', 'Complete 10 milestones', 'FlagTriangleRight', 'milestones', 'silver', 'milestones_completed', 10),
  ('milestone-master', 'Milestone Master', 'Complete 25 milestones', 'Mountain', 'milestones', 'gold', 'milestones_completed', 25),
  ('milestone-legend', 'Milestone Legend', 'Complete 50 milestones', 'MountainSnow', 'milestones', 'platinum', 'milestones_completed', 50),
  
  -- Activity achievements
  ('active-week', 'Active Week', 'Be active for 7 consecutive days', 'Calendar', 'goals', 'bronze', 'days_active', 7),
  ('active-month', 'Active Month', 'Be active for 30 consecutive days', 'CalendarCheck', 'goals', 'silver', 'days_active', 30),
  ('dedicated', 'Dedicated', 'Be active for 100 consecutive days', 'CalendarHeart', 'goals', 'gold', 'days_active', 100),
  
  -- Social achievements
  ('first-share', 'First Share', 'Share your first goal', 'Share2', 'social', 'bronze', 'goals_shared', 1),
  ('influencer', 'Influencer', 'Share 5 goals', 'Users', 'social', 'silver', 'goals_shared', 5),
  ('inspiration', 'Inspiration', 'Share 10 goals', 'Heart', 'social', 'gold', 'goals_shared', 10),
  
  -- Special achievements
  ('early-bird', 'Early Bird', 'Log a habit before 6 AM', 'Sunrise', 'habits', 'silver', 'habits_logged', 1),
  ('night-owl', 'Night Owl', 'Log a habit after 10 PM', 'Moon', 'habits', 'silver', 'habits_logged', 1),
  ('perfectionist', 'Perfectionist', 'Complete a goal with 100% milestones', 'Sparkles', 'goals', 'gold', 'goals_completed', 1);

-- Function to check and unlock achievements
CREATE OR REPLACE FUNCTION check_achievements(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  achievement_record RECORD;
  user_value INTEGER;
  already_unlocked BOOLEAN;
BEGIN
  FOR achievement_record IN SELECT * FROM achievements LOOP
    -- Check if already unlocked
    SELECT EXISTS(
      SELECT 1 FROM user_achievements 
      WHERE user_id = p_user_id AND achievement_id = achievement_record.id
    ) INTO already_unlocked;
    
    IF already_unlocked THEN
      CONTINUE;
    END IF;
    
    -- Get user's current value for this achievement type
    CASE achievement_record.requirement_type
      WHEN 'goals_completed' THEN
        SELECT COUNT(*) INTO user_value FROM goals 
        WHERE user_id = p_user_id AND status = 'completed';
      WHEN 'habits_logged' THEN
        SELECT COUNT(*) INTO user_value FROM habit_logs hl
        JOIN habits h ON h.id = hl.habit_id
        WHERE h.user_id = p_user_id;
      WHEN 'streak_days' THEN
        SELECT COALESCE(MAX(current_streak), 0) INTO user_value FROM habits
        WHERE user_id = p_user_id;
      WHEN 'savings_amount' THEN
        SELECT COALESCE(SUM(current_savings), 0)::INTEGER INTO user_value FROM goals
        WHERE user_id = p_user_id;
      WHEN 'milestones_completed' THEN
        SELECT COUNT(*) INTO user_value FROM goal_milestones gm
        JOIN goals g ON g.id = gm.goal_id
        WHERE g.user_id = p_user_id AND gm.completed = true;
      WHEN 'goals_shared' THEN
        SELECT COUNT(*) INTO user_value FROM goals
        WHERE user_id = p_user_id AND is_public = true;
      ELSE
        user_value := 0;
    END CASE;
    
    -- Unlock if requirement met
    IF user_value >= achievement_record.requirement_value THEN
      INSERT INTO user_achievements (user_id, achievement_id)
      VALUES (p_user_id, achievement_record.id)
      ON CONFLICT DO NOTHING;
      
      -- Create notification
      PERFORM create_notification(
        p_user_id,
        'achievement_unlocked',
        'Achievement Unlocked!',
        format('You unlocked: %s', achievement_record.title),
        '/achievements',
        achievement_record.icon
      );
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE achievements IS 'Gamification achievements with 30+ unlockable badges';
COMMENT ON TABLE user_achievements IS 'Junction table tracking which achievements users have unlocked';
COMMENT ON COLUMN achievements.icon IS 'Lucide React icon name';
COMMENT ON COLUMN achievements.tier IS 'Achievement difficulty tier for visual styling';
