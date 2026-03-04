# Production Deployment: Test Data Cleanup Guide

    ## 📋 Overview

    Before going live with real business data, you need to clean all test/demo data so your first real customer gets a clean, professional ID: **CUST20260001**

    ---

    ## 🎯 What Gets Cleaned

    This cleanup will DELETE:
    - ✅ All test customers (308 customers including legacy C001-C004 format)
    - ✅ All test orders and order items
    - ✅ All test payments and transactions
    - ✅ All test inventory items
    - ✅ All test deliveries
    - ✅ Related notifications and audit logs

    After cleanup:
    - ✅ First customer ID: **CUST20260001**
    - ✅ First order number: **ORD20260001**
    - ✅ First invoice: **INV-2026-000001**
    - ✅ Clean database ready for real business

    ---

    ## 🚀 Two Methods Available

    ### Method 1: Interactive Script (RECOMMENDED - Safest)

    **Advantages:**
    - ✅ Shows current data counts before deletion
    - ✅ Offers automatic backup creation
    - ✅ Requires double confirmation
    - ✅ Step-by-step guidance
    - ✅ Rollback on error

    **Run:**
    ```bash
    cd d:\work_2026\lush_laundry\backend
    node clean-test-data.js
    ```

    **Interactive Prompts:**
    1. Shows current data count
    2. "Do you want to create a backup first? (yes/no):"
    3. Type "DELETE ALL DATA" to confirm
    4. "Are you ABSOLUTELY SURE? (yes/no):"
    5. Executes cleanup
    6. Shows success message with next IDs

    ---

    ### Method 2: SQL Migration File (Manual Control)

    **Advantages:**
    - ✅ Full control over execution
    - ✅ Can review SQL before running
    - ✅ Can run from any PostgreSQL client

    **Steps:**

    1. **Create Backup First (CRITICAL):**
    ```bash
    pg_dump -U postgres lush_laundry > backup_before_cleanup.sql
    ```

    2. **Edit the migration file:**
    - Open: `backend/src/database/migrations/clean_test_data_for_production.sql`
    - Uncomment the DELETE section (remove `/*` and `*/`)
    - Change `ROLLBACK;` to `COMMIT;`

    3. **Run the migration:**
    ```bash
    psql -U postgres -d lush_laundry -f backend/src/database/migrations/clean_test_data_for_production.sql
    ```

    4. **Verify cleanup:**
    ```sql
    SELECT COUNT(*) FROM customers;  -- Should return 0
    SELECT COUNT(*) FROM orders;     -- Should return 0
    ```

    ---

    ## ⚠️ Important Warnings

    ### Before Running Cleanup:

    1. **BACKUP IS CRITICAL**
    - This deletes ALL data permanently
    - Cannot be undone without backup
    - Backup protects against mistakes

    2. **Test User Accounts NOT Deleted**
    - Staff/admin user accounts remain
    - Only customer/order/payment data is deleted
    - You can still log in after cleanup

    3. **System Settings Preserved**
    - Business hours settings kept
    - Automation settings kept
    - Price list kept
    - Notification templates kept

    4. **When to Run This**
    - ONLY when ready for real business data
    - After testing is complete
    - Before first real customer registration
    - NOT on a live production system with real data

    ---

    ## 📊 What Happens After Cleanup

    ### Customer ID Format

    **Before Cleanup:**
    ```
    Old: C001, C002, C003... (legacy test data)
    New: CUST202602296, CUST202602297... (mixed numbering)
    ```

    **After Cleanup:**
    ```
    First customer:  CUST20260001
    Second customer: CUST20260002
    Third customer:  CUST20260003
    ...
    100th customer:  CUST20260100
    ```

    ### Order Number Format

    **After Cleanup:**
    ```
    First order:   ORD20260001
    Second order:  ORD20260002
    Third order:   ORD20260003
    ```

    ### Invoice Number Format

    **After Cleanup:**
    ```
    First invoice:  INV-2026-000001
    Second invoice: INV-2026-000002
    Third invoice:  INV-2026-000003
    ```

    ---

    ## 🔄 Restore from Backup (If Needed)

    If something goes wrong, restore from backup:

    ```bash
    # Drop current database
    psql -U postgres -c "DROP DATABASE lush_laundry;"

    # Recreate database
    psql -U postgres -c "CREATE DATABASE lush_laundry;"

    # Restore from backup
    psql -U postgres lush_laundry < backup_before_cleanup.sql
    ```

    ---

    ## ✅ Verification Checklist

    After running cleanup, verify:

    - [ ] Customer count is 0: `SELECT COUNT(*) FROM customers;`
    - [ ] Order count is 0: `SELECT COUNT(*) FROM orders;`
    - [ ] Can still log in as admin
    - [ ] Price list still exists
    - [ ] Create a test customer → Should get CUST20260001
    - [ ] Create a test order → Should get ORD20260001

    ---

    ## 🎓 Example: First Real Customer

    After cleanup, when you create your first real customer:

    **Input:**
    ```
    Name: John's Dry Cleaning
    Phone: +256771234567
    Email: john@example.com
    ```

    **Result:**
    ```
    ✅ Customer created successfully!
    Customer ID: CUST20260001
    Name: John's Dry Cleaning
    Phone: +256771234567
    ```

    **Perfect!** Clean, professional ID starting from 0001.

    ---

    ## 📞 Support

    If you encounter issues:
    1. Check backup was created successfully
    2. Review error messages carefully
    3. Don't panic - database can be restored from backup
    4. Test the process on a copy of the database first if unsure

    ---

    ## 🚀 Ready to Go Live?

    **Pre-deployment Checklist:**
    - [ ] Test all features work correctly
    - [ ] Backup created successfully
    - [ ] Team trained on the system
    - [ ] Price list finalized
    - [ ] Business settings configured
    - [ ] Run cleanup script
    - [ ] Verify first customer gets CUST20260001
    - [ ] System ready for real business! 🎉
