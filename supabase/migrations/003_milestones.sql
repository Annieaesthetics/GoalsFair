-- Migration 003: Goal milestones
-- Description: Milestones/sub-goals with completion tracking

CREATE TABLE goal_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_milestones_goal_id ON goal_milestones(goal_id);
CREATE INDEX idx_milestones_completed ON goal_milestones(completed);
CREATE INDEX idx_milestones_due_date ON goal_milestones(due_date);
CREATE INDEX idx_milestones_display_order ON goal_milestones(goal_id, display_order);

-- Trigger for updated_at
CREATE TRIGGER update_milestones_updated_at
  BEFORE UPDATE ON goal_milestones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-set completed_at timestamp
CREATE OR REPLACE FUNCTION set_milestone_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed = true AND OLD.completed = false THEN
    NEW.completed_at = NOW();
  ELSIF NEW.completed = false AND OLD.completed = true THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set completed_at
CREATE TRIGGER milestone_completion_timestamp
  BEFORE UPDATE ON goal_milestones
  FOR EACH ROW
  EXECUTE FUNCTION set_milestone_completed_at();

-- Trigger to recalculate goal progress when milestone changes
CREATE OR REPLACE FUNCTION trigger_goal_progress_recalc()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM recalculate_goal_progress(OLD.goal_id);
    RETURN OLD;
  ELSE
    PERFORM recalculate_goal_progress(NEW.goal_id);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recalc_progress_on_milestone_change
  AFTER INSERT OR UPDATE OR DELETE ON goal_milestones
  FOR EACH ROW
  EXECUTE FUNCTION trigger_goal_progress_recalc();

-- Comments
COMMENT ON TABLE goal_milestones IS 'Sub-goals/milestones with completion tracking';
COMMENT ON COLUMN goal_milestones.completed_at IS 'Auto-set when completed changes to true';
COMMENT ON COLUMN goal_milestones.display_order IS 'For drag-and-drop reordering';
