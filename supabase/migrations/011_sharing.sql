-- Migration 011: Sharing and social features
-- Description: Public goal boards and shared goals with comments

-- Shared boards table
CREATE TABLE shared_boards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT true,
  share_token TEXT UNIQUE NOT NULL,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shared goals (many-to-many with boards)
CREATE TABLE shared_board_goals (
  board_id UUID NOT NULL REFERENCES shared_boards(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (board_id, goal_id)
);

-- Board comments (for public boards)
CREATE TABLE board_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  board_id UUID NOT NULL REFERENCES shared_boards(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  commenter_name TEXT NOT NULL,
  comment_text TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_shared_boards_user_id ON shared_boards(user_id);
CREATE INDEX idx_shared_boards_share_token ON shared_boards(share_token);
CREATE INDEX idx_shared_boards_is_public ON shared_boards(is_public) WHERE is_public = true;
CREATE INDEX idx_shared_board_goals_board_id ON shared_board_goals(board_id);
CREATE INDEX idx_shared_board_goals_goal_id ON shared_board_goals(goal_id);
CREATE INDEX idx_board_comments_board_id ON board_comments(board_id);
CREATE INDEX idx_board_comments_created_at ON board_comments(created_at DESC);

-- Trigger for shared_boards updated_at
CREATE TRIGGER update_shared_boards_updated_at
  BEFORE UPDATE ON shared_boards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to increment board view count
CREATE OR REPLACE FUNCTION increment_board_views(board_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE shared_boards
  SET view_count = view_count + 1
  WHERE id = board_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to create shared board
CREATE OR REPLACE FUNCTION create_shared_board(
  p_user_id UUID,
  p_title TEXT,
  p_description TEXT DEFAULT NULL,
  p_is_public BOOLEAN DEFAULT true
)
RETURNS UUID AS $$
DECLARE
  board_id UUID;
  token TEXT;
BEGIN
  token := generate_share_token();
  
  INSERT INTO shared_boards (user_id, title, description, is_public, share_token)
  VALUES (p_user_id, p_title, p_description, p_is_public, token)
  RETURNING id INTO board_id;
  
  RETURN board_id;
END;
$$ LANGUAGE plpgsql;

-- Function to add goal to shared board
CREATE OR REPLACE FUNCTION add_goal_to_board(
  p_board_id UUID,
  p_goal_id UUID
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO shared_board_goals (board_id, goal_id)
  VALUES (p_board_id, p_goal_id)
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Function to get public boards (for discovery)
CREATE OR REPLACE FUNCTION get_public_boards(limit_count INTEGER DEFAULT 20)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  user_name TEXT,
  goal_count BIGINT,
  view_count INTEGER,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sb.id,
    sb.title,
    sb.description,
    p.full_name as user_name,
    COUNT(sbg.goal_id) as goal_count,
    sb.view_count,
    sb.created_at
  FROM shared_boards sb
  JOIN profiles p ON p.id = sb.user_id
  LEFT JOIN shared_board_goals sbg ON sbg.board_id = sb.id
  WHERE sb.is_public = true
  GROUP BY sb.id, p.full_name
  ORDER BY sb.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE shared_boards IS 'Shareable goal boards for public or private sharing';
COMMENT ON TABLE shared_board_goals IS 'Goals included in shared boards';
COMMENT ON TABLE board_comments IS 'Comments on public shared boards';
COMMENT ON COLUMN shared_boards.share_token IS 'Unique token for accessing the board';
COMMENT ON COLUMN shared_boards.view_count IS 'Number of times the board has been viewed';
