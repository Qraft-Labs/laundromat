-- Add DUAL authentication support to database constraints
-- This allows users to login with BOTH Google AND email/password

-- 1. Update auth_provider constraint to include 'DUAL'
ALTER TABLE users 
DROP CONSTRAINT IF EXISTS users_auth_provider_check;

ALTER TABLE users 
ADD CONSTRAINT users_auth_provider_check 
CHECK (auth_provider IN ('LOCAL', 'GOOGLE', 'DUAL'));

-- 2. Update password constraint to allow DUAL auth (requires password)
ALTER TABLE users 
DROP CONSTRAINT IF EXISTS password_required_for_local_auth;

ALTER TABLE users 
ADD CONSTRAINT password_required_for_local_auth 
CHECK (
  (auth_provider = 'GOOGLE' AND password IS NULL) OR  -- Pure Google: no password
  (auth_provider = 'GOOGLE' AND password IS NOT NULL) OR  -- Google with password (will become DUAL)
  (auth_provider = 'DUAL' AND password IS NOT NULL) OR  -- Dual auth: must have password
  (auth_provider = 'LOCAL' AND password IS NOT NULL) OR  -- Local: must have password
  (auth_provider IS NULL AND password IS NOT NULL)  -- Fallback for old data
);

-- 3. Update any existing Google users with passwords to DUAL
UPDATE users 
SET auth_provider = 'DUAL' 
WHERE auth_provider = 'GOOGLE' 
AND password IS NOT NULL;

-- Verify results
SELECT 
  id, 
  email, 
  full_name, 
  auth_provider,
  (password IS NOT NULL) as has_password,
  google_id IS NOT NULL as has_google_id
FROM users 
WHERE email LIKE '%husseinibram%' OR auth_provider = 'DUAL';
