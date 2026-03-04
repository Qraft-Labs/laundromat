-- Add payment channel classification to distinguish transaction types
-- Based on MTN MoMo API and Airtel Money API standards

-- Add payment_channel column to payments table
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS payment_channel VARCHAR(50) DEFAULT 'MANUAL';

-- Add merchant_id column for merchant code payments
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS merchant_id VARCHAR(100);

-- Add sender_phone for P2P tracking
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS sender_phone VARCHAR(20);

-- Add recipient_account to track which business account received payment
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS recipient_account VARCHAR(20);

-- Add account_name for easy identification
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS account_name VARCHAR(100);

-- Update existing records to MANUAL (since they were manually entered)
UPDATE payments 
SET payment_channel = 'MANUAL'
WHERE payment_channel IS NULL;

-- Make payment_channel NOT NULL after setting defaults
ALTER TABLE payments
ALTER COLUMN payment_channel SET NOT NULL;

-- Create indexes for efficient queries (AFTER columns are created)
CREATE INDEX IF NOT EXISTS idx_payments_channel ON payments(payment_channel);
CREATE INDEX IF NOT EXISTS idx_payments_recipient_account ON payments(recipient_account);

COMMENT ON TABLE payments IS 'Complete payment transaction history. Distinguishes between P2P deposits, merchant payments, and API-initiated transactions for proper reconciliation and compliance.';

-- Sample business accounts setup (adjust these to your actual accounts)
COMMENT ON COLUMN payments.recipient_account IS 'Examples: 0772123456 (MTN Main), 0777999888 (MTN Secondary), 0755123456 (Airtel Main)';
