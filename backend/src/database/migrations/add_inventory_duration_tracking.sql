-- Add quantity and duration-based tracking fields to inventory_items table

ALTER TABLE inventory_items
ADD COLUMN IF NOT EXISTS max_stock_quantity DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS expected_duration_value DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS expected_duration_unit VARCHAR(20) CHECK (expected_duration_unit IN ('DAYS', 'WEEKS', 'MONTHS', 'YEARS')),
ADD COLUMN IF NOT EXISTS is_long_term BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS low_stock_threshold_percent DECIMAL(5, 2) DEFAULT 20;

-- Add comments to explain the smart tracking system
COMMENT ON COLUMN inventory_items.max_stock_quantity IS 'Maximum stock quantity typically maintained (e.g., 100 liters)';
COMMENT ON COLUMN inventory_items.expected_duration_value IS 'Expected duration value that max stock should last (e.g., 3 for "3 months")';
COMMENT ON COLUMN inventory_items.expected_duration_unit IS 'Unit for expected duration: DAYS, WEEKS, MONTHS, or YEARS';
COMMENT ON COLUMN inventory_items.is_long_term IS 'If true, item will not trigger low stock alerts (equipment/tools)';
COMMENT ON COLUMN inventory_items.low_stock_threshold_percent IS 'Percentage of max stock to trigger low stock alert (default 20%)';

-- Remove old column if it exists
ALTER TABLE inventory_items DROP COLUMN IF EXISTS low_stock_alert_days;
