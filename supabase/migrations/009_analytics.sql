-- Migration 009: Analytics and activity tracking
-- Description: Activity logs and goal completion events for analytics

-- Activity logs table (partitioned by month for performance)
CREATE TABLE activity_logs (
  id UUID DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'goal_created', 'goal_updated', 'goal_completed', 'goal_deleted',
    'milestone_created', 'milestone_completed',
    'savings_added', 'habit_logged', 'habit_created',
    'achievement_unlocked', 'login'
  )),
  entity_type TEXT CHECK (entity_type IN ('goal', 'milestone', 'habit', 'transaction', 'achievement')),
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Create partitions for current and next 12 months
CREATE TABLE activity_logs_2025_01 PARTITION OF activity_logs
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE activity_logs_2025_02 PARTITION OF activity_logs
  FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
CREATE TABLE activity_logs_2025_03 PARTITION OF activity_logs
  FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');
CREATE TABLE activity_logs_2025_04 PARTITION OF activity_logs
  FOR VALUES FROM ('2025-04-01') TO ('2025-05-01');
CREATE TABLE activity_logs_2025_05 PARTITION OF activity_logs
  FOR VALUES FROM ('2025-05-01') TO ('2025-06-01');
CREATE TABLE activity_logs_2025_06 PARTITION OF activity_logs
  FOR VALUES FROM ('2025-06-01') TO ('2025-07-01');
CREATE TABLE activity_logs_2025_07 PARTITION OF activity_logs
  FOR VALUES FROM ('2025-07-01') TO ('2025-08-01');
CREATE TABLE activity_logs_2025_08 PARTITION OF activity_logs
  FOR VALUES FROM ('2025-08-01') TO ('2025-09-01');
CREATE TABLE activity_logs_2025_09 PARTITION OF activity_logs
  FOR VALUES FROM ('2025-09-01') TO ('2025-10-01');
CREATE TABLE activity_logs_2025_10 PARTITION OF activity_logs
  FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');
CREATE TABLE activity_logs_2025_11 PARTITION OF activity_logs
  FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');
CREATE TABLE activity_logs_2025_12 PARTITION OF activity_logs
  FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');

-- Goal completion events (for analytics)
CREATE TABLE goal_completion_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  goal_title TEXT NOT NULL,
  goal_category TEXT NOT NULL,
  days_to_complete INTEGER,
  milestones_completed INTEGER,
  total_savings DECIMAL(12, 2),
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_type ON activity_logs(activity_type);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX idx_goal_completion_events_user_id ON goal_completion_events(user_id);
CREATE INDEX idx_goal_completion_events_category ON goal_completion_events(goal_category);
CREATE INDEX idx_goal_completion_events_completed_at ON goal_completion_events(completed_at);

-- Function to log activity
CREATE OR REPLACE FUNCTION log_activity(
  p_user_id UUID,
  p_activity_type TEXT,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO activity_logs (user_id, activity_type, entity_type, entity_id, metadata)
  VALUES (p_user_id, p_activity_type, p_entity_type, p_entity_id, p_metadata)
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- Function to record goal completion event
CREATE OR REPLACE FUNCTION record_goal_completion_event()
RETURNS TRIGGER AS $$
DECLARE
  days_taken INTEGER;
  milestone_count INTEGER;
  total_saved DECIMAL(12, 2);
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    days_taken := EXTRACT(DAY FROM (NOW() - NEW.created_at));
    
    SELECT COUNT(*) INTO milestone_count
    FROM goal_milestones
    WHERE goal_id = NEW.id AND completed = true;
    
    total_saved := COALESCE(NEW.current_savings, 0);
    
    INSERT INTO goal_completion_events (
      user_id, goal_id, goal_title, goal_category,
      days_to_complete, milestones_completed, total_savings
    )
    VALUES (
      NEW.user_id, NEW.id, NEW.title, NEW.category,
      days_taken, milestone_count, total_saved
    );
    
    PERFORM log_activity(NEW.user_id, 'goal_completed', 'goal', NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER record_completion_event
  AFTER UPDATE ON goals
  FOR EACH ROW
  EXECUTE FUNCTION record_goal_completion_event();

-- Function to get user activity heatmap data
CREATE OR REPLACE FUNCTION get_activity_heatmap(p_user_id UUID, days_back INTEGER DEFAULT 365)
RETURNS TABLE (
  activity_date DATE,
  activity_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    created_at::DATE as activity_date,
    COUNT(*)::INTEGER as activity_count
  FROM activity_logs
  WHERE user_id = p_user_id
    AND created_at >= CURRENT_DATE - days_back
  GROUP BY created_at::DATE
  ORDER BY activity_date;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE activity_logs IS 'Partitioned activity log for user actions and events';
COMMENT ON TABLE goal_completion_events IS 'Analytics data for completed goals';
COMMENT ON COLUMN activity_logs.metadata IS 'JSON metadata for additional context';
