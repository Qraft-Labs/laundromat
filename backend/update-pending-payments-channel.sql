-- Update pending_payments table to include payment channel info
-- When API is connected, these fields auto-populate

-- Add payment channel fields
ALTER TABLE pending_payments
ADD COLUMN IF NOT EXISTS payment_channel VARCHAR(50) DEFAULT 'MERCHANT';

ALTER TABLE pending_payments
ADD COLUMN IF NOT EXISTS recipient_account VARCHAR(20);

ALTER TABLE pending_payments
ADD COLUMN IF NOT EXISTS merchant_id VARCHAR(100);

-- Add comment
COMMENT ON COLUMN pending_payments.payment_channel IS 'Always MERCHANT for API payments (API = merchant account). Only P2P if manually recorded non-merchant transaction.';
COMMENT ON COLUMN pending_payments.recipient_account IS 'Business account that received payment. Auto-filled from API config when API integrated.';
COMMENT ON COLUMN pending_payments.merchant_id IS 'Merchant shortcode (e.g., 1234567). Auto-filled from API config.';

-- Update existing pending payments (if any) to MERCHANT
UPDATE pending_payments
SET payment_channel = 'MERCHANT'
WHERE payment_channel IS NULL;

-- Make payment_channel NOT NULL
ALTER TABLE pending_payments
ALTER COLUMN payment_channel SET NOT NULL;

-- Create index
CREATE INDEX IF NOT EXISTS idx_pending_payments_channel ON pending_payments(payment_channel);
CREATE INDEX IF NOT EXISTS idx_pending_payments_recipient_account ON pending_payments(recipient_account);
