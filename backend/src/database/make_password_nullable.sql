-- Make password nullable for OAuth users (Google login doesn't require passwords initially)
ALTER TABLE users 
ALTER COLUMN password DROP NOT NULL;

-- Add a check constraint to ensure password is provided for LOCAL auth users
-- Google users can optionally add passwords for dual authentication (Google OR email/password)
ALTER TABLE users 
ADD CONSTRAINT password_required_for_local_auth 
CHECK (
  (auth_provider = 'GOOGLE') OR  -- Google users can have NULL or set password for dual auth
  (auth_provider IS NULL AND password IS NOT NULL) OR
  (auth_provider = 'LOCAL' AND password IS NOT NULL)
);
