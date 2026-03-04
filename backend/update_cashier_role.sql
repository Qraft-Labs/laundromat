-- Update cashier account role from ADMIN to DESKTOP_AGENT
UPDATE users 
SET role = 'DESKTOP_AGENT' 
WHERE email = 'user@lushlaundry.com';

-- Verify the update
SELECT id, email, full_name, role, status 
FROM users 
ORDER BY id;
