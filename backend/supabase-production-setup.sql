-- ========================================
-- LUSH LAUNDRY - COMPLETE PRODUCTION SETUP
-- Run this ONE script in Supabase SQL Editor
-- Does everything: Schema → Price Items → Cleanup
-- ========================================
-- 
-- WHAT THIS SCRIPT DOES:
-- 1. Fixes all missing tables and columns
-- 2. Loads 88 price items (service catalog)
-- 3. Removes all test data (keeps admin + prices)
-- 
-- RESULT: Clean production database ready for real customers
-- ========================================

BEGIN;

-- ========================================
-- PART 1: FIX SCHEMA - ADD MISSING TABLES & COLUMNS
-- ========================================

DO $$ 
BEGIN 
    RAISE NOTICE '🔧 PART 1: Fixing database schema...';
END $$;

-- Fix user_role enum to include MANAGER, DESKTOP_AGENT, USER
DO $$ 
BEGIN
    -- Add MANAGER if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'MANAGER' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
    ) THEN
        ALTER TYPE user_role ADD VALUE 'MANAGER';
    END IF;
    
    -- Add DESKTOP_AGENT if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'DESKTOP_AGENT' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
    ) THEN
        ALTER TYPE user_role ADD VALUE 'DESKTOP_AGENT';
    END IF;
    
    -- Add USER if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'USER' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
    ) THEN
        ALTER TYPE user_role ADD VALUE 'USER';
    END IF;
END $$;

-- Add missing columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS bargain_amount INTEGER DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'UNPAID';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS amount_paid INTEGER DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_amount INTEGER DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS balance INTEGER DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pickup_date DATE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS transaction_reference VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS invoice_number VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_percentage NUMERIC(5,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount INTEGER DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_rate NUMERIC(5,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_amount INTEGER DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_status VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS express_service BOOLEAN DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id);

-- Add missing columns to price_items table
ALTER TABLE price_items ADD COLUMN IF NOT EXISTS discount_percentage NUMERIC(5,2) DEFAULT 0;
ALTER TABLE price_items ADD COLUMN IF NOT EXISTS discount_start_date DATE;
ALTER TABLE price_items ADD COLUMN IF NOT EXISTS discount_end_date DATE;
ALTER TABLE price_items ADD COLUMN IF NOT EXISTS express_price INTEGER;

-- Add missing columns to customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS customer_type VARCHAR(20) DEFAULT 'INDIVIDUAL' CHECK (customer_type IN ('INDIVIDUAL', 'BUSINESS'));

-- Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS max_bargain_amount INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(500);
ALTER TABLE users ADD COLUMN IF NOT EXISTS session_timeout_minutes INTEGER DEFAULT 15 CHECK (session_timeout_minutes BETWEEN 5 AND 30);
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(20) DEFAULT 'LOCAL' CHECK (auth_provider IN ('LOCAL', 'GOOGLE'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

-- Add missing columns to customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS sms_opt_in BOOLEAN DEFAULT true;

-- Create payments table (drop and recreate to ensure correct schema)
DROP TABLE IF EXISTS payments CASCADE;

CREATE TABLE payments (
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
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- Refund tracking columns
  is_refund BOOLEAN DEFAULT FALSE,
  refund_reason TEXT,
  refunded_payment_id INTEGER REFERENCES payments(id),
  refund_date TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_is_refund ON payments(is_refund);
CREATE INDEX IF NOT EXISTS idx_payments_refunded_payment_id ON payments(refunded_payment_id);

-- Create notifications table (drop and recreate to ensure correct schema)
DROP TABLE IF EXISTS notifications CASCADE;

CREATE TABLE notifications (
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

-- Create business_settings table
CREATE TABLE IF NOT EXISTS business_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by INTEGER REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_business_settings_key ON business_settings(setting_key);

-- Insert default business settings
INSERT INTO business_settings (setting_key, setting_value, updated_at)
VALUES 
  ('business_info', '{"name": "Lush Dry Cleaners & Laundromat", "phone": "+256 754 723 614", "email": "info@lushdrycleaners.ug", "location": "Mbarara, Uganda", "address": "Mbarara City", "tin": ""}', NOW()),
  ('business_hours', '{"monday": {"open": "07:00", "close": "21:00", "closed": false}, "tuesday": {"open": "07:00", "close": "21:00", "closed": false}, "wednesday": {"open": "07:00", "close": "21:00", "closed": false}, "thursday": {"open": "07:00", "close": "21:00", "closed": false}, "friday": {"open": "07:00", "close": "21:00", "closed": false}, "saturday": {"open": "07:00", "close": "21:00", "closed": false}, "sunday": {"open": "09:00", "close": "15:00", "closed": false}}', NOW())
ON CONFLICT (setting_key) DO NOTHING;

-- Create expenses table (drop and recreate to ensure correct schema)
DROP TABLE IF EXISTS expenses CASCADE;

CREATE TABLE expenses (
  id SERIAL PRIMARY KEY,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (amount >= 0),
  payment_method VARCHAR(50) DEFAULT 'CASH',
  receipt_number VARCHAR(100),
  submitted_by INTEGER REFERENCES users(id) ON DELETE RESTRICT,
  approved_by INTEGER REFERENCES users(id) ON DELETE RESTRICT,
  status VARCHAR(50) DEFAULT 'PENDING',
  notes TEXT,
  approval_status VARCHAR(50) DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_submitted_by ON expenses(submitted_by);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);

-- Create delivery_zones table (for delivery pricing)
CREATE TABLE IF NOT EXISTS delivery_zones (
  id SERIAL PRIMARY KEY,
  zone_name VARCHAR(255) NOT NULL,
  zone_code VARCHAR(50) UNIQUE NOT NULL,
  base_delivery_cost INTEGER DEFAULT 0,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_delivery_zones_active ON delivery_zones(is_active);

-- Create delivery_drivers table
CREATE TABLE IF NOT EXISTS delivery_drivers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  vehicle_type VARCHAR(100),
  vehicle_number VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_delivery_drivers_active ON delivery_drivers(is_active);

-- Create deliveries table (drop and recreate to ensure correct schema)
DROP TABLE IF EXISTS deliveries CASCADE;

CREATE TABLE deliveries (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  delivery_type VARCHAR(50) NOT NULL DEFAULT 'FREE',
  delivery_revenue INTEGER DEFAULT 0,
  delivery_cost INTEGER DEFAULT 0,
  scheduled_date DATE,
  scheduled_time_slot VARCHAR(50),
  delivery_zone_id INTEGER REFERENCES delivery_zones(id) ON DELETE SET NULL,
  driver_id INTEGER REFERENCES delivery_drivers(id) ON DELETE SET NULL,
  pickup_address TEXT,
  delivery_address TEXT NOT NULL,
  delivery_status VARCHAR(50) DEFAULT 'PENDING',
  delivery_notes TEXT,
  delivery_person_name VARCHAR(255),
  vehicle_info VARCHAR(255),
  driver_name VARCHAR(255),
  driver_phone VARCHAR(50),
  notes TEXT,
  delivered_at TIMESTAMP,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_deliveries_order_id ON deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_delivery_status ON deliveries(delivery_status);
CREATE INDEX IF NOT EXISTS idx_deliveries_scheduled_date ON deliveries(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_deliveries_delivery_type ON deliveries(delivery_type);

-- Create inventory tables (drop and recreate to ensure correct schema)
DROP TABLE IF EXISTS inventory_transactions CASCADE;
DROP TABLE IF EXISTS inventory_items CASCADE;

CREATE TABLE inventory_items (
  id SERIAL PRIMARY KEY,
  item_name VARCHAR(255) NOT NULL UNIQUE,
  category VARCHAR(100),
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  unit VARCHAR(50),
  unit_cost INTEGER DEFAULT 0,
  reorder_level INTEGER DEFAULT 0,
  max_stock_quantity DECIMAL(10, 2),
  expected_duration_value DECIMAL(10, 2),
  expected_duration_unit VARCHAR(20) CHECK (expected_duration_unit IN ('DAYS', 'WEEKS', 'MONTHS', 'YEARS')),
  is_long_term BOOLEAN DEFAULT FALSE,
  low_stock_threshold_percent DECIMAL(5, 2) DEFAULT 20,
  is_active BOOLEAN DEFAULT TRUE,
  supplier VARCHAR(255),
  notes TEXT,
  last_restocked TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_items_quantity ON inventory_items(quantity);
CREATE INDEX IF NOT EXISTS idx_inventory_items_active ON inventory_items(is_active);

-- Create inventory_transactions table
CREATE TABLE inventory_transactions (
  id SERIAL PRIMARY KEY,
  item_id INTEGER NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  transaction_type VARCHAR(50) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_cost INTEGER,
  notes TEXT,
  recorded_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inventory_transactions_item_id ON inventory_transactions(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_type ON inventory_transactions(transaction_type);

-- Create pending_payments table (drop and recreate to ensure correct schema)
DROP TABLE IF EXISTS pending_payments CASCADE;

CREATE TABLE pending_payments (
  id SERIAL PRIMARY KEY,
  transaction_reference VARCHAR(255) UNIQUE NOT NULL,
  payment_method VARCHAR(100) NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  sender_phone VARCHAR(50) NOT NULL,
  sender_name VARCHAR(255),
  payment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ASSIGNED', 'REJECTED')),
  assigned_to_order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  assigned_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pending_payments_status ON pending_payments(status);
CREATE INDEX IF NOT EXISTS idx_pending_payments_payment_date ON pending_payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_pending_payments_sender_phone ON pending_payments(sender_phone);
CREATE INDEX IF NOT EXISTS idx_pending_payments_transaction_ref ON pending_payments(transaction_reference);

-- Create whatsapp_messages table (drop and recreate to ensure correct schema)
DROP TABLE IF EXISTS whatsapp_messages CASCADE;

CREATE TABLE whatsapp_messages (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
  phone_number VARCHAR(20) NOT NULL,
  message_text TEXT NOT NULL,
  message_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  whatsapp_message_id VARCHAR(100),
  cost_ugx DECIMAL(10,2) DEFAULT 193.00,
  sent_at TIMESTAMP DEFAULT NOW(),
  delivered_at TIMESTAMP,
  read_at TIMESTAMP,
  error_message TEXT,
  is_bulk BOOLEAN DEFAULT false,
  campaign_name VARCHAR(255),
  recipient_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_customer_id ON whatsapp_messages(customer_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_status ON whatsapp_messages(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_sent_at ON whatsapp_messages(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_whatsapp_id ON whatsapp_messages(whatsapp_message_id);

-- Create automation_settings table (drop and recreate to ensure correct schema)
DROP TABLE IF EXISTS automation_settings CASCADE;

CREATE TABLE automation_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INTEGER REFERENCES users(id)
);

-- Insert default automation settings
INSERT INTO automation_settings (setting_key, setting_value, description) VALUES
  ('whatsapp_auto_send_receipt', true, 'Automatically send WhatsApp receipt when order is created'),
  ('whatsapp_auto_send_ready', true, 'Automatically send WhatsApp notification when order is ready'),
  ('whatsapp_auto_send_delivered', false, 'Automatically send WhatsApp confirmation when order is delivered')
ON CONFLICT (setting_key) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_automation_settings_key ON automation_settings(setting_key);

-- Create promotions table (drop and recreate to ensure correct schema)
DROP TABLE IF EXISTS promotions CASCADE;

CREATE TABLE promotions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  discount_percentage NUMERIC(5,2),
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id),
  sms_sent BOOLEAN DEFAULT FALSE,
  sms_sent_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_promotions_status ON promotions(status);
CREATE INDEX IF NOT EXISTS idx_promotions_dates ON promotions(start_date, end_date);

-- Create activity_logs table (drop and recreate to ensure correct schema)
DROP TABLE IF EXISTS activity_logs CASCADE;

CREATE TABLE activity_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  user_email VARCHAR(255),
  user_name VARCHAR(255),
  user_role VARCHAR(50),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id INTEGER,
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  severity VARCHAR(20) DEFAULT 'INFO',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_resource ON activity_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_severity ON activity_logs(severity);

-- Create password_reset_requests table (drop and recreate to ensure correct schema)
DROP TABLE IF EXISTS password_reset_requests CASCADE;

CREATE TABLE password_reset_requests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  requested_at TIMESTAMP NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMP,
  resolved_by INTEGER REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'PENDING',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_password_reset_requests_user_id ON password_reset_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_requests_status ON password_reset_requests(status);
CREATE INDEX IF NOT EXISTS idx_password_reset_requests_resolved_at ON password_reset_requests(resolved_at);

-- Create payroll_employees table (drop and recreate to ensure correct schema)
DROP TABLE IF EXISTS salary_payments CASCADE;
DROP TABLE IF EXISTS payroll_employees CASCADE;

CREATE TABLE payroll_employees (
  id SERIAL PRIMARY KEY,
  employee_name VARCHAR(255) NOT NULL,
  employee_id_number VARCHAR(100) UNIQUE,
  position VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  salary_amount DECIMAL(12, 2) NOT NULL,
  payment_frequency VARCHAR(50) DEFAULT 'MONTHLY',
  bank_account VARCHAR(100),
  bank_name VARCHAR(100),
  hire_date DATE NOT NULL,
  employment_status VARCHAR(50) DEFAULT 'ACTIVE',
  added_by INTEGER REFERENCES users(id) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payroll_employees_status ON payroll_employees(employment_status);
CREATE INDEX IF NOT EXISTS idx_payroll_employees_id_number ON payroll_employees(employee_id_number);

-- Create salary_payments table (payroll payment tracking)
CREATE TABLE salary_payments (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES payroll_employees(id) ON DELETE CASCADE,
  payment_date DATE NOT NULL,
  payment_period VARCHAR(100) NOT NULL,
  amount_paid DECIMAL(12, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  transaction_reference VARCHAR(100),
  deductions DECIMAL(12, 2) DEFAULT 0,
  bonuses DECIMAL(12, 2) DEFAULT 0,
  net_amount DECIMAL(12, 2) NOT NULL,
  paid_by INTEGER REFERENCES users(id) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'PAID',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_salary_payments_date ON salary_payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_salary_payments_employee ON salary_payments(employee_id);
CREATE INDEX IF NOT EXISTS idx_salary_payments_period ON salary_payments(payment_period);

-- Create refund_requests table (drop and recreate to ensure correct schema)
DROP TABLE IF EXISTS refund_requests CASCADE;

CREATE TABLE refund_requests (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  requested_amount INTEGER NOT NULL CHECK (requested_amount > 0),
  refund_reason TEXT NOT NULL CHECK (LENGTH(refund_reason) >= 10),
  payment_method VARCHAR(50) DEFAULT 'CASH',
  transaction_reference VARCHAR(255),
  notes TEXT,
  requested_by INTEGER NOT NULL REFERENCES users(id),
  requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  reviewed_by INTEGER REFERENCES users(id),
  reviewed_at TIMESTAMP,
  rejection_reason TEXT,
  refund_payment_id INTEGER REFERENCES payments(id),
  cancel_order BOOLEAN DEFAULT TRUE,
  target_payment_id INTEGER REFERENCES payments(id),
  refund_type VARCHAR(50) DEFAULT 'transaction',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_refund_requests_order_id ON refund_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_refund_requests_status ON refund_requests(status);
CREATE INDEX IF NOT EXISTS idx_refund_requests_requested_by ON refund_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_refund_requests_reviewed_by ON refund_requests(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_refund_requests_requested_at ON refund_requests(requested_at DESC);

-- Create view for pending refund requests
CREATE OR REPLACE VIEW pending_refund_requests AS
SELECT 
  rr.id,
  rr.order_id,
  o.order_number,
  rr.requested_amount,
  rr.refund_reason,
  rr.payment_method,
  rr.transaction_reference,
  rr.notes,
  rr.status,
  rr.requested_at,
  rr.cancel_order,
  u_requester.email as requested_by_email,
  u_requester.full_name as requested_by_name,
  u_requester.role as requested_by_role,
  o.total_amount as order_total,
  o.amount_paid as order_amount_paid,
  o.balance as order_balance,
  o.payment_status as order_payment_status,
  o.status as order_status,
  c.name as customer_name,
  c.phone as customer_phone,
  c.email as customer_email,
  (o.amount_paid - COALESCE(
    (SELECT SUM(ABS(amount)) 
     FROM payments 
     WHERE order_id = o.id AND is_refund = TRUE), 
    0
  )) as available_for_refund,
  CASE 
    WHEN rr.requested_amount <= (o.amount_paid - COALESCE(
      (SELECT SUM(ABS(amount)) 
       FROM payments 
       WHERE order_id = o.id AND is_refund = TRUE), 
      0
    )) THEN TRUE
    ELSE FALSE
  END as is_valid_amount
FROM refund_requests rr
JOIN orders o ON rr.order_id = o.id
JOIN customers c ON o.customer_id = c.id
JOIN users u_requester ON rr.requested_by = u_requester.id
WHERE rr.status = 'PENDING'
ORDER BY rr.requested_at ASC;

-- Create backup_attempts table (drop and recreate to ensure correct schema)
DROP TABLE IF EXISTS backup_attempts CASCADE;

CREATE TABLE backup_attempts (
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

CREATE INDEX IF NOT EXISTS idx_backup_attempts_status ON backup_attempts(status);
CREATE INDEX IF NOT EXISTS idx_backup_attempts_started_at ON backup_attempts(started_at DESC);

DO $$ 
BEGIN 
    RAISE NOTICE '✅ Schema fixed - all tables and columns added';
END $$;

-- ========================================
-- PART 2: LOAD PRICE ITEMS (88 Services)
-- ========================================

DO $$ 
BEGIN 
    RAISE NOTICE '💰 PART 2: Loading price items (service catalog)...';
END $$;

-- Check if price items already exist
DO $$
DECLARE
    existing_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO existing_count FROM price_items;
    
    IF existing_count > 0 THEN
        RAISE NOTICE '⚠️  Found % existing price items - skipping seed', existing_count;
    ELSE
        -- Insert all 88 price items
        INSERT INTO price_items (item_id, name, category, subcategory, price, ironing_price, is_active) VALUES
        -- GENTS (25 items)
        ('g1', 'Men''s 2pc Suit', 'gents', NULL, 15000, 7500, true),
        ('g2', 'Men''s 3pc Suit', 'gents', NULL, 17000, 8500, true),
        ('g3', 'Trousers', 'gents', NULL, 7500, 3750, true),
        ('g4', 'Jeans', 'gents', NULL, 8000, 4000, true),
        ('g5', 'Trouser Linen', 'gents', NULL, 10000, 5000, true),
        ('g6', 'Coats', 'gents', NULL, 11000, 5500, true),
        ('g7', 'Coat Linen', 'gents', NULL, 13000, 6500, true),
        ('g8', 'Kanzu', 'gents', NULL, 10000, 5000, true),
        ('g9', 'Kaunda Suit', 'gents', NULL, 15000, 7500, true),
        ('g10', 'Track Suit', 'gents', NULL, 11000, 5500, true),
        ('g11', 'Coloured Shirts', 'gents', NULL, 6000, 3000, true),
        ('g12', 'White Shirts', 'gents', NULL, 7000, 3500, true),
        ('g13', 'Shirt Linen', 'gents', NULL, 9000, 4500, true),
        ('g14', 'T-shirt', 'gents', NULL, 6000, 3000, true),
        ('g15', 'Under Shirt', 'gents', NULL, 5000, 2500, true),
        ('g16', 'Tie', 'gents', NULL, 4000, 2000, true),
        ('g17', 'Shorts', 'gents', NULL, 4000, 2000, true),
        ('g18', 'Jacket', 'gents', NULL, 12000, 6000, true),
        ('g19', 'Kagero (Sweater)', 'gents', NULL, 22000, 11000, true),
        ('g20', 'Softcore', 'gents', NULL, 11000, 5500, true),
        ('g21', 'Under Short', 'gents', NULL, 5000, 2500, true),
        ('g22', 'Velvet Jacket', 'gents', NULL, 15000, 7500, true),
        ('g23', 'Jumper/Sweater', 'gents', NULL, 12000, 6000, true),
        ('g24', 'Kufi', 'gents', NULL, 3000, 1500, true),
        ('g25', 'Winter Coat', 'gents', NULL, 6000, 3000, true),
        
        -- LADIES (26 items)
        ('l1', 'Women''s Suit', 'ladies', NULL, 15000, 7500, true),
        ('l2', 'Casual/Romper', 'ladies', NULL, 10000, 5000, true),
        ('l3', 'Dress Long', 'ladies', NULL, 13000, 6500, true),
        ('l4', 'Dress Short', 'ladies', NULL, 10000, 5000, true),
        ('l5', 'Changing Gown (Beaded)', 'ladies', NULL, 15000, 7500, true),
        ('l6', 'Skirt (Ordinary)', 'ladies', NULL, 6000, 3000, true),
        ('l7', 'Skirt Long', 'ladies', NULL, 7000, 3500, true),
        ('l8', 'Blouse (Ordinary)', 'ladies', NULL, 8000, 4000, true),
        ('l9', 'Blouse (Silk)', 'ladies', NULL, 7000, 3500, true),
        ('l10', 'Dress Shirt', 'ladies', NULL, 10000, 5000, true),
        ('l11', 'Casual/Romper Suit', 'ladies', NULL, 14500, 7250, true),
        ('l12', 'Normal Shirt', 'ladies', NULL, 9500, 4750, true),
        ('l13', 'Gomesi-Hanger', 'ladies', NULL, 13000, 6500, true),
        ('l14', 'Gomesi-Silk', 'ladies', NULL, 16000, 8000, true),
        ('l15', 'Normal Burti', 'ladies', NULL, 10500, 5250, true),
        ('l16', 'Long Burti', 'ladies', NULL, 18000, 9000, true),
        ('l17', 'Kitanga Dress Long', 'ladies', NULL, 11000, 5500, true),
        ('l18', 'Kitanga Dress Short', 'ladies', NULL, 8000, 4000, true),
        ('l19', 'Indian Suar', 'ladies', NULL, 20000, 10000, true),
        ('l20', 'Bridal Gown (Small)', 'ladies', NULL, 50000, 25000, true),
        ('l21', 'Bridal Gown (Medium)', 'ladies', NULL, 60000, 30000, true),
        ('l22', 'Bridal Gown (Big)', 'ladies', NULL, 80000, 40000, true),
        ('l23', 'Bridal Gown (Beaded)', 'ladies', NULL, 100000, 50000, true),
        ('l24', 'Women Shirt', 'ladies', NULL, 6000, 3000, true),
        ('l25', 'Bra/Underwear', 'ladies', NULL, 10000, 5000, true),
        ('l26', 'Handbag', 'ladies', NULL, 7000, 3500, true),
        
        -- GENERAL - Bedding (12 items)
        ('h1', 'Bed Cover (Big)', 'general', 'Bedding', 25000, 12500, true),
        ('h2', 'Pillow/Duvet (Medium)', 'general', 'Bedding', 20000, 10000, true),
        ('h3', 'Duvet/Bed (Small)', 'general', 'Bedding', 15000, 7500, true),
        ('h4', 'Bed Sheet/Duvet (Small)', 'general', 'Bedding', 16000, 8000, true),
        ('h5', 'Blanket (Big)', 'general', 'Bedding', 44000, 22000, true),
        ('h6', 'Duvet (Medium)', 'general', 'Bedding', 35000, 17500, true),
        ('h7', 'Blanket (Small)', 'general', 'Bedding', 20000, 10000, true),
        ('h8', 'Bed Sheet (Pair)', 'general', 'Bedding', 11000, 5500, true),
        ('h9', 'Bed Sheet (Pair) Linen', 'general', 'Bedding', 13000, 6500, true),
        ('h22', 'Pillows', 'general', 'Bedding', 10000, 5000, true),
        ('h24', 'Mosquito Net', 'general', 'Bedding', 10000, 5000, true),
        ('h25', 'Pillow Cover (Pair)', 'general', 'Bedding', 6000, 3000, true),
        
        -- GENERAL - Bathroom (2 items)
        ('h10', 'Bath Towel (Small)', 'general', 'Bathroom', 7500, 3750, true),
        ('h11', 'Bath Towel (Big)', 'general', 'Bathroom', 10000, 5000, true),
        
        -- GENERAL - Carpets (4 items)
        ('h12', 'Carpet Rug', 'general', 'Carpet', 22000, 11000, true),
        ('h13', 'Carpet (Small)', 'general', 'Carpet', 40000, 20000, true),
        ('h14', 'Carpet (Medium)', 'general', 'Carpet', 60000, 30000, true),
        ('h15', 'Carpet (Large)', 'general', 'Carpet', 100000, 50000, true),
        
        -- GENERAL - Curtains (5 items)
        ('h17', 'Curtain (Test/Net)', 'general', 'Curtains', 25000, 12500, true),
        ('h18', 'Curtain (Cotton&Top)', 'general', 'Curtains', 8000, 4000, true),
        ('h19', 'Curtain (Light)', 'general', 'Curtains', 15000, 7500, true),
        ('h20', 'Curtain Nets (Fancy)', 'general', 'Curtains', 15000, 7500, true),
        ('h21', 'Curtain Nets (Light)', 'general', 'Curtains', 10000, 5000, true),
        
        -- GENERAL - Home Service (2 items)
        ('h16', 'Chair/Auto Clean/Mop', 'general', 'Home Service', 100000, 0, true),
        ('h23', 'Rug', 'general', 'Home Service', 6000, 3000, true),
        
        -- GENERAL - Special Items (6 items)
        ('h26', 'Graduation Gown', 'general', 'Special', 12000, 6000, true),
        ('h27', 'Trampoline', 'general', 'Special', 8000, 4000, true),
        ('h28', 'Mask', 'general', 'Special', 4000, 2000, true),
        ('h29', 'Irregular Item', 'general', 'Special', 4000, 2000, true),
        ('h30', 'Tie', 'general', 'Special', 2000, 1000, true),
        ('h31', 'Sweater', 'general', 'Special', 5000, 2500, true),
        
        -- KIDS (6 items)
        ('k1', 'Kids Suit', 'kids', NULL, 6000, 3000, true),
        ('k2', 'Kids Dress', 'kids', NULL, 7000, 3500, true),
        ('k3', 'Kids Shirt', 'kids', NULL, 4500, 2250, true),
        ('k4', 'Kids Irregular', 'kids', NULL, 4500, 2250, true),
        ('k5', 'Kids Tie', 'kids', NULL, 2000, 1000, true),
        ('k6', 'Kids Sweater', 'kids', NULL, 5000, 2500, true);
        
        RAISE NOTICE '✅ Loaded 88 price items successfully';
    END IF;
END $$;

-- ========================================
-- PART 3: CLEANUP - REMOVE TEST DATA
-- ========================================

DO $$ 
BEGIN 
    RAISE NOTICE '🧹 PART 3: Cleaning up test data...';
END $$;

-- Delete all test data (keep only admin user and price items)
TRUNCATE TABLE order_items RESTART IDENTITY CASCADE;
TRUNCATE TABLE orders RESTART IDENTITY CASCADE;
TRUNCATE TABLE payments RESTART IDENTITY CASCADE;
TRUNCATE TABLE deliveries RESTART IDENTITY CASCADE;
TRUNCATE TABLE customers RESTART IDENTITY CASCADE;
TRUNCATE TABLE expenses RESTART IDENTITY CASCADE;
TRUNCATE TABLE pending_payments RESTART IDENTITY CASCADE;
TRUNCATE TABLE inventory_transactions RESTART IDENTITY CASCADE;
TRUNCATE TABLE inventory_items RESTART IDENTITY CASCADE;
TRUNCATE TABLE notifications RESTART IDENTITY CASCADE;
TRUNCATE TABLE backup_attempts RESTART IDENTITY CASCADE;
TRUNCATE TABLE whatsapp_messages RESTART IDENTITY CASCADE;
TRUNCATE TABLE promotions RESTART IDENTITY CASCADE;
TRUNCATE TABLE activity_logs RESTART IDENTITY CASCADE;
TRUNCATE TABLE payroll_employees RESTART IDENTITY CASCADE;
TRUNCATE TABLE salary_payments RESTART IDENTITY CASCADE;
TRUNCATE TABLE refund_requests RESTART IDENTITY CASCADE;
TRUNCATE TABLE password_reset_requests RESTART IDENTITY CASCADE;

-- Keep ONLY the admin user
DELETE FROM users WHERE email != 'husseinibram555@gmail.com';

-- Reset sequences for clean IDs
ALTER SEQUENCE customers_id_seq RESTART WITH 1;
ALTER SEQUENCE orders_id_seq RESTART WITH 1;
ALTER SEQUENCE order_items_id_seq RESTART WITH 1;
ALTER SEQUENCE payments_id_seq RESTART WITH 1;
ALTER SEQUENCE deliveries_id_seq RESTART WITH 1;
ALTER SEQUENCE expenses_id_seq RESTART WITH 1;
ALTER SEQUENCE pending_payments_id_seq RESTART WITH 1;
ALTER SEQUENCE inventory_items_id_seq RESTART WITH 1;
ALTER SEQUENCE inventory_transactions_id_seq RESTART WITH 1;
ALTER SEQUENCE notifications_id_seq RESTART WITH 1;
ALTER SEQUENCE whatsapp_messages_id_seq RESTART WITH 1;
ALTER SEQUENCE promotions_id_seq RESTART WITH 1;
ALTER SEQUENCE activity_logs_id_seq RESTART WITH 1;
ALTER SEQUENCE backup_attempts_id_seq RESTART WITH 1;
ALTER SEQUENCE payroll_employees_id_seq RESTART WITH 1;
ALTER SEQUENCE salary_payments_id_seq RESTART WITH 1;
ALTER SEQUENCE refund_requests_id_seq RESTART WITH 1;
ALTER SEQUENCE password_reset_requests_id_seq RESTART WITH 1;

DO $$ 
BEGIN 
    RAISE NOTICE '✅ Test data cleaned - system ready for production';
END $$;

COMMIT;

-- ========================================
-- VERIFICATION - SHOW FINAL STATUS
-- ========================================

DO $$ 
BEGIN 
    RAISE NOTICE '';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '🎉 PRODUCTION DATABASE SETUP COMPLETE!';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '';
END $$;

-- Show what's populated (should have data)
SELECT 
    '✅ DATA LOADED' as status,
    '' as spacer,
    COUNT(*) as count,
    'Admin User' as item
FROM users
UNION ALL
SELECT 
    '✅ DATA LOADED',
    '',
    COUNT(*),
    'Price Items (Services)'
FROM price_items
UNION ALL
SELECT 
    '✅ DATA LOADED',
    '',
    COUNT(*),
    'Business Settings'
FROM business_settings
UNION ALL

-- Show what's empty (ready for production)
SELECT 
    '⚪ EMPTY (Ready)',
    '',
    COUNT(*),
    'Customers'
FROM customers
UNION ALL
SELECT 
    '⚪ EMPTY (Ready)',
    '',
    COUNT(*),
    'Orders'
FROM orders
UNION ALL
SELECT 
    '⚪ EMPTY (Ready)',
    '',
    COUNT(*),
    'Payments'
FROM payments
UNION ALL
SELECT 
    '⚪ EMPTY (Ready)',
    '',
    COUNT(*),
    'Deliveries'
FROM deliveries
UNION ALL
SELECT 
    '⚪ EMPTY (Ready)',
    '',
    COUNT(*),
    'Expenses'
FROM expenses
UNION ALL
SELECT 
    '⚪ EMPTY (Ready)',
    '',
    COUNT(*),
    'Pending Payments'
FROM pending_payments
UNION ALL
SELECT 
    '⚪ EMPTY (Ready)',
    '',
    COUNT(*),
    'Notifications'
FROM notifications
UNION ALL
SELECT 
    '⚪ EMPTY (Ready)',
    '',
    COUNT(*),
    'WhatsApp Messages'
FROM whatsapp_messages
UNION ALL
SELECT 
    '⚪ EMPTY (Ready)',
    '',
    COUNT(*),
    'Promotions'
FROM promotions
UNION ALL
SELECT 
    '⚪ EMPTY (Ready)',
    '',
    COUNT(*),
    'Activity Logs'
FROM activity_logs
UNION ALL
SELECT 
    '⚪ EMPTY (Ready)',
    '',
    COUNT(*),
    'Payroll Employees'
FROM payroll_employees
UNION ALL
SELECT 
    '⚪ EMPTY (Ready)',
    '',
    COUNT(*),
    'Salary Payments'
FROM salary_payments
UNION ALL
SELECT 
    '⚪ EMPTY (Ready)',
    '',
    COUNT(*),
    'Refund Requests'
FROM refund_requests
UNION ALL
SELECT 
    '⚪ EMPTY (Ready)',
    '',
    COUNT(*),
    'Password Reset Requests'
FROM password_reset_requests;

-- Show admin user
DO $$ 
BEGIN 
    RAISE NOTICE '';
    RAISE NOTICE '👤 Admin Account:';
END $$;

SELECT 
    email,
    full_name,
    role,
    status
FROM users
WHERE email = 'husseinibram555@gmail.com';

-- Show price items breakdown
DO $$ 
BEGIN 
    RAISE NOTICE '';
    RAISE NOTICE '💰 Service Catalog:';
END $$;

SELECT 
    category,
    COUNT(*) as services,
    MIN(price) as lowest_price,
    MAX(price) as highest_price
FROM price_items
GROUP BY category
ORDER BY category;

DO $$ 
BEGIN 
    RAISE NOTICE '';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '✅ Database is production-ready!';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '';
    RAISE NOTICE 'NEXT STEPS:';
    RAISE NOTICE '1. Deploy backend to Render.com';
    RAISE NOTICE '2. Update Netlify VITE_API_URL';
    RAISE NOTICE '3. Login and add first real customer!';
    RAISE NOTICE '';
END $$;
