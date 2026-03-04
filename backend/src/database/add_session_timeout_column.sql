-- Add session_timeout_minutes column to users table
-- Default to 15 minutes (900000 milliseconds / 60000 = 15)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS session_timeout_minutes INTEGER DEFAULT 15;

-- Add comment for documentation
COMMENT ON COLUMN users.session_timeout_minutes IS 'User preference for session timeout in minutes (5-30)';
