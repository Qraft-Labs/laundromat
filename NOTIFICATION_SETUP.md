# NOTIFICATION SYSTEM - SETUP & CLARIFICATIONS

    ## 🔴 IMMEDIATE FIXES NEEDED

    ### 1. Run Database Migration (REQUIRED)
    The notifications table doesn't exist yet, causing 500 errors.

    **Run this command in PowerShell:**
    ```powershell
    psql -U postgres -d lush_laundry -f "d:\work_2026\lush_laundry\backend\src\database\migrations\011_create_notifications.sql"
    ```

    **Alternative if above doesn't work:**
    ```powershell
    cd d:\work_2026\lush_laundry\backend
    Get-Content "src\database\migrations\011_create_notifications.sql" | psql -U postgres -d lush_laundry
    ```

    ### 2. Restart Backend Server
    After running migration, restart your backend:
    ```powershell
    # Stop current backend (Ctrl+C)
    # Then restart
    cd d:\work_2026\lush_laundry\backend
    npm run dev
    ```

    ### 3. Fixed Frontend Crash
    ✅ Already fixed: Added null check for `notifications` array to prevent crash

    ---

    ## 📋 NOTIFICATION BEHAVIOR - CLARIFICATIONS

    ### Each User Has Their Own Notifications

    **How it works:**
    - When payment arrives → **ALL users** get their own notification
    - Each user sees their own notification bell with their own unread count
    - **Cashier reads notification** → Only marked as read for that cashier
    - **Admin reads notification** → Only marked as read for that admin
    - They don't share read/unread status

    **Example:**
    ```
    Payment of UGX 50,000 arrives:

    Cashier John:
    [Bell: 1] → Opens → Sees "New payment" → Clicks → [Bell: 0]

    Admin Mary:
    [Bell: 1] → Still unread for her until she opens it

    Cashier Sarah:
    [Bell: 1] → Still unread for her until she opens it
    ```

    ### Notification Types (Focus on Payments)

    **PENDING_PAYMENT** (Yellow Clock Icon ⏰):
    - **Who gets it**: ALL active users (cashiers + admins)
    - **When**: Mobile money/bank payment arrives via webhook
    - **Message**: "MTN payment of UGX 50,000 from 256700000000 (John Doe) needs to be assigned to an order"
    - **Click action**: Opens Payments page (user switches to Pending Assignments tab)
    - **Why important**: This is THE critical notification for your business

    **PAYMENT_ASSIGNED** (Green Checkmark ✅):
    - **Who gets it**: ADMINS only
    - **When**: Cashier assigns a pending payment to an order
    - **Message**: "Payment of UGX 50,000 from 256700000000 has been assigned to order ORD-00123 by staff"
    - **Click action**: Opens Orders page
    - **Why**: Admin oversight - track who assigned what payment

    **SYSTEM_ALERT** (Red Alert Icon 🚨):
    - **Who gets it**: ADMINS only
    - **When**: System errors, critical events (future use)
    - **Message**: Custom system messages
    - **Click action**: Custom navigation

    ### Permission System

    **Cashiers Can:**
    - ✅ View all their own notifications
    - ✅ Mark notifications as read (individually or all at once)
    - ✅ Delete **ONLY read notifications** (their own)
    - ✅ Click notification to navigate to relevant page
    - ❌ Cannot delete unread notifications
    - ❌ Cannot delete other users' notifications
    - ❌ Cannot see admin-only notifications

    **Admins Can:**
    - ✅ Everything cashiers can do
    - ✅ Delete **ANY notification** (read or unread, theirs or others')
    - ✅ See admin-only notifications (PAYMENT_ASSIGNED, SYSTEM_ALERT)
    - ✅ View notification statistics (future dashboard)

    ### Notification History

    **Database Storage:**
    - ✅ **ALL notifications stored permanently** in `notifications` table
    - ✅ Never auto-deleted
    - ✅ Full audit trail: who, what, when, read status, read time

    **What's Tracked:**
    ```sql
    id, user_id, type, title, message, data (JSON),
    is_read, created_at, read_at
    ```

    **Example History:**
    ```
    Notification ID: 123
    User: Cashier John (user_id: 5)
    Type: PENDING_PAYMENT
    Title: "New Mobile Money Payment Received"
    Message: "MTN payment of UGX 50,000..."
    Data: {pending_payment_id: 45, amount: 50000, sender_phone: "256700..."}
    Is Read: true
    Created: 2026-01-18 14:30:00
    Read At: 2026-01-18 14:32:15
    ```

    **Admin Can Clear Notifications:**
    - Delete individual notifications (click trash icon)
    - Delete all at once (future feature - can be added)
    - Clearing only removes from view, doesn't affect other users

    ---

    ## 🎯 PROFESSIONAL FEATURES IMPLEMENTED

    ### 1. Real-Time Updates
    - Auto-refreshes every 30 seconds
    - Shows unread count badge on bell icon
    - Badge shows "99+" if more than 99 unread

    ### 2. Smart Navigation
    - Click notification → Goes to relevant page automatically
    - PENDING_PAYMENT → Payments page
    - PAYMENT_ASSIGNED → Orders page

    ### 3. Visual Indicators
    - **Unread**: Blue background + blue dot
    - **Read**: Normal background, no dot
    - **Badge**: Red badge with count
    - **Icons**: Type-specific (clock, checkmark, alert)

    ### 4. Time Formatting
    - "Just now" (< 1 minute)
    - "5m ago" (< 1 hour)
    - "3h ago" (< 24 hours)
    - "2d ago" (< 7 days)
    - Full date (> 7 days)

    ### 5. Notification Management
    - Mark single as read (click notification)
    - Mark all as read (button in dropdown)
    - Delete read notifications (trash icon)
    - Admin can delete any notification

    ---

    ## 🔧 TESTING AFTER MIGRATION

    ### Test 1: Create Test Notification via Webhook
    ```bash
    curl -X POST http://localhost:5000/api/pending-payments/webhook/mobile-money \
    -H "Content-Type: application/json" \
    -d '{
        "transaction_reference":"TEST123456",
        "payment_method":"MTN Mobile Money",
        "amount":50000,
        "sender_phone":"256700000000",
        "sender_name":"John Doe"
    }'
    ```

    **Expected Result:**
    1. Bell icon shows red badge with "1"
    2. Click bell → See notification with yellow clock icon
    3. Message: "MTN payment of UGX 50,000 from 256700000000 (John Doe) needs to be assigned to an order"
    4. Click notification → Opens Payments page
    5. Bell badge disappears (marked as read)

    ### Test 2: Multiple Users
    1. Login as Cashier 1 → See notification
    2. Read notification → Badge gone for Cashier 1
    3. Login as Cashier 2 → Still see notification (unread)
    4. Login as Admin → Still see notification (unread)

    ### Test 3: Delete Notification
    1. Read a notification (becomes read)
    2. Trash icon appears
    3. Click trash → Notification deleted
    4. Only deleted for current user, others still see it

    ---

    ## 🚀 FUTURE ENHANCEMENTS (Optional)

    ### Notification Preferences
    - Users can enable/disable specific notification types
    - Example: Cashier can turn off PAYMENT_ASSIGNED notifications

    ### Notification Center Page
    - Dedicated page with full history
    - Filter by type, date, read status
    - Search notifications
    - Bulk actions (delete multiple)

    ### Push Notifications
    - Browser push notifications
    - Desktop notifications when payment arrives
    - Sound alerts (optional)

    ### Email/SMS Notifications
    - Email summary of daily notifications
    - SMS for critical payments over certain amount
    - Configurable thresholds

    ### Admin Dashboard
    - Notification statistics
    - Response time tracking (how fast payments are assigned)
    - User activity (who reads/deletes what)

    ---

    ## 📊 DATABASE SCHEMA

    ```sql
    CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    type VARCHAR(50) NOT NULL,        -- 'PENDING_PAYMENT', 'PAYMENT_ASSIGNED', etc.
    title VARCHAR(200) NOT NULL,       -- Short title
    message TEXT NOT NULL,             -- Full message
    data JSONB,                        -- Extra context (IDs, amounts, etc.)
    is_read BOOLEAN DEFAULT FALSE,     -- Read status
    created_at TIMESTAMP DEFAULT NOW,  -- When created
    read_at TIMESTAMP                  -- When marked as read
    );

    -- Indexes for fast queries
    CREATE INDEX idx_notifications_user_id ON notifications(user_id);
    CREATE INDEX idx_notifications_is_read ON notifications(is_read);
    CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
    CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
    ```

    ---

    ## ✅ WHAT TO DO NOW

    1. **Run migration** (command above)
    2. **Restart backend**
    3. **Test with curl command** to create notification
    4. **Login and check bell icon**
    5. **Verify notification appears**
    6. **Test read/delete functionality**

    After these steps, the system will be fully operational! 🎉

    ---

    ## 🆘 TROUBLESHOOTING

    **"Bell icon doesn't show badge"**
    - Check browser console for errors
    - Verify backend is running
    - Verify migration ran successfully: `SELECT * FROM notifications;`

    **"500 error when fetching notifications"**
    - Migration not run yet
    - Backend not restarted after migration
    - Database connection issue

    **"Notification shows but clicking crashes"**
    - Frontend fix already applied
    - Refresh browser (Ctrl+F5)

    **"Multiple users see same read status"**
    - This is WRONG - each user should have independent read status
    - Check if multiple users logged in with same account
    - Verify user_id is different in notifications table
