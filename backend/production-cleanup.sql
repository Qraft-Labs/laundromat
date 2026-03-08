-- ========================================
-- PRODUCTION CLEANUP - Remove Test Data
-- Run this in Supabase after schema fix
-- Keeps ONLY: Admin user + Price items (88 services)
-- Removes: All test data
-- ========================================

BEGIN;

-- ========================================
-- STEP 1: DELETE ALL TEST DATA
-- ========================================

-- Delete order-related data (cascades to order_items)
TRUNCATE TABLE order_items RESTART IDENTITY CASCADE;
TRUNCATE TABLE orders RESTART IDENTITY CASCADE;
TRUNCATE TABLE payments RESTART IDENTITY CASCADE;

-- Delete delivery data
TRUNCATE TABLE deliveries RESTART IDENTITY CASCADE;

-- Delete test customers
TRUNCATE TABLE customers RESTART IDENTITY CASCADE;

-- Delete test inventory data
TRUNCATE TABLE inventory_transactions RESTART IDENTITY CASCADE;
TRUNCATE TABLE inventory_items RESTART IDENTITY CASCADE;

-- Delete notifications
TRUNCATE TABLE notifications RESTART IDENTITY CASCADE;

-- Delete backup logs
TRUNCATE TABLE backup_attempts RESTART IDENTITY CASCADE;

-- Delete ALL users EXCEPT the admin (husseinibram555@gmail.com)
DELETE FROM users WHERE email != 'husseinibram555@gmail.com';

-- ========================================
-- STEP 2: RESET AUTO-INCREMENT SEQUENCES
-- ========================================

-- Reset sequences so first real customer is ID 1, first real order is ID 1, etc.
ALTER SEQUENCE customers_id_seq RESTART WITH 1;
ALTER SEQUENCE orders_id_seq RESTART WITH 1;
ALTER SEQUENCE order_items_id_seq RESTART WITH 1;
ALTER SEQUENCE payments_id_seq RESTART WITH 1;
ALTER SEQUENCE deliveries_id_seq RESTART WITH 1;
ALTER SEQUENCE inventory_items_id_seq RESTART WITH 1;
ALTER SEQUENCE inventory_transactions_id_seq RESTART WITH 1;
ALTER SEQUENCE notifications_id_seq RESTART WITH 1;

COMMIT;

-- ========================================
-- STEP 3: VERIFICATION - SHOW WHAT'S LEFT
-- ========================================

SELECT '📊 PRODUCTION DATABASE STATUS' as status;

-- Show populated tables (should have data)
SELECT 
    '✅ USERS (Admin Only)' as table_name,
    COUNT(*) as row_count,
    'KEEP - Admin account' as status
FROM users
UNION ALL
SELECT 
    '✅ PRICE_ITEMS (88 Services)' as table_name,
    COUNT(*) as row_count,
    'KEEP - Service catalog' as status
FROM price_items
UNION ALL
SELECT 
    '✅ BUSINESS_SETTINGS' as table_name,
    COUNT(*) as row_count,
    'KEEP - Business config' as status
FROM business_settings

UNION ALL

-- Show empty tables (ready for production)
SELECT 
    '⚪ CUSTOMERS' as table_name,
    COUNT(*) as row_count,
    'EMPTY - Ready for real customers' as status
FROM customers
UNION ALL
SELECT 
    '⚪ ORDERS' as table_name,
    COUNT(*) as row_count,
    'EMPTY - Ready for real orders' as status
FROM orders
UNION ALL
SELECT 
    '⚪ ORDER_ITEMS' as table_name,
    COUNT(*) as row_count,
    'EMPTY - Ready for real order items' as status
FROM order_items
UNION ALL
SELECT 
    '⚪ PAYMENTS' as table_name,
    COUNT(*) as row_count,
    'EMPTY - Ready for real payments' as status
FROM payments
UNION ALL
SELECT 
    '⚪ DELIVERIES' as table_name,
    COUNT(*) as row_count,
    'EMPTY - Ready for real deliveries' as status
FROM deliveries
UNION ALL
SELECT 
    '⚪ INVENTORY_ITEMS' as table_name,
    COUNT(*) as row_count,
    'EMPTY - Ready for inventory tracking' as status
FROM inventory_items
UNION ALL
SELECT 
    '⚪ NOTIFICATIONS' as table_name,
    COUNT(*) as row_count,
    'EMPTY - Ready for user notifications' as status
FROM notifications;

-- Show admin user details
SELECT 
    '👤 PRODUCTION ADMIN USER' as info,
    email,
    full_name,
    role,
    status,
    created_at
FROM users
WHERE email = 'husseinibram555@gmail.com';

-- Show price items summary
SELECT 
    '💰 PRICE ITEMS BREAKDOWN' as info,
    category,
    COUNT(*) as item_count,
    MIN(price) as lowest_price,
    MAX(price) as highest_price
FROM price_items
GROUP BY category
ORDER BY category;
