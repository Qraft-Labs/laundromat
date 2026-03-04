-- ============================================================
-- RESTORE MISSING COLUMNS FROM ORIGINAL SCHEMA
-- ============================================================
-- This migration restores columns that were in the original
-- GitHub repository but are missing from the current database
-- ============================================================

-- ============================================================
-- 1. FIX ORDERS TABLE
-- ============================================================

-- Add missing columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10, 2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS balance DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS due_date DATE;

-- Copy 'total' to 'total_amount' if total_amount doesn't exist
UPDATE orders 
SET total_amount = total 
WHERE total_amount IS NULL AND total IS NOT NULL;

-- Calculate balance for existing orders
UPDATE orders 
SET balance = COALESCE(total_amount, 0) - COALESCE(amount_paid, 0)
WHERE balance IS NULL OR balance = 0;

-- Add constraints
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_total_amount_check;
ALTER TABLE orders ADD CONSTRAINT orders_total_amount_check CHECK (total_amount >= 0);

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_balance_check;
ALTER TABLE orders ADD CONSTRAINT orders_balance_check CHECK (balance >= 0);

-- ============================================================
-- 2. FIX INVENTORY TABLE SCHEMA
-- ============================================================

-- Check if we need to rename columns or add them
DO $$
BEGIN
    -- Add item_name if it doesn't exist (map from 'name')
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory_items' AND column_name = 'item_name') THEN
        -- If 'name' exists, rename it; otherwise create it
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory_items' AND column_name = 'name') THEN
            ALTER TABLE inventory_items RENAME COLUMN name TO item_name;
        ELSE
            ALTER TABLE inventory_items ADD COLUMN item_name VARCHAR(255);
        END IF;
    END IF;

    -- Add quantity if it doesn't exist (map from 'current_stock')
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory_items' AND column_name = 'quantity') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory_items' AND column_name = 'current_stock') THEN
            ALTER TABLE inventory_items RENAME COLUMN current_stock TO quantity;
        ELSE
            ALTER TABLE inventory_items ADD COLUMN quantity INTEGER DEFAULT 0;
        END IF;
    END IF;

    -- Add unit_cost if it doesn't exist (map from 'unit_price')
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory_items' AND column_name = 'unit_cost') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory_items' AND column_name = 'unit_price') THEN
            ALTER TABLE inventory_items RENAME COLUMN unit_price TO unit_cost;
        ELSE
            ALTER TABLE inventory_items ADD COLUMN unit_cost DECIMAL(10, 2);
        END IF;
    END IF;

    -- Add reorder_level if it doesn't exist (map from 'min_stock_level')
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory_items' AND column_name = 'reorder_level') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory_items' AND column_name = 'min_stock_level') THEN
            ALTER TABLE inventory_items RENAME COLUMN min_stock_level TO reorder_level;
        ELSE
            ALTER TABLE inventory_items ADD COLUMN reorder_level INTEGER DEFAULT 0;
        END IF;
    END IF;

    -- Add last_restocked if it doesn't exist (map from 'last_restock_date')
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory_items' AND column_name = 'last_restocked') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory_items' AND column_name = 'last_restock_date') THEN
            ALTER TABLE inventory_items RENAME COLUMN last_restock_date TO last_restocked;
        ELSE
            ALTER TABLE inventory_items ADD COLUMN last_restocked TIMESTAMP;
        END IF;
    END IF;
END $$;

-- Add missing columns that don't have equivalents
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS supplier VARCHAR(255);
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add constraints
ALTER TABLE inventory_items DROP CONSTRAINT IF EXISTS inventory_items_quantity_check;
ALTER TABLE inventory_items ADD CONSTRAINT inventory_items_quantity_check CHECK (quantity >= 0);

ALTER TABLE inventory_items DROP CONSTRAINT IF EXISTS inventory_items_unit_cost_check;
ALTER TABLE inventory_items ADD CONSTRAINT inventory_items_unit_cost_check CHECK (unit_cost >= 0);

-- Make item_name unique
ALTER TABLE inventory_items DROP CONSTRAINT IF EXISTS inventory_items_item_name_key;
ALTER TABLE inventory_items ADD CONSTRAINT inventory_items_item_name_key UNIQUE (item_name);

-- ============================================================
-- 3. CREATE MISSING INDEXES
-- ============================================================

-- Inventory indexes
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_items_quantity ON inventory_items(quantity);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_due_date ON orders(due_date);

-- ============================================================
-- VERIFICATION
-- ============================================================

-- Show updated orders table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- Show updated inventory table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'inventory_items'
ORDER BY ordinal_position;

COMMIT;
