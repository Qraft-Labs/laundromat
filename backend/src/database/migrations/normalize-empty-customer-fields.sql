-- Migration: Normalize Empty Customer Fields
-- Date: 2026-02-16
-- Description: Convert empty strings to NULL for email, location, and notes fields
--              This allows multiple customers without these fields while enforcing
--              uniqueness for non-empty values.

-- Convert empty email strings to NULL
UPDATE customers 
SET email = NULL 
WHERE email = '';

-- Convert empty location strings to NULL
UPDATE customers 
SET location = NULL 
WHERE location = '';

-- Convert empty notes strings to NULL
UPDATE customers 
SET notes = NULL 
WHERE notes = '';

-- Verify the changes
SELECT 
  COUNT(*) FILTER (WHERE email IS NULL) as null_emails,
  COUNT(*) FILTER (WHERE email = '') as empty_emails,
  COUNT(*) FILTER (WHERE location IS NULL) as null_locations,
  COUNT(*) FILTER (WHERE location = '') as empty_locations,
  COUNT(*) FILTER (WHERE notes IS NULL) as null_notes,
  COUNT(*) FILTER (WHERE notes = '') as empty_notes
FROM customers;
