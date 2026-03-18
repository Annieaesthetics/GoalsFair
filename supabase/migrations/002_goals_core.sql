-- Migration 002: Goals core tables
-- Description: Main goals table with images, tags, and relations

-- Goals table
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN (
    'financial', 'career', 'health', 'education', 
    'personal', 'travel', 'relationships', 'environment'
  )),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'archived')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  target_date DATE,
  estimated_cost DECIMAL(12, 2),
  current_savings DECIMAL(12, 2) DEFAULT 0,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  is_public BOOLEAN DEFAULT false,
  share_token TEXT UNIQUE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goal images table (vision board)
CREATE TABLE goal_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_source TEXT CHECK (image_source IN ('unsplash', 'upload')),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goal tags table
CREATE TABLE goal_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goal-tag relations (many-to-many)
CREATE TABLE goal_tag_relations (
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES goal_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (goal_id, tag_id)
);

-- Indexes for performance
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_category ON goals(category);
CREATE INDEX idx_goals_status ON goals(status);
CREATE INDEX idx_goals_target_date ON goals(target_date);
CREATE INDEX idx_goals_deleted_at ON goals(deleted_at);
CREATE INDEX idx_goals_share_token ON goals(share_token) WHERE share_token IS NOT NULL;
CREATE INDEX idx_goal_images_goal_id ON goal_images(goal_id);
CREATE INDEX idx_goal_images_display_order ON goal_images(goal_id, display_order);
CREATE INDEX idx_goal_tag_relations_goal_id ON goal_tag_relations(goal_id);
CREATE INDEX idx_goal_tag_relations_tag_id ON goal_tag_relations(tag_id);

-- Trigger for goals updated_at
CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- View for active goals (excludes soft-deleted)
CREATE VIEW active_goals AS
  SELECT * FROM goals WHERE deleted_at IS NULL;

-- Function to generate share token
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(16), 'base64');
END;
$$ LANGUAGE plpgsql;

-- Function to recalculate goal progress based on milestones
CREATE OR REPLACE FUNCTION recalculate_goal_progress(goal_uuid UUID)
RETURNS VOID AS $$
DECLARE
  total_milestones INTEGER;
  completed_milestones INTEGER;
  new_progress INTEGER;
BEGIN
  SELECT COUNT(*), COUNT(*) FILTER (WHERE completed = true)
  INTO total_milestones, completed_milestones
  FROM goal_milestones
  WHERE goal_id = goal_uuid;
  
  IF total_milestones > 0 THEN
    new_progress := ROUND((completed_milestones::DECIMAL / total_milestones) * 100);
  ELSE
    new_progress := 0;
  END IF;
  
  UPDATE goals
  SET progress_percentage = new_progress
  WHERE id = goal_uuid;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE goals IS 'Main goals table with soft delete support';
COMMENT ON TABLE goal_images IS 'Vision board images for goals';
COMMENT ON TABLE goal_tags IS 'Reusable tags for categorizing goals';
COMMENT ON COLUMN goals.deleted_at IS 'Soft delete timestamp - NULL means active';
COMMENT ON COLUMN goals.share_token IS 'Unique token for public sharing';
COMMENT ON COLUMN goals.progress_percentage IS 'Auto-calculated from milestone completion';
