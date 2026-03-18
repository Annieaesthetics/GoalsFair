-- Migration 007: Notifications system
-- Description: In-app notification center

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'goal_completed', 'milestone_completed', 'habit_streak', 
    'achievement_unlocked', 'deadline_warning', 'savings_milestone', 'system'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  icon TEXT, -- Lucide icon name
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read) WHERE read = false;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.read = true AND OLD.read = false THEN
    NEW.read_at = NOW();
  ELSIF NEW.read = false AND OLD.read = true THEN
    NEW.read_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set read_at timestamp
CREATE TRIGGER notification_read_timestamp
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION mark_notification_read();

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_action_url TEXT DEFAULT NULL,
  p_icon TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, action_url, icon)
  VALUES (p_user_id, p_type, p_title, p_message, p_action_url, p_icon)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get unread count
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM notifications WHERE user_id = p_user_id AND read = false);
END;
$$ LANGUAGE plpgsql;

-- Function to auto-create notifications on goal completion
CREATE OR REPLACE FUNCTION notify_goal_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    PERFORM create_notification(
      NEW.user_id,
      'goal_completed',
      'Goal Completed! 🎉',
      format('Congratulations! You completed "%s"', NEW.title),
      format('/goals/%s', NEW.id),
      'Trophy'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER goal_completion_notification
  AFTER UPDATE ON goals
  FOR EACH ROW
  EXECUTE FUNCTION notify_goal_completion();

-- Function to auto-create notifications on milestone completion
CREATE OR REPLACE FUNCTION notify_milestone_completion()
RETURNS TRIGGER AS $$
DECLARE
  goal_title TEXT;
  goal_user_id UUID;
BEGIN
  IF NEW.completed = true AND OLD.completed = false THEN
    SELECT g.title, g.user_id INTO goal_title, goal_user_id
    FROM goals g WHERE g.id = NEW.goal_id;
    
    PERFORM create_notification(
      goal_user_id,
      'milestone_completed',
      'Milestone Completed!',
      format('You completed "%s" for goal "%s"', NEW.title, goal_title),
      format('/goals/%s', NEW.goal_id),
      'Check'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER milestone_completion_notification
  AFTER UPDATE ON goal_milestones
  FOR EACH ROW
  EXECUTE FUNCTION notify_milestone_completion();

-- Comments
COMMENT ON TABLE notifications IS 'In-app notification center for user alerts';
COMMENT ON COLUMN notifications.type IS 'Notification category for filtering and icons';
COMMENT ON COLUMN notifications.icon IS 'Lucide React icon name (e.g., Trophy, Check, AlertTriangle)';
COMMENT ON COLUMN notifications.action_url IS 'Optional URL to navigate when notification clicked';
