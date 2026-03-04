-- Add MANAGER role to user_role enum
-- PostgreSQL doesn't allow direct modification of enums, so we need to use ALTER TYPE ADD VALUE

DO $$ 
BEGIN
    -- Check if MANAGER already exists in the enum
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'MANAGER' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
    ) THEN
        -- Add MANAGER to the enum
        ALTER TYPE user_role ADD VALUE 'MANAGER';
        RAISE NOTICE 'Added MANAGER to user_role enum';
    ELSE
        RAISE NOTICE 'MANAGER already exists in user_role enum';
    END IF;
END $$;

-- Verify the enum values
SELECT enumlabel as role_values 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
ORDER BY enumsortorder;
