-- ========================================
-- PRODUCTION DEPLOYMENT: Clean Test Data
-- ========================================
-- ⚠️ WARNING: THIS WILL DELETE ALL TEST DATA
-- Run this ONLY when ready to go live with real business data
-- 
-- What this does:
-- 1. Deletes all test customers, orders, payments, etc.
-- 2. Resets ID sequences to start from 1
-- 3. First real customer will get: CUST20260001
--
-- RECOMMENDATION: Create a backup first!
-- Run: pg_dump -U postgres lush_laundry > backup_before_cleanup.sql
-- ========================================

BEGIN;

-- Step 1: Show current data count (for confirmation)
DO $$
DECLARE
    customer_count INTEGER;
    order_count INTEGER;
    payment_count INTEGER;
    inventory_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO customer_count FROM customers;
    SELECT COUNT(*) INTO order_count FROM orders;
    SELECT COUNT(*) INTO payment_count FROM payments;
    SELECT COUNT(*) INTO inventory_count FROM inventory_items;
    
    RAISE NOTICE '════════════════════════════════════════';
    RAISE NOTICE '⚠️  CURRENT DATA COUNT (WILL BE DELETED):';
    RAISE NOTICE '════════════════════════════════════════';
    RAISE NOTICE 'Customers: %', customer_count;
    RAISE NOTICE 'Orders: %', order_count;
    RAISE NOTICE 'Payments: %', payment_count;
    RAISE NOTICE 'Inventory Items: %', inventory_count;
    RAISE NOTICE '════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE '⏸️  Transaction started but NOT committed yet';
    RAISE NOTICE '   Review the counts above carefully!';
    RAISE NOTICE '';
END $$;

-- Uncomment the lines below ONLY when you are ABSOLUTELY SURE
-- to proceed with deleting all test data

-- ========================================
-- STEP 2: DELETE ALL TEST DATA
-- ========================================
-- (Currently commented for safety)

/*
-- Delete in correct order (respecting foreign keys)
DELETE FROM order_items;
DELETE FROM payments;
DELETE FROM pending_payments;
DELETE FROM orders;
DELETE FROM deliveries;
DELETE FROM delivery_assignments;
DELETE FROM inventory_transactions;
DELETE FROM inventory_items;
DELETE FROM customers;
DELETE FROM notifications WHERE entity_type = 'order' OR entity_type = 'customer';
DELETE FROM audit_logs WHERE entity_type IN ('order', 'customer', 'payment', 'inventory');

-- Reset auto-increment sequences
ALTER SEQUENCE customers_id_seq RESTART WITH 1;
ALTER SEQUENCE orders_id_seq RESTART WITH 1;
ALTER SEQUENCE order_items_id_seq RESTART WITH 1;
ALTER SEQUENCE payments_id_seq RESTART WITH 1;
ALTER SEQUENCE inventory_items_id_seq RESTART WITH 1;
ALTER SEQUENCE deliveries_id_seq RESTART WITH 1;

RAISE NOTICE '✅ All test data deleted successfully!';
RAISE NOTICE '✅ Sequences reset to 1';
RAISE NOTICE '';
RAISE NOTICE '📋 Next Customer ID will be: CUST20260001';
RAISE NOTICE '📋 Next Order Number will be: ORD20260001';
RAISE NOTICE '📋 Next Invoice will be: INV-2026-000001';
RAISE NOTICE '';
RAISE NOTICE '🚀 System ready for production data!';
*/

-- ========================================
-- TO EXECUTE THIS CLEANUP:
-- ========================================
-- 1. Create backup first:
--    pg_dump -U postgres lush_laundry > backup_before_cleanup.sql
--
-- 2. Uncomment the DELETE section above (remove /* and */)
--
-- 3. Run this file:
--    psql -U postgres -d lush_laundry -f clean_test_data_for_production.sql
--
-- 4. Verify the cleanup worked:
--    SELECT COUNT(*) FROM customers;  -- Should return 0
--
-- 5. Create first real customer - should get CUST20260001
-- ========================================

ROLLBACK; -- Change to COMMIT when ready to execute
-- COMMIT; -- Uncomment this and comment ROLLBACK above when ready

