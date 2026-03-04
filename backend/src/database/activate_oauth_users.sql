-- Activate all Google OAuth users (they should be ACTIVE by default, not PENDING)
UPDATE users 
SET status = 'ACTIVE' 
WHERE auth_provider = 'GOOGLE' AND status = 'PENDING';

-- Show updated users
SELECT id, email, full_name, role, status, auth_provider 
FROM users 
WHERE auth_provider = 'GOOGLE';
