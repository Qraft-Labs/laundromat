-- =================================================================
-- DEPLOYMENT DATA CLEANUP SCRIPT
-- Purpose: Remove all test data before production deployment
-- Safe: Preserves system structure, price items, user accounts, and resets ID sequences
-- =================================================================

BEGIN;

-- Step 1: Clear all order-related data (CASCADE handles order_items)
TRUNCATE TABLE orders RESTART IDENTITY CASCADE;
TRUNCATE TABLE payments RESTART IDENTITY CASCADE;
TRUNCATE TABLE pending_payments RESTART IDENTITY CASCADE;

-- Step 2: Clear all customer data
TRUNCATE TABLE customers RESTART IDENTITY CASCADE;

-- Step 3: Clear notifications (test notifications)
TRUNCATE TABLE notifications RESTART IDENTITY CASCADE;

-- Step 4: Clear expenses (test expenses)
TRUNCATE TABLE expenses RESTART IDENTITY CASCADE;

-- Step 5: Clear promotions (test promotions)
TRUNCATE TABLE promotions RESTART IDENTITY CASCADE;

-- Step 6: Clear delivery records
TRUNCATE TABLE deliveries RESTART IDENTITY CASCADE;

-- Step 7: Clear inventory (business will add real stock)
TRUNCATE TABLE inventory_items RESTART IDENTITY CASCADE;
TRUNCATE TABLE inventory_transactions RESTART IDENTITY CASCADE;

-- Step 7: Clear user activity logs (optional - keeps audit trail if you prefer)
-- TRUNCATE TABLE activity_logs RESTART IDENTITY;

-- Step 8: Reset ID sequences to start from 1
-- This ensures first real customer gets ID 1, first order gets ORD20260001, etc.
ALTER SEQUENCE customers_id_seq RESTART WITH 1;
ALTER SEQUENCE orders_id_seq RESTART WITH 1;
ALTER SEQUENCE payments_id_seq RESTART WITH 1;
ALTER SEQUENCE pending_payments_id_seq RESTART WITH 1;
ALTER SEQUENCE notifications_id_seq RESTART WITH 1;
ALTER SEQUENCE expenses_id_seq RESTART WITH 1;
ALTER SEQUENCE deliveries_id_seq RESTART WITH 1;
ALTER SEQUENCE inventory_items_id_seq RESTART WITH 1;
ALTER SEQUENCE inventory_transactions_id_seq RESTART WITH 1;

-- =================================================================
-- WHAT REMAINS (NOT DELETED):
-- =================================================================
-- ✅ users table (Admin and staff accounts remain)
-- ✅ price_items table (All pricing remains)
-- ✅ delivery_zones table (Zones and fees remain)
-- ✅ expense_categories table (Categories remain)
--
-- CLEARED (needs real business data):
-- ❌ inventory_items - Business will add actual stock
-- ❌ inventory_transactions - Start fresh with real stock movements

-- =================================================================
-- VERIFICATION QUERIES
-- =================================================================

-- Check counts after cleanup (should all be 0)
SELECT 'orders' as table_name, COUNT(*) as count FROM orders
UNION ALL
SELECT 'customers', COUNT(*) FROM customers
UNION ALL
SELECT 'payments', COUNT(*) FROM payments
UNION ALL
SELECT 'pending_payments', COUNT(*) FROM pending_payments
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'expenses', COUNT(*) FROM expenses
UNION ALL
SELECT 'promotions', COUNT(*) FROM promotions
UNION ALL
SELECT 'deliveries', COUNT(*) FROM deliveries
UNION ALL
SELECT 'inventory_items', COUNT(*) FROM inventory_items
UNION ALL
SELECT 'inventory_transactions', COUNT(*) FROM inventory_transactions;

-- Check what remains (should have data)
SELECT 'price_items', COUNT(*) FROM price_items
UNION ALL
SELECT 'inventory_items', COUNT(*) FROM inventory_items
UNION ALL
SELECT 'delivery_zones', COUNT(*) FROM delivery_zones;

COMMIT;

-- =================================================================
-- IMPORTANT NOTES:
-- =================================================================
-- 1. RESTART IDENTITY resets auto-increment sequences to 1
-- 2. First real customer will be CUST20260001, first order ORD20260001
-- 3. This is SAFE - no foreign key issues because we clear in correct order
-- 4. Run this ONCE before deployment, NOT on production with real data!
-- 5. Make a backup first: pg_dump lush_laundry > backup.sql
-- =================================================================
