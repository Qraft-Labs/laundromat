-- Add status tracking columns to password_reset_requests table

ALTER TABLE password_reset_requests 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS resolved_by INTEGER REFERENCES users(id);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_password_reset_status ON password_reset_requests(status);

COMMENT ON COLUMN password_reset_requests.status IS 'Status: PENDING, COMPLETED, DENIED';
COMMENT ON COLUMN password_reset_requests.resolved_at IS 'Timestamp when admin approved/denied';
COMMENT ON COLUMN password_reset_requests.resolved_by IS 'Admin who approved/denied the request';
