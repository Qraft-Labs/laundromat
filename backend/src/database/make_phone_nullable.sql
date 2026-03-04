-- Make phone nullable for OAuth users (Google doesn't provide phone numbers)
ALTER TABLE users 
ALTER COLUMN phone DROP NOT NULL;
