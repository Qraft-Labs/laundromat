-- ========================================
-- MIGRATION: Add Categories Column to Backup Settings
-- Run this in Supabase SQL Editor ONLY IF you already deployed the backup system
-- ========================================
-- 
-- Purpose: Add backup categories selection feature to existing installations
-- When to run: If you see "column categories does not exist" errors
-- Safe to run: Yes, will skip if column already exists
-- ========================================

BEGIN;

DO $$ 
BEGIN 
    RAISE NOTICE '🔧 Checking if backup_email_settings table exists...';
    
    -- Check if table exists
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'backup_email_settings'
    ) THEN
        RAISE NOTICE '✅ Table exists, checking for categories column...';
        
        -- Add categories column if it doesn't exist
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'backup_email_settings' 
            AND column_name = 'categories'
        ) THEN
            ALTER TABLE backup_email_settings 
            ADD COLUMN categories JSONB DEFAULT '["orders", "customers", "payments"]'::jsonb;
            
            RAISE NOTICE '✅ Added categories column to backup_email_settings';
        ELSE
            RAISE NOTICE '⏭️  Categories column already exists, skipping';
        END IF;
    ELSE
        RAISE NOTICE '⏭️  Table does not exist yet - will be created automatically by backend';
    END IF;
    
    RAISE NOTICE '✅ Migration complete!';
END $$;

COMMIT;

-- ========================================
-- WHAT THIS DOES:
-- ✅ Checks if backup_email_settings table exists
-- ✅ If yes, adds categories column (if missing)
-- ✅ If no, does nothing (backend will create full table)
-- ✅ Safe to run multiple times
-- ========================================
