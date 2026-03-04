-- Add missing columns to customers table

-- Add customer_type column if it doesn't exist
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS customer_type VARCHAR(20) DEFAULT 'INDIVIDUAL' CHECK (customer_type IN ('INDIVIDUAL', 'BUSINESS'));

-- Add sms_opt_in column if it doesn't exist
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS sms_opt_in BOOLEAN DEFAULT true;

-- Update existing customers to have default values
UPDATE customers 
SET customer_type = 'INDIVIDUAL' 
WHERE customer_type IS NULL;

UPDATE customers 
SET sms_opt_in = true 
WHERE sms_opt_in IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN customers.customer_type IS 'Type of customer: INDIVIDUAL or BUSINESS';
COMMENT ON COLUMN customers.sms_opt_in IS 'Whether customer has opted in to receive SMS notifications';
