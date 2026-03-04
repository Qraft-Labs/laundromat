-- Add express_price column to price_items table
-- NULL = automatic (2x wash price)
-- Number = custom express price

ALTER TABLE price_items 
ADD COLUMN IF NOT EXISTS express_price DECIMAL(10, 2) DEFAULT NULL;

COMMENT ON COLUMN price_items.express_price IS 'Custom express price. If NULL, auto-calculates as 2x wash price. If set, uses this value instead.';
