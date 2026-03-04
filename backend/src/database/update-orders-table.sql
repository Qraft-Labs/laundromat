-- Update orders table for new order management system
-- Adds payment tracking, pickup dates, and order status

-- Add new columns
ALTER TABLE orders
  -- Rename and modify discount columns
  ADD COLUMN IF NOT EXISTS discount_percentage DECIMAL(5,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_amount INTEGER DEFAULT 0,
  
  -- Rename total to total_amount
  ADD COLUMN IF NOT EXISTS total_amount INTEGER NOT NULL DEFAULT 0,
  
  -- Add payment tracking
  ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'UNPAID',
  ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'CASH',
  ADD COLUMN IF NOT EXISTS amount_paid INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS balance INTEGER DEFAULT 0,
  
  -- Add order status (separate from payment status)
  ADD COLUMN IF NOT EXISTS order_status VARCHAR(20) DEFAULT 'RECEIVED',
  
  -- Add pickup date (replaces due_date)
  ADD COLUMN IF NOT EXISTS pickup_date DATE;

-- Update constraints
ALTER TABLE orders
  ADD CONSTRAINT chk_payment_status 
    CHECK (payment_status IN ('PAID', 'UNPAID', 'PARTIAL'));

ALTER TABLE orders
  ADD CONSTRAINT chk_order_status
    CHECK (order_status IN ('RECEIVED', 'PROCESSING', 'READY', 'DELIVERED', 'CANCELLED'));

-- If total_amount is 0, copy from total
UPDATE orders SET total_amount = total WHERE total_amount = 0;

-- If pickup_date is null, copy from due_date
UPDATE orders SET pickup_date = due_date WHERE pickup_date IS NULL;

-- Drop old status column if it exists (conflicts with new order_status)
ALTER TABLE orders DROP COLUMN IF EXISTS status CASCADE;

-- Optional: Drop old columns after data migration
-- ALTER TABLE orders DROP COLUMN IF EXISTS total;
-- ALTER TABLE orders DROP COLUMN IF EXISTS due_date;
-- ALTER TABLE orders DROP COLUMN IF EXISTS discount;
-- ALTER TABLE orders DROP COLUMN IF EXISTS tax;

COMMENT ON COLUMN orders.payment_status IS 'Payment status: PAID, UNPAID, or PARTIAL';
COMMENT ON COLUMN orders.payment_method IS 'Payment method: CASH, MOBILE_MONEY_MTN, MOBILE_MONEY_AIRTEL, BANK_TRANSFER, ON_ACCOUNT';
COMMENT ON COLUMN orders.order_status IS 'Order status: RECEIVED, PROCESSING, READY, DELIVERED, CANCELLED';
COMMENT ON COLUMN orders.pickup_date IS 'Expected pickup date for the order';
