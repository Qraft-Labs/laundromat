-- Update existing users to new role system
-- Run this after add_audit_logs.sql migration

-- Update admin user to ADMIN role and ACTIVE status
UPDATE users 
SET role = 'ADMIN', 
    status = 'ACTIVE'
WHERE email = 'admin@lushlaundry.com';

-- Update any other existing users to CASHIER role and ACTIVE status
UPDATE users 
SET role = 'CASHIER', 
    status = 'ACTIVE'
WHERE email != 'admin@lushlaundry.com' 
  AND role NOT IN ('ADMIN', 'CASHIER');

-- Add fields if they don't exist (safe to run)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='last_login') THEN
        ALTER TABLE users ADD COLUMN last_login TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='approved_by') THEN
        ALTER TABLE users ADD COLUMN approved_by INTEGER REFERENCES users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='approved_at') THEN
        ALTER TABLE users ADD COLUMN approved_at TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='rejection_reason') THEN
        ALTER TABLE users ADD COLUMN rejection_reason TEXT;
    END IF;
END $$;

-- Show updated users
SELECT id, email, full_name, role, status 
FROM users 
ORDER BY id;
