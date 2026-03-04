-- Add UNIQUE constraints to prevent duplicate phone numbers and emails
-- Date: February 2, 2026
-- Purpose: Ensure data integrity - each phone/email can only be used once

-- First, check if there are any existing duplicates (should be none based on our audit)
DO $$
BEGIN
    -- Check for duplicate phones
    IF EXISTS (
        SELECT phone, COUNT(*) 
        FROM customers 
        WHERE phone IS NOT NULL AND phone != ''
        GROUP BY phone 
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION 'Cannot add UNIQUE constraint: Duplicate phone numbers exist. Run check-duplicates.ts first.';
    END IF;

    -- Check for duplicate emails
    IF EXISTS (
        SELECT email, COUNT(*) 
        FROM customers 
        WHERE email IS NOT NULL AND email != ''
        GROUP BY email 
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION 'Cannot add UNIQUE constraint: Duplicate emails exist. Clean data first.';
    END IF;
END $$;

-- Add UNIQUE constraint on phone number
-- This prevents two customers from having the same phone
ALTER TABLE customers 
ADD CONSTRAINT unique_customer_phone 
UNIQUE (phone);

-- Add UNIQUE constraint on email (if email is provided)
-- This prevents two customers from having the same email
ALTER TABLE customers 
ADD CONSTRAINT unique_customer_email 
UNIQUE (email);

-- Add comments for documentation
COMMENT ON CONSTRAINT unique_customer_phone ON customers IS 
'Ensures each phone number is unique across all customers. Phone is the primary identifier for customers in Uganda.';

COMMENT ON CONSTRAINT unique_customer_email ON customers IS 
'Ensures each email is unique when provided. Allows NULL/empty emails since not all customers have email.';

-- Verify constraints were added
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'customers'::regclass
AND conname IN ('unique_customer_phone', 'unique_customer_email');
