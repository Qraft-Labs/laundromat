-- Add profile picture column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(500);

-- Verify the change
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name = 'profile_picture';
