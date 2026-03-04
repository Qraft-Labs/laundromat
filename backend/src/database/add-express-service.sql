-- Update service_type constraint to allow EXPRESS
-- Drop old constraint
ALTER TABLE order_items 
DROP CONSTRAINT IF EXISTS order_items_service_type_check;

-- Add new constraint with EXPRESS included
ALTER TABLE order_items
ADD CONSTRAINT order_items_service_type_check 
CHECK (service_type IN ('wash', 'iron', 'express', 'WASH', 'IRON', 'EXPRESS'));

-- Comment for documentation
COMMENT ON COLUMN order_items.service_type IS 'Service type: wash (normal), iron (ironing only), or express (urgent - double price)';
