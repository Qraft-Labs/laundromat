# Notification System Implementation

    ## Overview
    Complete notification system for mobile money/bank payment alerts with history tracking and management.

    ## Features

    ### 1. **Real-Time Notifications**
    - Bell icon in header with unread count badge (red badge)
    - Auto-refreshes every 30 seconds
    - Dropdown shows recent 20 notifications
    - Unread notifications highlighted (blue background)

    ### 2. **Notification Types**
    - **PENDING_PAYMENT**: New mobile money/bank payment received (yellow clock icon)
    - **PAYMENT_ASSIGNED**: Payment assigned to order (green checkmark icon)
    - **SYSTEM_ALERT**: System alerts (red alert icon)
    - More types can be added easily

    ### 3. **User Actions**
    - Click notification to navigate to relevant page
    - Mark single notification as read
    - Mark all notifications as read (button in dropdown)
    - Delete notifications:
    - **Cashiers**: Can only delete read notifications
    - **Admins**: Can delete any notification

    ### 4. **Notification History**
    - All notifications stored in database permanently
    - Sortable by date, type, read status
    - Shows: Title, Message, Time ago, Read status
    - Full history accessible (can extend to dedicated page)

    ### 5. **Permission System**
    - **All Users**: See their own notifications, mark as read, delete own read notifications
    - **Admins**: See admin-specific notifications, delete any notifications (own or others)

    ## Database Schema

    ```sql
    CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data JSONB, -- Additional context
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
    );
    ```

    ## Backend API Endpoints

    | Endpoint | Method | Auth | Description |
    |----------|--------|------|-------------|
    | `/api/notifications` | GET | Required | Get user's notifications (limit, offset, unread_only params) |
    | `/api/notifications/unread-count` | GET | Required | Get count of unread notifications |
    | `/api/notifications/:id/read` | PATCH | Required | Mark single notification as read |
    | `/api/notifications/read-all` | PATCH | Required | Mark all user's notifications as read |
    | `/api/notifications/:id` | DELETE | Required | Delete notification (own or admin) |
    | `/api/notifications` | DELETE | Required | Delete all notifications for user (optional userId for admin) |
    | `/api/notifications/stats/summary` | GET | Admin Only | Get notification statistics dashboard |

    ## Frontend Components

    ### NotificationDropdown
    - **Location**: `frontend/src/components/notifications/NotificationDropdown.tsx`
    - **Usage**: Already integrated in MainLayout header
    - **Features**:
    - Bell icon with badge
    - Dropdown menu with scrollable list
    - Mark as read functionality
    - Delete buttons (conditional on role)
    - Time ago formatting
    - Type-specific icons

    ## Usage Flow

    ### When Payment Arrives (Webhook):

    1. MTN/Airtel API sends payment to `/api/pending-payments/webhook/mobile-money`
    2. System creates pending_payments record
    3. System creates notification for **all active users**:
    ```javascript
    createNotification(
        'all',
        'PENDING_PAYMENT',
        'New Mobile Money Payment Received',
        'MTN payment of UGX 50,000 from 256700000000 needs to be assigned to an order',
        { pending_payment_id: 123, amount: 50000, sender_phone: '256700000000' }
    )
    ```
    4. All users see red badge on bell icon
    5. Users click bell, see notification
    6. Click notification → navigates to Payments page (Pending Assignments tab)

    ### When Payment Assigned:

    1. Cashier searches for order and assigns payment
    2. System updates order with payment
    3. System marks pending_payment as ASSIGNED
    4. System creates notification for **admins only**:
    ```javascript
    createNotification(
        [admin_ids],
        'PAYMENT_ASSIGNED',
        'Payment Assigned to Order',
        'Payment of UGX 50,000 from 256700000000 has been assigned to order ORD-00123 by staff',
        { order_id: 456, order_number: 'ORD-00123', amount: 50000 }
    )
    ```
    5. Admins see notification
    6. Click notification → navigates to Orders page

    ## Database Migration

    Run this to create notifications table:

    ```powershell
    psql -U postgres -d lush_laundry -f backend\src\database\migrations\011_create_notifications.sql
    ```

    ## Testing

    ### Test New Payment Notification:

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

    After sending this:
    1. Check bell icon for red badge
    2. Click bell to see notification
    3. Click notification to go to Payments page
    4. Should see payment in Pending Assignments tab

    ## Professional Features

    ### ✅ Notification Management
    - History tracking (all notifications stored forever)
    - Read/Unread status
    - Timestamp with "time ago" formatting
    - Persistent across sessions

    ### ✅ Permission Control
    - Cashiers: View, read, delete own read notifications
    - Admins: Full control including delete any notification

    ### ✅ User Experience
    - Real-time updates (30s polling)
    - Badge shows unread count (99+ for large numbers)
    - Visual indicators (icons, colors, read status)
    - Click to navigate to relevant page
    - Mark all as read button
    - Smooth animations and transitions

    ### ✅ Scalability
    - Indexed database for fast queries
    - Pagination support
    - JSONB data field for flexible context
    - Extensible notification types

    ## Future Enhancements

    1. **Push Notifications**: Browser push for real-time alerts
    2. **Email Notifications**: Send emails for critical alerts
    3. **SMS Notifications**: SMS for payment confirmations
    4. **Notification Preferences**: Users can customize which notifications they receive
    5. **Dedicated Notifications Page**: Full-page view with filters and search
    6. **Notification Groups**: Group similar notifications
    7. **Snooze Functionality**: Snooze notifications for later

    ## File Structure

    ```
    backend/
    ├── database/migrations/
    │   └── 011_create_notifications.sql
    ├── controllers/
    │   └── notification.controller.ts
    ├── routes/
    │   └── notification.routes.ts
    └── routes/index.ts (updated)

    frontend/
    └── components/
        └── notifications/
            └── NotificationDropdown.tsx (updated)
    ```

    ## Key Implementation Details

    ### Auto-Notification on Payment Arrival
    File: `backend/src/controllers/pendingPayment.controller.ts`
    ```typescript
    await createNotification(
    'all',
    'PENDING_PAYMENT',
    'New Mobile Money Payment Received',
    `${paymentMethod} payment of UGX ${amount.toLocaleString()}...`,
    { pending_payment_id, transaction_reference, amount, sender_phone }
    );
    ```

    ### Auto-Notification on Payment Assignment
    File: `backend/src/controllers/pendingPayment.controller.ts`
    ```typescript
    await createNotification(
    adminIds,
    'PAYMENT_ASSIGNED',
    'Payment Assigned to Order',
    `Payment of UGX ${amount} assigned to order ${order_number}`,
    { order_id, order_number, amount, assigned_by }
    );
    ```

    ## Security

    - All endpoints require authentication
    - Users can only see their own notifications
    - Deletion permissions enforced (admin for all, users for own read notifications)
    - SQL injection prevented (parameterized queries)
    - XSS prevented (React escaping)

    ## Performance

    - Database indexes on: user_id, is_read, created_at, type
    - Composite index for common query (user unread notifications)
    - Efficient pagination
    - Client-side caching (stores notifications in state)
    - Polling interval: 30 seconds (configurable)

    ---

    **System Status**: ✅ Ready for Production (after running migration)
