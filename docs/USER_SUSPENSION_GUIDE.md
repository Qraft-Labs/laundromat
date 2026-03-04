# User Suspension & Data Integrity Guide

    ## Overview
    When users (administrators, managers, or desktop agents) are suspended or their accounts are modified, all historical data remains intact. This document explains how the system handles these scenarios.

    ## Database Constraints

    ### Foreign Key Relationships
    All user-related data has proper foreign key constraints to maintain referential integrity:

    ```sql
    -- Orders Table
    orders.user_id → users.id [ON DELETE RESTRICT]
    - PREVENTS deletion of users who created orders
    - Ensures order history is never orphaned

    -- Payments Table  
    payments.created_by → users.id [ON DELETE RESTRICT]
    - PREVENTS deletion of users who received payments
    - Maintains complete payment audit trail

    -- Expenses Table
    expenses.approved_by → users.id [ON DELETE SET NULL]
    expenses.rejected_by → users.id [ON DELETE SET NULL]
    expenses.submitted_by → users.id [ON DELETE SET NULL]
    - Allows deletion but nullifies reference
    - Less critical for audit purposes
    ```

    ## User Suspension vs Deletion

    ### SUSPEND a User (Recommended ✅)
    **Command:**
    ```sql
    UPDATE users SET status = 'SUSPENDED' WHERE id = <user_id>;
    ```

    **Effects:**
    - User CANNOT login
    - User record remains in database
    - ALL historical data preserved:
    - Orders show staff_name (with "SUSPENDED" badge)
    - Payments show received_by name
    - Expenses show who approved/submitted
    - Full audit trail maintained
    - Can be reactivated if needed

    **Visual Indicators:**
    - Orders table: Shows "SUSPENDED" badge next to staff name
    - Order details: Red warning box with suspension notice
    - Payments: Staff name still displayed (future: add indicator)

    ### DELETE a User (Controlled ❌)
    **When Attempted via UI:**
    The delete dialog warns users upfront about restrictions and suggests suspension instead.

    **Smart Error Handling:**
    When deletion is attempted, the backend checks for ALL related activity:
    - Orders created by this user
    - Payments received by this user  
    - Expenses submitted/approved by this user

    **Error Message Example:**
    ```json
    {
    "error": "Cannot delete user: This user is linked to 15 orders, 23 payments, 8 expenses. To maintain audit trail integrity, please suspend the account instead.",
    "details": {
        "orders": 15,
        "payments": 23,
        "expenses": 8,
        "suggestion": "Use the Suspend action to deactivate this account while preserving historical records."
    }
    }
    ```

    **Database-Level Protection:**
    Even if UI checks are bypassed, database constraints prevent deletion:
    ```
    ERROR: update or delete on table "users" violates foreign key constraint
    DETAIL: Key (id)=(X) is still referenced from table "orders"
    ```

    **Only Deletable Users:**
    - New accounts with ZERO activity
    - Test accounts never used
    - Accounts created by mistake before any work done

    **Why This Approach:**
    - Maintains data integrity
    - Preserves audit trail
    - Prevents accidental data loss
    - Guides administrators to correct action (suspend)

    ## Best Practices

    ### 1. Always SUSPEND, Never DELETE
    ```sql
    -- ✅ CORRECT: Suspend user
    UPDATE users SET status = 'SUSPENDED' WHERE email = 'staff@example.com';

    -- ❌ WRONG: Try to delete active user
    DELETE FROM users WHERE email = 'staff@example.com'; -- This will FAIL with detailed error
    ```

    ### 2. UI-Level Guidance
    When clicking "Delete User", administrators see:
    - ⚠️ Warning about deletion restrictions
    - 💡 Suggestion to use "Suspend Instead" button
    - 📋 List of what blocks deletion
    - Clear explanation of why suspension is better

    ### 3. Smart Error Messages
    If deletion fails, the error shows:
    - Exact count of orders/payments/expenses
    - Clear suggestion to suspend instead
    - Keeps dialog open so user can choose suspension

    ### 4. Verify User Activity Before Action
    ```sql
    -- Check comprehensive activity
    SELECT 
    (SELECT COUNT(*) FROM orders WHERE user_id = <user_id>) as orders,
    (SELECT COUNT(*) FROM payments WHERE created_by = <user_id>) as payments,
    (SELECT COUNT(*) FROM expenses WHERE submitted_by = <user_id> 
        OR approved_by = <user_id> OR rejected_by = <user_id>) as expenses;
    ```

    ### 5. Suspension Workflow
    ```sql
    -- Step 1: Suspend the user
    UPDATE users SET status = 'SUSPENDED', updated_at = NOW() 
    WHERE id = <user_id>;

    -- Step 2: Log the action (automatic via triggers or manual)
        INSERT INTO activity_logs (user_id, action, details, performed_by)
        VALUES (<user_id>, 'USER_SUSPENDED', 
        '{"reason": "Policy violation", "date": "2026-01-26"}',
        <admin_user_id>);

        -- Step 3: Verify suspension
        SELECT id, email, full_name, role, status FROM users WHERE id = <user_id>;
        ```

        ### 4. Reactivate Suspended User
        ```sql
        UPDATE users SET status = 'ACTIVE', updated_at = NOW() 
        WHERE id = <user_id>;
        ```

        ## Data Visibility Rules

        ### Orders
        - **Table View**: Shows staff name with role badge
        - If suspended: Red "SUSPENDED" badge displayed
        - If active: Normal display with role only
        
        - **Details View**: Shows detailed staff information
        - If suspended: Red warning box with explanation
        - If active: Blue info box

        ### Payments
        - **Table View**: Shows "Received By" column
        - Displays staff member name regardless of status
        - Future enhancement: Add status indicator
        
        - **Details Dialog**: Shows who received payment
        - Full name displayed
        - Future enhancement: Add suspension warning

        ### Expenses
        - **Approval Section**: Shows who approved/rejected
        - Names preserved even if user deleted (SET NULL constraint)
        - If NULL: Shows "Unknown" or "Deleted User"

        ## Compliance & Audit

        ### Why We Keep Suspended User Data
        1. **Legal Requirements**: Financial records must maintain integrity
        2. **Audit Trail**: Must know who performed each action
        3. **Accountability**: Historical actions remain attributed to correct person
        4. **Reporting**: Statistics need accurate historical data
        5. **Dispute Resolution**: Can trace back who created/handled transactions

        ### What Data is Preserved
        - ✅ User full name
        - ✅ Email address
        - ✅ Role at time of action
        - ✅ All orders created
        - ✅ All payments received
        - ✅ All expenses submitted/approved
        - ✅ Login history (security_audit_logs)
        - ✅ Activity logs

        ### What Changes When Suspended
        - ❌ Cannot login to system
        - ❌ JWT tokens invalidated on next check
        - ❌ Cannot perform new actions
        - ✅ Historical records remain visible
        - ✅ Name still appears in reports
        - ✅ Statistics still accurate

        ## Technical Implementation

        ### Backend Query Enhancement
        ```typescript
        // orders.controller.ts - Include staff status
        const sql = `
        SELECT o.*, 
            u.full_name as staff_name,
            u.role as user_role,
            u.status as staff_status  -- NEW: Include user status
        FROM orders o
        JOIN users u ON o.user_id = u.id
        `;
        ```

        ### Frontend Display Logic
        ```tsx
        // Show suspended badge
        {order.staff_status === 'SUSPENDED' && (
        <Badge variant="destructive">Suspended</Badge>
        )}

        // Warning in details
        {selectedOrder.staff_status === 'SUSPENDED' && (
        <p className="text-xs text-red-600">
            ⚠️ This staff member's account has been suspended, 
            but their historical records remain for audit purposes.
        </p>
        )}
        ```

        ## Common Scenarios

        ### Scenario 1: Desktop Agent Creates Order, Then Gets Suspended
        **Timeline:**
        1. Agent creates order #12345 for customer
        2. Admin suspends agent's account
        3. Order #12345 still shows agent's name
        4. Order details show "SUSPENDED" badge
        5. Customer can still be served
        6. Historical record preserved

        ### Scenario 2: Manager Approves Expense, Then Leaves Company
        **Timeline:**
        1. Manager approves expense of UGX 50,000
        2. Manager's account suspended
        3. Expense record still shows manager approved it
        4. Financial reports still accurate
        5. Audit trail complete

        ### Scenario 3: Admin Tries to Delete User with Orders
        **Timeline:**
        1. Admin attempts: `DELETE FROM users WHERE id = 8`
        2. Database returns error: Foreign key violation
        3. Admin must suspend instead: `UPDATE users SET status = 'SUSPENDED'`
        4. User account suspended, data preserved

        ## Monitoring & Reports

        ### Query Suspended Users with Activity
        ```sql
        -- Suspended users who created orders
        SELECT u.email, u.full_name, COUNT(o.id) as order_count
        FROM users u
        LEFT JOIN orders o ON u.id = o.user_id
        WHERE u.status = 'SUSPENDED'
        GROUP BY u.id, u.email, u.full_name;

        -- Suspended users who received payments
        SELECT u.email, u.full_name, COUNT(p.id) as payment_count
        FROM users u
        LEFT JOIN payments p ON u.id = p.created_by
        WHERE u.status = 'SUSPENDED'
        GROUP BY u.id, u.email, u.full_name;
        ```

        ### Clean Up Old Suspended Accounts
        **WARNING**: Only do this if NO historical data exists!

        ```sql
        -- Check if safe to delete (must have ZERO references)
        SELECT 
        u.id, u.email,
        (SELECT COUNT(*) FROM orders WHERE user_id = u.id) as order_count,
        (SELECT COUNT(*) FROM payments WHERE created_by = u.id) as payment_count
        FROM users u
        WHERE u.status = 'SUSPENDED';

        -- Only delete if ALL counts are 0 (very rare case)
        -- Better to keep suspended indefinitely for audit purposes
        ```

        ## Summary

        **Key Principle**: 
        > "Suspend users, don't delete them. Historical data integrity is paramount for audit, compliance, and accountability."

        **What Happens When Suspended:**
        - ✅ User cannot login
        - ✅ Historical records preserved
        - ✅ Names still visible with indicators
        - ✅ Audit trail complete
        - ✅ Can be reactivated if needed

        **Database Protection:**
        - Foreign key constraints prevent accidental deletion
        - SET NULL used only for non-critical references
        - RESTRICT used for critical audit trail (orders, payments)
