-- ========================================
-- RUN THIS IN pgAdmin Query Tool
-- Database: laundry_db
-- ========================================

-- 1. Add delivery_revenue column
ALTER TABLE deliveries 
ADD COLUMN IF NOT EXISTS delivery_revenue NUMERIC(10,2) DEFAULT 0;

-- 2. Add comment
COMMENT ON COLUMN deliveries.delivery_revenue IS 
  'Amount customer pays for delivery service. PAID deliveries have value > 0, FREE deliveries = 0';

-- 3. Update existing records
UPDATE deliveries SET delivery_revenue = 0 WHERE delivery_revenue IS NULL;

-- 4. Create index for analytics (speeds up revenue queries)
CREATE INDEX IF NOT EXISTS idx_deliveries_revenue ON deliveries(delivery_revenue);

-- 5. Add constraint to ensure non-negative revenue
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_delivery_revenue_positive'
  ) THEN
    ALTER TABLE deliveries 
    ADD CONSTRAINT chk_delivery_revenue_positive CHECK (delivery_revenue >= 0);
  END IF;
END $$;

-- 6. Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'deliveries' AND column_name = 'delivery_revenue';

-- Success message
SELECT 'Migration completed successfully! delivery_revenue column added.' AS status;
