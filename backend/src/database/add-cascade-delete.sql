-- Add CASCADE delete for customer orders
-- When a customer is deleted, all their orders and order items are also deleted

-- First, drop existing foreign key constraint if it exists
ALTER TABLE orders 
DROP CONSTRAINT IF EXISTS orders_customer_id_fkey;

-- Add new foreign key with CASCADE delete
ALTER TABLE orders
ADD CONSTRAINT orders_customer_id_fkey 
FOREIGN KEY (customer_id) 
REFERENCES customers(id) 
ON DELETE CASCADE;

-- Ensure order_items also cascade when orders are deleted
ALTER TABLE order_items
DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;

ALTER TABLE order_items
ADD CONSTRAINT order_items_order_id_fkey
FOREIGN KEY (order_id)
REFERENCES orders(id)
ON DELETE CASCADE;

COMMENT ON CONSTRAINT orders_customer_id_fkey ON orders IS 
'Cascade delete: When customer is deleted, all their orders are also deleted';

COMMENT ON CONSTRAINT order_items_order_id_fkey ON order_items IS
'Cascade delete: When order is deleted, all its items are also deleted';
