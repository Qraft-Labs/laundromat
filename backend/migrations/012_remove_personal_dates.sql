-- Remove birthday/anniversary columns from customers (not needed for business)
-- Keep sms_opt_in for promotional messages

ALTER TABLE customers 
DROP COLUMN IF EXISTS birthday,
DROP COLUMN IF EXISTS anniversary,
DROP COLUMN IF EXISTS other_special_dates;

-- Customers table now only has business-relevant fields:
-- id, customer_id (auto-generated), name, phone, email, location, notes, sms_opt_in, customer_type

COMMENT ON COLUMN customers.sms_opt_in IS 'Whether customer opted in for promotional SMS about offers and discounts';
COMMENT ON COLUMN customers.customer_type IS 'Type: INDIVIDUAL or BUSINESS';
