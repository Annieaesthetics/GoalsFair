-- Migration 004: Financial tracking
-- Description: Savings transactions and financial projections

-- Savings transactions table
CREATE TABLE savings_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  transaction_type TEXT DEFAULT 'deposit' CHECK (transaction_type IN ('deposit', 'withdrawal')),
  description TEXT,
  transaction_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Financial projections table
CREATE TABLE financial_projections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE UNIQUE,
  monthly_required DECIMAL(12, 2),
  weekly_required DECIMAL(12, 2),
  projected_completion_date DATE,
  last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_savings_transactions_goal_id ON savings_transactions(goal_id);
CREATE INDEX idx_savings_transactions_date ON savings_transactions(transaction_date);
CREATE INDEX idx_financial_projections_goal_id ON financial_projections(goal_id);

-- Trigger for financial_projections updated_at
CREATE TRIGGER update_financial_projections_updated_at
  BEFORE UPDATE ON financial_projections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update goal current_savings
CREATE OR REPLACE FUNCTION update_goal_savings()
RETURNS TRIGGER AS $$
DECLARE
  total_savings DECIMAL(12, 2);
BEGIN
  SELECT COALESCE(
    SUM(CASE 
      WHEN transaction_type = 'deposit' THEN amount
      WHEN transaction_type = 'withdrawal' THEN -amount
    END), 0
  )
  INTO total_savings
  FROM savings_transactions
  WHERE goal_id = NEW.goal_id;
  
  UPDATE goals
  SET current_savings = total_savings
  WHERE id = NEW.goal_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update goal savings on transaction
CREATE TRIGGER update_savings_on_transaction
  AFTER INSERT OR UPDATE OR DELETE ON savings_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_goal_savings();

-- Function to calculate financial projections
CREATE OR REPLACE FUNCTION calculate_financial_projections(goal_uuid UUID)
RETURNS VOID AS $$
DECLARE
  goal_record RECORD;
  remaining_amount DECIMAL(12, 2);
  days_remaining INTEGER;
  weeks_remaining DECIMAL;
  months_remaining DECIMAL;
BEGIN
  SELECT estimated_cost, current_savings, target_date
  INTO goal_record
  FROM goals
  WHERE id = goal_uuid;
  
  IF goal_record.estimated_cost IS NULL OR goal_record.target_date IS NULL THEN
    RETURN;
  END IF;
  
  remaining_amount := goal_record.estimated_cost - COALESCE(goal_record.current_savings, 0);
  days_remaining := goal_record.target_date - CURRENT_DATE;
  
  IF days_remaining <= 0 THEN
    RETURN;
  END IF;
  
  weeks_remaining := days_remaining / 7.0;
  months_remaining := days_remaining / 30.0;
  
  INSERT INTO financial_projections (
    goal_id,
    monthly_required,
    weekly_required,
    projected_completion_date,
    last_calculated_at
  )
  VALUES (
    goal_uuid,
    CASE WHEN months_remaining > 0 THEN remaining_amount / months_remaining ELSE 0 END,
    CASE WHEN weeks_remaining > 0 THEN remaining_amount / weeks_remaining ELSE 0 END,
    goal_record.target_date,
    NOW()
  )
  ON CONFLICT (goal_id) DO UPDATE SET
    monthly_required = EXCLUDED.monthly_required,
    weekly_required = EXCLUDED.weekly_required,
    projected_completion_date = EXCLUDED.projected_completion_date,
    last_calculated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Trigger to recalculate projections on savings change
CREATE OR REPLACE FUNCTION trigger_projection_recalc()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM calculate_financial_projections(OLD.goal_id);
    RETURN OLD;
  ELSE
    PERFORM calculate_financial_projections(NEW.goal_id);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recalc_projections_on_transaction
  AFTER INSERT OR UPDATE OR DELETE ON savings_transactions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_projection_recalc();

-- Trigger to recalculate projections when goal financial data changes
CREATE OR REPLACE FUNCTION recalc_projections_on_goal_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.estimated_cost IS DISTINCT FROM OLD.estimated_cost OR
     NEW.target_date IS DISTINCT FROM OLD.target_date THEN
    PERFORM calculate_financial_projections(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recalc_projections_on_goal_change
  AFTER UPDATE ON goals
  FOR EACH ROW
  EXECUTE FUNCTION recalc_projections_on_goal_update();

-- Comments
COMMENT ON TABLE savings_transactions IS 'Transaction log for goal savings tracking';
COMMENT ON TABLE financial_projections IS 'Auto-calculated financial projections per goal';
COMMENT ON COLUMN financial_projections.monthly_required IS 'Amount needed per month to reach goal';
COMMENT ON COLUMN financial_projections.weekly_required IS 'Amount needed per week to reach goal';
