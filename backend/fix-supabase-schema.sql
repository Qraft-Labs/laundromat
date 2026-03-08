-- ========================================
-- COMPLETE SCHMA FIX FOR SUPABASE
-- Run this in Supabase SQL Editor
-- Fixes ALL missing tables and columns
-- ========================================

BEGIN;

-- ========================================
-- 1. ADD MISSING COLUMNS TO ORDERS TABLE
-- ========================================

-- Payment tracking columns
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'UNPAID';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS amount_paid INTEGER DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_amount INTEGER DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS balance INTEGER DEFAULT 0;

-- Date and reference columns
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pickup_date DATE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS transaction_reference VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS invoice_number VARCHAR(50);

-- Discount columns
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_percentage NUMERIC(5,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount INTEGER DEFAULT 0;

-- Tax columns
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_rate NUMERIC(5,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_amount INTEGER DEFAULT 0;

-- Additional tracking
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_status VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS express_service BOOLEAN DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id);

-- ========================================
-- 2. ADD MISSING COLUMNS TO PRICE_ITEMS TABLE
-- ========================================

ALTER TABLE price_items ADD COLUMN IF NOT EXISTS discount_percentage NUMERIC(5,2) DEFAULT 0;
ALTER TABLE price_items ADD COLUMN IF NOT EXISTS discount_start_date DATE;
ALTER TABLE price_items ADD COLUMN IF NOT EXISTS discount_end_date DATE;
ALTER TABLE price_items ADD COLUMN IF NOT EXISTS express_price INTEGER;

-- ========================================
-- 3. CREATE PAYMENTS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount > 0),
  payment_method VARCHAR(50) NOT NULL,
  transaction_reference VARCHAR(255),
  payment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_payment_method ON payments(payment_method);

-- ========================================
-- 4. CREATE NOTIFICATIONS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- ========================================
-- 5. CREATE BUSINESS_SETTINGS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS business_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by INTEGER REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_business_settings_key ON business_settings(setting_key);

-- Insert default settings
INSERT INTO business_settings (setting_key, setting_value, updated_at)
VALUES 
  ('business_info', '{"name": "Lush Dry Cleaners & Laundromat", "phone": "+256 754 723 614", "email": "info@lushdrycleaners.ug", "location": "Mbarara, Uganda", "address": "Mbarara City", "tin": ""}', NOW()),
  ('business_hours', '{"monday": {"open": "07:00", "close": "21:00", "closed": false}, "tuesday": {"open": "07:00", "close": "21:00", "closed": false}, "wednesday": {"open": "07:00", "close": "21:00", "closed": false}, "thursday": {"open": "07:00", "close": "21:00", "closed": false}, "friday": {"open": "07:00", "close": "21:00", "closed": false}, "saturday": {"open": "07:00", "close": "21:00", "closed": false}, "sunday": {"open": "09:00", "close": "15:00", "closed": false}}', NOW())
ON CONFLICT (setting_key) DO NOTHING;

-- ========================================
-- 6. CREATE DELIVERIES TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS deliveries (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  pickup_address TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_revenue INTEGER DEFAULT 0,
  delivery_date TIMESTAMP,
  delivery_status VARCHAR(50) DEFAULT 'PENDING',
  driver_name VARCHAR(255),
  driver_phone VARCHAR(50),
  notes TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_deliveries_order_id ON deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_delivery_status ON deliveries(delivery_status);
CREATE INDEX IF NOT EXISTS idx_deliveries_delivery_date ON deliveries(delivery_date);

-- ========================================
-- 7. CREATE BACKUP_ATTEMPTS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS backup_attempts (
  id SERIAL PRIMARY KEY,
  backup_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  file_path TEXT,
  file_size BIGINT,
  error_message TEXT,
  triggered_by VARCHAR(100),
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  duration_ms INTEGER
);

CREATE INDEX IF NOT EXISTS idx_backup_attempts_backup_type ON backup_attempts(backup_type);
CREATE INDEX IF NOT EXISTS idx_backup_attempts_status ON backup_attempts(status);
CREATE INDEX IF NOT EXISTS idx_backup_attempts_started_at ON backup_attempts(started_at DESC);

-- ========================================
-- 8. UPDATE EXISTING DATA (SYNC COLUMNS)
-- ========================================

-- Sync order_status with status column (if both exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'status') THEN
        UPDATE orders SET order_status = status WHERE order_status IS NULL;
    END IF;
END $$;

-- Set total_amount from total column (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'total') THEN
        UPDATE orders SET total_amount = total WHERE total_amount = 0 OR total_amount IS NULL;
    END IF;
END $$;

-- Calculate balance for existing orders
UPDATE orders 
SET balance = COALESCE(total_amount, 0) - COALESCE(amount_paid, 0)
WHERE balance = 0 OR balance IS NULL;

-- Update payment_status based on balance
UPDATE orders 
SET payment_status = CASE
    WHEN balance <= 0 THEN 'PAID'
    WHEN amount_paid = 0 THEN 'UNPAID'
    ELSE 'PARTIAL'
END
WHERE payment_status IS NULL OR payment_status = 'UNPAID';

COMMIT;

-- ========================================
-- 9. VERIFICATION QUERIES
-- ========================================

-- Show orders table columns
SELECT 
    'orders' as table_name, 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'orders'
AND column_name IN ('payment_status', 'amount_paid', 'total_amount', 'balance', 'payment_method', 'discount_percentage')
ORDER BY column_name;

-- Show price_items columns
SELECT 
    'price_items' as table_name,
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'price_items'
AND column_name IN ('discount_percentage', 'express_price')
ORDER BY column_name;

-- Check tables exist
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('payments', 'notifications', 'business_settings', 'deliveries', 'backup_attempts') 
        THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN ('orders', 'customers', 'price_items', 'payments', 'notifications', 'business_settings', 'deliveries', 'backup_attempts')
ORDER BY table_name;

-- Count rows
SELECT 
    'Users' as table_name, COUNT(*) as row_count FROM users
UNION ALL
SELECT 'Customers', COUNT(*) FROM customers
UNION ALL
SELECT 'Price Items', COUNT(*) FROM price_items
UNION ALL
SELECT 'Orders', COUNT(*) FROM orders
UNION ALL
SELECT 'Payments', COUNT(*) FROM payments
UNION ALL
SELECT 'Notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'Business Settings', COUNT(*) FROM business_settings;
