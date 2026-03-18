-- Migration 008: Affirmations seed data
-- Description: Motivational affirmations for AI coaching

CREATE TABLE affirmations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL CHECK (category IN (
    'financial', 'career', 'health', 'education', 
    'personal', 'travel', 'relationships', 'environment', 'general'
  )),
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_affirmations_category ON affirmations(category);

-- Seed affirmations data
INSERT INTO affirmations (category, text) VALUES
  -- Financial
  ('financial', 'I am building wealth through consistent, smart decisions.'),
  ('financial', 'Every dollar saved brings me closer to financial freedom.'),
  ('financial', 'I am worthy of financial abundance and security.'),
  ('financial', 'My financial goals are achievable with discipline and patience.'),
  
  -- Career
  ('career', 'I am capable of achieving my professional aspirations.'),
  ('career', 'My skills and talents are valuable and recognized.'),
  ('career', 'I embrace challenges as opportunities for growth.'),
  ('career', 'Success is the natural result of my consistent effort.'),
  
  -- Health
  ('health', 'I honor my body by making healthy choices every day.'),
  ('health', 'My health is my greatest wealth.'),
  ('health', 'I am becoming stronger and healthier with each passing day.'),
  ('health', 'I deserve to feel energized and vibrant.'),
  
  -- Education
  ('education', 'I am a lifelong learner, always growing and evolving.'),
  ('education', 'Knowledge empowers me to create the life I desire.'),
  ('education', 'I absorb new information easily and apply it effectively.'),
  ('education', 'Every lesson learned is a step toward mastery.'),
  
  -- Personal
  ('personal', 'I am worthy of love, respect, and happiness.'),
  ('personal', 'I trust myself to make the right decisions.'),
  ('personal', 'I am constantly evolving into my best self.'),
  ('personal', 'My potential is limitless.'),
  
  -- Travel
  ('travel', 'The world is full of experiences waiting for me.'),
  ('travel', 'I am open to new adventures and cultures.'),
  ('travel', 'Travel enriches my life and broadens my perspective.'),
  ('travel', 'I create unforgettable memories wherever I go.'),
  
  -- Relationships
  ('relationships', 'I attract positive, supportive people into my life.'),
  ('relationships', 'I communicate with love, honesty, and compassion.'),
  ('relationships', 'My relationships are built on mutual respect and trust.'),
  ('relationships', 'I am worthy of deep, meaningful connections.'),
  
  -- Environment
  ('environment', 'My actions contribute to a healthier planet.'),
  ('environment', 'I am a steward of the Earth for future generations.'),
  ('environment', 'Small sustainable choices create lasting impact.'),
  ('environment', 'I live in harmony with nature.'),
  
  -- General
  ('general', 'I am exactly where I need to be on my journey.'),
  ('general', 'Progress, not perfection, is my goal.'),
  ('general', 'I celebrate every small win along the way.'),
  ('general', 'I am resilient and capable of overcoming obstacles.'),
  ('general', 'Today is full of possibilities.'),
  ('general', 'I am grateful for the opportunity to grow.'),
  ('general', 'My consistency compounds into extraordinary results.'),
  ('general', 'I trust the process and embrace the journey.');

-- Function to get random affirmation by category
CREATE OR REPLACE FUNCTION get_random_affirmation(p_category TEXT DEFAULT 'general')
RETURNS TEXT AS $$
DECLARE
  affirmation_text TEXT;
BEGIN
  SELECT text INTO affirmation_text
  FROM affirmations
  WHERE category = p_category OR category = 'general'
  ORDER BY RANDOM()
  LIMIT 1;
  
  RETURN affirmation_text;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE affirmations IS 'Motivational affirmations for AI coaching and daily inspiration';
COMMENT ON FUNCTION get_random_affirmation IS 'Returns a random affirmation for the specified category';
