-- Activity Logs Table (Audit Trail)
CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  user_email VARCHAR(255),
  user_name VARCHAR(255),
  user_role VARCHAR(50),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100),
  resource_id INTEGER,
  details JSONB,
  ip_address VARCHAR(100),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_resource ON activity_logs(resource_type, resource_id);

-- Security Audit Logs (for authentication events)
CREATE TABLE IF NOT EXISTS security_audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  email VARCHAR(255),
  event_type VARCHAR(50) NOT NULL,
  ip_address VARCHAR(100),
  user_agent TEXT,
  event_details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_security_logs_user_id ON security_audit_logs(user_id);
CREATE INDEX idx_security_logs_event_type ON security_audit_logs(event_type);
CREATE INDEX idx_security_logs_created_at ON security_audit_logs(created_at DESC);

-- User roles enum (if not exists)
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('ADMIN', 'CASHIER');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Drop old enum values if they exist (safe migration)
ALTER TYPE user_role DROP VALUE IF EXISTS 'MANAGER';
ALTER TYPE user_role DROP VALUE IF EXISTS 'AGENT';
ALTER TYPE user_role DROP VALUE IF EXISTS 'USER';

-- User status enum (if not exists)
DO $$ BEGIN
  CREATE TYPE user_status AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Update users table to add new fields if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

COMMENT ON TABLE activity_logs IS 'Tracks all user and admin actions for audit and security purposes';
COMMENT ON TABLE security_audit_logs IS 'Tracks authentication events and security-related activities';
COMMENT ON COLUMN activity_logs.action IS 'Action type: CREATE_ORDER, UPDATE_ORDER, DELETE_ORDER, CREATE_CUSTOMER, APPROVE_USER, etc.';
COMMENT ON COLUMN activity_logs.details IS 'JSON object with action-specific details';
