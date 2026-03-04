-- Add approval_status column to expenses table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'expenses' 
    AND column_name = 'approval_status'
  ) THEN
    ALTER TABLE expenses ADD COLUMN approval_status VARCHAR(50) DEFAULT 'APPROVED';
    UPDATE expenses SET approval_status = 'APPROVED' WHERE approval_status IS NULL;
    ALTER TABLE expenses ALTER COLUMN approval_status SET NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_expenses_approval_status ON expenses(approval_status);
    RAISE NOTICE 'Added approval_status column to expenses table';
  ELSE
    RAISE NOTICE 'approval_status column already exists';
  END IF;
END $$;

-- Show expenses table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'expenses' 
ORDER BY ordinal_position;
