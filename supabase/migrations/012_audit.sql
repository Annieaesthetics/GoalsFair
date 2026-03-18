-- Migration 012: Audit logging
-- Description: Comprehensive audit trail for security and compliance

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN (
    'INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 
    'PASSWORD_CHANGE', 'EMAIL_CHANGE', 'EXPORT_DATA', 'DELETE_ACCOUNT'
  )),
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_record_id ON audit_logs(record_id);

-- Function to create audit log entry
CREATE OR REPLACE FUNCTION create_audit_log(
  p_user_id UUID,
  p_action TEXT,
  p_table_name TEXT,
  p_record_id UUID DEFAULT NULL,
  p_old_data JSONB DEFAULT NULL,
  p_new_data JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO audit_logs (
    user_id, action, table_name, record_id, 
    old_data, new_data, ip_address, user_agent
  )
  VALUES (
    p_user_id, p_action, p_table_name, p_record_id,
    p_old_data, p_new_data, p_ip_address, p_user_agent
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Generic audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
  user_uuid UUID;
  old_json JSONB;
  new_json JSONB;
BEGIN
  -- Get user_id from the record if it exists
  IF TG_OP = 'DELETE' THEN
    user_uuid := OLD.user_id;
    old_json := to_jsonb(OLD);
    new_json := NULL;
  ELSIF TG_OP = 'UPDATE' THEN
    user_uuid := NEW.user_id;
    old_json := to_jsonb(OLD);
    new_json := to_jsonb(NEW);
  ELSIF TG_OP = 'INSERT' THEN
    user_uuid := NEW.user_id;
    old_json := NULL;
    new_json := to_jsonb(NEW);
  END IF;
  
  -- Create audit log
  PERFORM create_audit_log(
    user_uuid,
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    old_json,
    new_json
  );
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to sensitive tables
CREATE TRIGGER audit_goals
  AFTER INSERT OR UPDATE OR DELETE ON goals
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_savings_transactions
  AFTER INSERT OR UPDATE OR DELETE ON savings_transactions
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_user_preferences
  AFTER UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_function();

-- Function to get user audit history
CREATE OR REPLACE FUNCTION get_user_audit_history(
  p_user_id UUID,
  days_back INTEGER DEFAULT 30,
  limit_count INTEGER DEFAULT 100
)
RETURNS TABLE (
  id UUID,
  action TEXT,
  table_name TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.id,
    al.action,
    al.table_name,
    al.created_at
  FROM audit_logs al
  WHERE al.user_id = p_user_id
    AND al.created_at >= NOW() - (days_back || ' days')::INTERVAL
  ORDER BY al.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments
COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail for security and compliance';
COMMENT ON COLUMN audit_logs.old_data IS 'JSONB snapshot of data before change';
COMMENT ON COLUMN audit_logs.new_data IS 'JSONB snapshot of data after change';
COMMENT ON COLUMN audit_logs.ip_address IS 'IP address of the user making the change';
COMMENT ON COLUMN audit_logs.user_agent IS 'Browser user agent string';
