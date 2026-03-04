-- Add missing columns to orders table
-- These columns are required for:
-- 1. pickup_date: Track when customer picks up delivered order
-- 2. payment_method: Track payment method (CASH, MOBILE_MONEY, etc.)

BEGIN;

-- Add pickup_date column
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS pickup_date TIMESTAMP;

-- Add payment_method column
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);

-- Add comments for documentation
COMMENT ON COLUMN orders.pickup_date IS 'Timestamp when customer picked up the order (auto-set when status changes to DELIVERED)';
COMMENT ON COLUMN orders.payment_method IS 'Payment method: CASH, MTN_MOBILE_MONEY, AIRTEL_MOBILE_MONEY, BANK_TRANSFER, ON_ACCOUNT';

-- Add transaction_reference column if it doesn't exist (for mobile money references)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS transaction_reference VARCHAR(100);

COMMENT ON COLUMN orders.transaction_reference IS 'Mobile money transaction reference or bank transfer reference';

-- Add invoice_number column if it doesn't exist
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS invoice_number VARCHAR(50);

COMMENT ON COLUMN orders.invoice_number IS 'Unique invoice number (e.g., INV-2026-000001)';

-- Add discount fields if they don't exist
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS discount_percentage NUMERIC(5,2) DEFAULT 0;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10,2) DEFAULT 0;

COMMENT ON COLUMN orders.discount_percentage IS 'Discount percentage applied to order (0-100)';
COMMENT ON COLUMN orders.discount_amount IS 'Calculated discount amount in UGX';

-- Add tax fields if they don't exist
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS tax_rate NUMERIC(5,2) DEFAULT 0;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(10,2) DEFAULT 0;

COMMENT ON COLUMN orders.tax_rate IS 'Tax rate percentage (0-100)';
COMMENT ON COLUMN orders.tax_amount IS 'Calculated tax amount in UGX';

COMMIT;

-- Verify columns were added
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'orders'
AND column_name IN ('pickup_date', 'payment_method', 'transaction_reference', 'invoice_number', 'discount_percentage', 'discount_amount', 'tax_rate', 'tax_amount')
ORDER BY column_name;
