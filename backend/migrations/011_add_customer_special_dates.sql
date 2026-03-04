-- Add special dates columns to customers table for SMS campaigns

ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS birthday DATE,
ADD COLUMN IF NOT EXISTS anniversary DATE,
ADD COLUMN IF NOT EXISTS other_special_dates JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS sms_opt_in BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS customer_type VARCHAR(50) DEFAULT 'INDIVIDUAL';

-- Create indexes for querying special dates
CREATE INDEX IF NOT EXISTS idx_customers_birthday ON customers(birthday);
CREATE INDEX IF NOT EXISTS idx_customers_anniversary ON customers(anniversary);
CREATE INDEX IF NOT EXISTS idx_customers_sms_opt_in ON customers(sms_opt_in);
CREATE INDEX IF NOT EXISTS idx_customers_customer_type ON customers(customer_type);

COMMENT ON COLUMN customers.birthday IS 'Customer birthday for special offers and greetings';
COMMENT ON COLUMN customers.anniversary IS 'Customer anniversary date (wedding, business, etc.)';
COMMENT ON COLUMN customers.other_special_dates IS 'JSON array of other special dates with labels: [{"date":"2024-01-15","label":"Child Birthday"}]';
COMMENT ON COLUMN customers.sms_opt_in IS 'Whether customer opted in for SMS notifications and offers';
COMMENT ON COLUMN customers.customer_type IS 'Type: INDIVIDUAL or BUSINESS';
