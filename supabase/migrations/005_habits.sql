-- Migration 005: Habits system
-- Description: Habits linked to goals with completion tracking and streaks

-- Habits table
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly')),
  target_days INTEGER[], -- For weekly: [1,3,5] = Mon, Wed, Fri
  is_active BOOLEAN DEFAULT true,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habit logs table
CREATE TABLE habit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(habit_id, completed_date)
);

-- Indexes
CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habits_goal_id ON habits(goal_id);
CREATE INDEX idx_habits_is_active ON habits(is_active);
CREATE INDEX idx_habit_logs_habit_id ON habit_logs(habit_id);
CREATE INDEX idx_habit_logs_completed_date ON habit_logs(completed_date);
CREATE INDEX idx_habit_logs_habit_date ON habit_logs(habit_id, completed_date);

-- Trigger for habits updated_at
CREATE TRIGGER update_habits_updated_at
  BEFORE UPDATE ON habits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate habit streak
CREATE OR REPLACE FUNCTION calculate_habit_streak(habit_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  streak_count INTEGER := 0;
  check_date DATE := CURRENT_DATE;
  habit_frequency TEXT;
  target_days_array INTEGER[];
  day_found BOOLEAN;
BEGIN
  SELECT frequency, target_days INTO habit_frequency, target_days_array
  FROM habits WHERE id = habit_uuid;
  
  LOOP
    -- Check if this date should be counted based on frequency
    IF habit_frequency = 'daily' THEN
      day_found := EXISTS (
        SELECT 1 FROM habit_logs 
        WHERE habit_id = habit_uuid AND completed_date = check_date
      );
    ELSIF habit_frequency = 'weekly' THEN
      -- Check if today's day of week is in target_days
      IF EXTRACT(DOW FROM check_date)::INTEGER = ANY(target_days_array) THEN
        day_found := EXISTS (
          SELECT 1 FROM habit_logs 
          WHERE habit_id = habit_uuid AND completed_date = check_date
        );
      ELSE
        -- Skip days not in target, don't break streak
        check_date := check_date - INTERVAL '1 day';
        CONTINUE;
      END IF;
    END IF;
    
    IF day_found THEN
      streak_count := streak_count + 1;
      check_date := check_date - INTERVAL '1 day';
    ELSE
      EXIT;
    END IF;
  END LOOP;
  
  RETURN streak_count;
END;
$$ LANGUAGE plpgsql;

-- Function to update habit streaks
CREATE OR REPLACE FUNCTION update_habit_streaks()
RETURNS TRIGGER AS $$
DECLARE
  new_streak INTEGER;
BEGIN
  new_streak := calculate_habit_streak(NEW.habit_id);
  
  UPDATE habits
  SET 
    current_streak = new_streak,
    longest_streak = GREATEST(longest_streak, new_streak)
  WHERE id = NEW.habit_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update streaks on habit log
CREATE TRIGGER update_streaks_on_log
  AFTER INSERT OR DELETE ON habit_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_habit_streaks();

-- Function to get today's habit status
CREATE OR REPLACE FUNCTION get_todays_habits(user_uuid UUID)
RETURNS TABLE (
  habit_id UUID,
  title TEXT,
  completed BOOLEAN,
  current_streak INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    h.id,
    h.title,
    EXISTS(SELECT 1 FROM habit_logs WHERE habit_id = h.id AND completed_date = CURRENT_DATE) as completed,
    h.current_streak
  FROM habits h
  WHERE h.user_id = user_uuid AND h.is_active = true
  ORDER BY h.created_at;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE habits IS 'User habits linked to goals with frequency tracking';
COMMENT ON TABLE habit_logs IS 'Daily completion log for habits';
COMMENT ON COLUMN habits.frequency IS 'daily or weekly habit frequency';
COMMENT ON COLUMN habits.target_days IS 'For weekly habits: array of day numbers (0=Sun, 6=Sat)';
COMMENT ON COLUMN habits.current_streak IS 'Current consecutive completion streak';
COMMENT ON COLUMN habits.longest_streak IS 'All-time longest streak achieved';
