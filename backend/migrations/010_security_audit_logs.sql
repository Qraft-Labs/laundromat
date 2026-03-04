-- Security Audit Logs Table
-- Tracks all security-related events: login attempts, access attempts, etc.

CREATE TABLE IF NOT EXISTS security_audit_logs (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,  -- LOGIN_SUCCESS, LOGIN_FAILED, ACCESS_DENIED, etc.
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  email VARCHAR(255),  -- Store email even if user_id is null (for failed attempts)
  ip_address VARCHAR(45) NOT NULL,  -- IPv4 or IPv6
  user_agent TEXT,
  event_details JSONB,  -- Additional context (e.g., reason for failure)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_security_audit_logs_event_type ON security_audit_logs(event_type);
CREATE INDEX idx_security_audit_logs_user_id ON security_audit_logs(user_id);
CREATE INDEX idx_security_audit_logs_ip_address ON security_audit_logs(ip_address);
CREATE INDEX idx_security_audit_logs_created_at ON security_audit_logs(created_at DESC);
CREATE INDEX idx_security_audit_logs_email ON security_audit_logs(email);

-- Composite index for rate limiting queries
CREATE INDEX idx_security_audit_logs_ip_type_time 
  ON security_audit_logs(ip_address, event_type, created_at DESC);

COMMENT ON TABLE security_audit_logs IS 'Tracks all security events for auditing and threat detection';
COMMENT ON COLUMN security_audit_logs.event_type IS 'Type of security event';
COMMENT ON COLUMN security_audit_logs.ip_address IS 'Client IP address';
COMMENT ON COLUMN security_audit_logs.event_details IS 'JSON object with additional context';
