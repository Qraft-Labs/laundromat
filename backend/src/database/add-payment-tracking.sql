-- Add payment tracking fields to deliveries table
-- This allows manual recording of payment when customer pays for delivery

ALTER TABLE deliveries 
ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),  -- 'CASH', 'MOBILE_MONEY', 'CARD', 'BANK_TRANSFER'
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'PENDING',  -- 'PENDING', 'PAID', 'PARTIAL', 'REFUNDED'
ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS payment_notes TEXT;

-- Add index for payment queries
CREATE INDEX IF NOT EXISTS idx_deliveries_payment_status ON deliveries(payment_status);
CREATE INDEX IF NOT EXISTS idx_deliveries_payment_date ON deliveries(payment_date);

-- Update existing delivered deliveries to have payment recorded
UPDATE deliveries 
SET 
  payment_amount = delivery_cost,
  payment_method = 'CASH',
  payment_status = 'PAID',
  payment_date = delivered_at
WHERE 
  delivery_status = 'DELIVERED' 
  AND payment_amount IS NULL;

COMMENT ON COLUMN deliveries.payment_amount IS 'Actual amount paid by customer (may differ from delivery_cost due to discounts/tips)';
COMMENT ON COLUMN deliveries.payment_method IS 'Payment method: CASH, MOBILE_MONEY, CARD, BANK_TRANSFER';
COMMENT ON COLUMN deliveries.payment_status IS 'Payment status: PENDING (not paid), PAID (fully paid), PARTIAL (partially paid), REFUNDED';
COMMENT ON COLUMN deliveries.payment_date IS 'Timestamp when payment was received';
COMMENT ON COLUMN deliveries.payment_notes IS 'Additional notes about the payment (e.g., discount reason, tip amount)';
