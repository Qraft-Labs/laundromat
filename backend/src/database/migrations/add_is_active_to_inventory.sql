-- Add is_active column to inventory_items if it doesn't exist
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Create index for active items
CREATE INDEX IF NOT EXISTS idx_inventory_items_active ON inventory_items(is_active);

-- Show final structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'inventory_items'
ORDER BY ordinal_position;
