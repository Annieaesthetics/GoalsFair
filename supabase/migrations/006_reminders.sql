-- Migration 006: Reminders system
-- Description: Scheduled reminders for goals and habits

CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('goal_deadline', 'habit_daily', 'milestone_due', 'custom')),
  title TEXT NOT NULL,
  message TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT reminder_target_check CHECK (
    (goal_id IS NOT NULL AND habit_id IS NULL) OR
    (goal_id IS NULL AND habit_id IS NOT NULL) OR
    (goal_id IS NULL AND habit_id IS NULL AND reminder_type = 'custom')
  )
);

-- Indexes
CREATE INDEX idx_reminders_user_id ON reminders(user_id);
CREATE INDEX idx_reminders_goal_id ON reminders(goal_id);
CREATE INDEX idx_reminders_habit_id ON reminders(habit_id);
CREATE INDEX idx_reminders_scheduled_at ON reminders(scheduled_at) WHERE sent = false;
CREATE INDEX idx_reminders_sent ON reminders(sent);

-- Function to create goal deadline reminder
CREATE OR REPLACE FUNCTION create_goal_deadline_reminder(goal_uuid UUID)
RETURNS VOID AS $$
DECLARE
  goal_record RECORD;
  reminder_time TIMESTAMPTZ;
BEGIN
  SELECT g.user_id, g.title, g.target_date, up.reminder_time
  INTO goal_record
  FROM goals g
  JOIN user_preferences up ON up.user_id = g.user_id
  WHERE g.id = goal_uuid;
  
  IF goal_record.target_date IS NULL THEN
    RETURN;
  END IF;
  
  -- Create reminder 7 days before deadline
  reminder_time := (goal_record.target_date - INTERVAL '7 days')::DATE + goal_record.reminder_time;
  
  IF reminder_time > NOW() THEN
    INSERT INTO reminders (user_id, goal_id, reminder_type, title, message, scheduled_at)
    VALUES (
      goal_record.user_id,
      goal_uuid,
      'goal_deadline',
      'Goal Deadline Approaching',
      format('Your goal "%s" is due in 7 days', goal_record.title),
      reminder_time
    )
    ON CONFLICT DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to create daily habit reminders
CREATE OR REPLACE FUNCTION create_habit_daily_reminders()
RETURNS VOID AS $$
DECLARE
  habit_record RECORD;
  reminder_time TIMESTAMPTZ;
BEGIN
  FOR habit_record IN
    SELECT h.id, h.user_id, h.title, up.reminder_time
    FROM habits h
    JOIN user_preferences up ON up.user_id = h.user_id
    WHERE h.is_active = true AND h.frequency = 'daily'
  LOOP
    reminder_time := CURRENT_DATE + habit_record.reminder_time;
    
    INSERT INTO reminders (user_id, habit_id, reminder_type, title, message, scheduled_at)
    VALUES (
      habit_record.user_id,
      habit_record.id,
      'habit_daily',
      'Daily Habit Reminder',
      format('Time to complete: %s', habit_record.title),
      reminder_time
    )
    ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE reminders IS 'Scheduled reminders for goals, habits, and milestones';
COMMENT ON COLUMN reminders.scheduled_at IS 'When the reminder should be sent';
COMMENT ON COLUMN reminders.sent IS 'Whether the reminder has been sent';
COMMENT ON COLUMN reminders.reminder_type IS 'Type of reminder for categorization';
