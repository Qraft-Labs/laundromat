-- Update password constraint to allow dual authentication
-- Google users can optionally add passwords to login via Google OR email/password

-- Drop old constraint
ALTER TABLE users 
DROP CONSTRAINT IF EXISTS password_required_for_local_auth;

-- Add new constraint that allows Google users to have passwords
ALTER TABLE users 
ADD CONSTRAINT password_required_for_local_auth 
CHECK (
  (auth_provider = 'GOOGLE') OR  -- Google users can have NULL or password (dual auth)
  (auth_provider IS NULL AND password IS NOT NULL) OR
  (auth_provider = 'LOCAL' AND password IS NOT NULL)
);
