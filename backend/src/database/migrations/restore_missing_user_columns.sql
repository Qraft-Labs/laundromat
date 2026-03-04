-- Migration: Restore missing user tracking columns
-- This adds must_change_password, last_login, and ensures proper timestamps

-- Add must_change_password column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='users' AND column_name='must_change_password'
  ) THEN
    ALTER TABLE users ADD COLUMN must_change_password BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'Added must_change_password column';
  ELSE
    RAISE NOTICE 'must_change_password column already exists';
  END IF;
END $$;

-- Add last_login column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='users' AND column_name='last_login'
  ) THEN
    ALTER TABLE users ADD COLUMN last_login TIMESTAMP;
    RAISE NOTICE 'Added last_login column';
  ELSE
    RAISE NOTICE 'last_login column already exists';
  END IF;
END $$;

-- Ensure created_at exists with proper default
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='users' AND column_name='created_at'
  ) THEN
    ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    RAISE NOTICE 'Added created_at column';
  ELSE
    RAISE NOTICE 'created_at column already exists';
  END IF;
END $$;

-- Ensure updated_at exists with proper default
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='users' AND column_name='updated_at'
  ) THEN
    ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    RAISE NOTICE 'Added updated_at column';
  ELSE
    RAISE NOTICE 'updated_at column already exists';
  END IF;
END $$;

-- Create or replace function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

-- Create trigger to automatically update updated_at on user changes
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Ensure auth_provider supports DUAL authentication for Google users who set passwords
DO $$ 
BEGIN
  -- Check if auth_provider column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='users' AND column_name='auth_provider'
  ) THEN
    -- Update existing ENUM type or create new one
    BEGIN
      -- Try to create DUAL type if it doesn't exist
      EXECUTE 'ALTER TYPE auth_provider_type ADD VALUE IF NOT EXISTS ''DUAL''';
    EXCEPTION
      WHEN others THEN
        -- Type might not be an ENUM, convert column if needed
        RAISE NOTICE 'auth_provider column exists but may need adjustment';
    END;
  END IF;
END $$;

-- Display current users table structure
DO $$ 
DECLARE
  column_info RECORD;
BEGIN
  RAISE NOTICE '--- Users Table Columns ---';
  FOR column_info IN 
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_name = 'users'
    ORDER BY ordinal_position
  LOOP
    RAISE NOTICE '% - % (nullable: %, default: %)', 
      column_info.column_name, 
      column_info.data_type,
      column_info.is_nullable,
      column_info.column_default;
  END LOOP;
  RAISE NOTICE 'Migration completed successfully!';
END $$;
