-- Migration: Add delivery_revenue column to deliveries table
-- Purpose: Track actual revenue from PAID deliveries vs FREE promotional deliveries
-- Date: 2024

-- Add delivery_revenue column
ALTER TABLE deliveries 
ADD COLUMN delivery_revenue NUMERIC(10,2) DEFAULT 0;

-- Add comment explaining the column
COMMENT ON COLUMN deliveries.delivery_revenue IS 'Amount customer pays for delivery service. PAID deliveries have value > 0, FREE deliveries = 0';

-- Update existing records to have 0 revenue (assuming historical deliveries need backfilling)
UPDATE deliveries SET delivery_revenue = 0 WHERE delivery_revenue IS NULL;

-- Create index for revenue queries (dashboard analytics)
CREATE INDEX idx_deliveries_revenue ON deliveries(delivery_revenue);

-- Add check constraint to ensure revenue is non-negative
ALTER TABLE deliveries 
ADD CONSTRAINT chk_delivery_revenue_positive CHECK (delivery_revenue >= 0);
