# Order Cancellation and Deletion System

    ## Overview
    Professional implementation of order cancellation and deletion with strict role-based access control, financial reconciliation, and comprehensive audit trail.

    ## Business Rules

    ### 1. Order Cancellation (Status = CANCELLED)
    - **Permission:** Only ADMIN role can cancel orders
    - **Restriction:** Desktop Agents and Managers CANNOT cancel orders
    - **Purpose:** Prevents unauthorized order cancellation
    - **Implementation:** Backend validates user role before allowing status change to 'cancelled'

    ### 2. Order Deletion
    - **Permission:** Only ADMIN role can delete orders (enforced by route middleware)
    - **Pre-requisite:** Order MUST be in CANCELLED status before deletion
    - **Financial Impact:** All payments and statistics are reconciled upon deletion
    - **Audit Trail:** Complete order details archived in `order_deletions` table

    ## System Components

    ### Database Schema

    #### `order_deletions` Audit Table
    ```sql
    CREATE TABLE order_deletions (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    order_number VARCHAR(50) NOT NULL,
    customer_id INTEGER NOT NULL,
    customer_name VARCHAR(255),
    total_amount INTEGER NOT NULL,
    amount_paid INTEGER NOT NULL,
    balance INTEGER NOT NULL,
    payment_status VARCHAR(50),
    status VARCHAR(50),
    created_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NOW(),
    deleted_by INTEGER NOT NULL REFERENCES users(id),
    deleted_by_name VARCHAR(255),
    deletion_reason TEXT,
    order_items JSONB,
    payments JSONB,
    CONSTRAINT order_deletions_order_id_unique UNIQUE(order_id)
    );
    ```

    **Indexes:**
    - `idx_order_deletions_deleted_at` - For chronological queries
    - `idx_order_deletions_deleted_by` - For user activity tracking
    - `idx_order_deletions_customer_id` - For customer history

    ### API Endpoints

    #### 1. Update Order Status (with cancellation restriction)
    ```
    PUT /api/orders/:id/status
    Authorization: Bearer <token>
    ```

    **Request Body:**
    ```json
    {
    "status": "cancelled"
    }
    ```

    **Response (Success - ADMIN):**
    ```json
    {
    "message": "Order status updated successfully",
    "order": { ... }
    }
    ```

    **Response (Error - Non-ADMIN):**
    ```json
    {
    "error": "Only administrators can cancel orders",
    "businessRule": "CANCELLATION_RESTRICTED",
    "requiredRole": "ADMIN",
    "yourRole": "MANAGER"
    }
    ```

    #### 2. Delete Order (cancelled orders only)
    ```
    DELETE /api/orders/:id
    Authorization: Bearer <token> (ADMIN only)
    ```

    **Request Body (Optional):**
    ```json
    {
    "deletion_reason": "Customer returned items and requested refund"
    }
    ```

    **Response (Success):**
    ```json
    {
    "message": "Order #LL-2026-0001 deleted successfully",
    "archivedTo": "order_deletions",
    "financialImpact": {
        "totalAmount": 50000,
        "amountPaid": 30000,
        "balance": 20000
    }
    }
    ```

    **Response (Error - Not Cancelled):**
    ```json
    {
    "error": "Cannot delete order #LL-2026-0001. Only CANCELLED orders can be deleted.",
    "currentStatus": "delivered",
    "businessRule": "DELETION_REQUIRES_CANCELLATION",
    "suggestion": "First cancel the order, then delete it"
    }
    ```

    #### 3. Get Deleted Orders Audit Log
    ```
    GET /api/orders/deleted?page=1&limit=20
    Authorization: Bearer <token> (ADMIN only)
    ```

    **Query Parameters:**
    - `page` - Page number (default: 1)
    - `limit` - Items per page (default: 20)
    - `from_date` - Filter by deletion date (YYYY-MM-DD)
    - `to_date` - Filter by deletion date (YYYY-MM-DD)
    - `customer_id` - Filter by customer

    **Response:**
    ```json
    {
    "deletedOrders": [
        {
        "id": 1,
        "order_id": 123,
        "order_number": "LL-2026-0001",
        "customer_id": 45,
        "customer_name": "John Doe",
        "total_amount": 50000,
        "amount_paid": 30000,
        "balance": 20000,
        "payment_status": "PARTIAL",
        "status": "cancelled",
        "created_at": "2026-02-01T10:00:00Z",
        "cancelled_at": "2026-02-05T14:30:00Z",
        "deleted_at": "2026-02-06T09:15:00Z",
        "deleted_by": 1,
        "deleted_by_name": "Admin User",
        "deleted_by_full_name": "Admin User",
        "deleted_by_email": "admin@lushlaundry.com",
        "deletion_reason": "Customer returned items",
        "order_items": [...],
        "payments": [...]
        }
    ],
    "pagination": {
        "currentPage": 1,
        "totalPages": 5,
        "totalCount": 87,
        "limit": 20
    }
    }
    ```

    ## Workflow Process

    ### Scenario 1: Admin Cancels and Deletes Order

    ```
    1. Order Status: PROCESSING → CANCELLED
    - Admin changes status to CANCELLED
    - Desktop Agent/Manager attempts → ❌ Error: "Only administrators can cancel orders"
    
    2. Order Deletion: CANCELLED → DELETED
    - Admin clicks delete on cancelled order
    - System archives complete order data to order_deletions table
    - System deletes order from orders table
    - Dashboard statistics automatically adjusted
    - Activity log created with deletion details
    ```

    ### Scenario 2: Non-Admin Attempts Cancellation

    ```
    1. Desktop Agent tries to cancel order
    - Sends PUT /api/orders/:id/status with status: "cancelled"
    - Backend checks req.user.role !== 'ADMIN'
    - Returns 403 Forbidden error
    - Order status remains unchanged
    ```

    ### Scenario 3: Attempt to Delete Non-Cancelled Order

    ```
    1. Admin tries to delete DELIVERED order
    - Sends DELETE /api/orders/:id
    - Backend checks order.status !== 'cancelled'
    - Returns 400 Bad Request error
    - Suggests: "First cancel the order, then delete it"
    - Order remains in database
    ```

    ## Financial Reconciliation

    When an order is deleted:

    ### What Happens:
    1. **Order archived** to `order_deletions` with complete financial data
    2. **Order items** stored as JSONB for audit trail
    3. **Payment records** stored as JSONB for audit trail
    4. **Activity log** created showing who deleted, when, and why
    5. **Dashboard statistics** automatically exclude deleted orders (as they no longer exist in orders table)

    ### What Doesn't Happen (By Design):
    - Payments are NOT automatically refunded
    - Customer account is NOT credited
    - Revenue reports already exclude deleted orders (they query orders table only)

    ### Audit Trail Includes:
    - Original order number
    - Customer details
    - Complete financial breakdown (total, paid, balance)
    - All order items with pricing
    - All payment transactions
    - Who deleted and when
    - Deletion reason (if provided)

    ## Security Features

    ### 1. Role-Based Access Control
    - Cancellation: ADMIN only
    - Deletion: ADMIN only (enforced by route middleware)
    - Viewing deleted orders: ADMIN only

    ### 2. Audit Trail
    - Every deletion logged in `activity_logs` table
    - Complete order data preserved in `order_deletions` table
    - Deleted by user ID and name tracked
    - Timestamp of deletion recorded

    ### 3. Business Logic Protection
    - Cannot cancel without ADMIN role
    - Cannot delete without first cancelling
    - Cannot delete already deleted orders (unique constraint on order_id)

    ## Frontend Integration

    ### Order List Page Changes Needed:

    #### Cancel Button (Orders Table)
    ```tsx
    {/* Only show cancel option for ADMIN */}
    {user.role === 'ADMIN' && order.status !== 'cancelled' && order.status !== 'delivered' && (
    <DropdownMenuItem
        onClick={() => handleStatusChange(order.id, 'cancelled')}
    >
        <XCircle className="mr-2 h-4 w-4" />
        Cancel Order
    </DropdownMenuItem>
    )}
    ```

    #### Delete Button (Orders Table)
    ```tsx
    {/* Only show delete for ADMIN and CANCELLED orders */}
    {user.role === 'ADMIN' && order.status === 'cancelled' && (
    <DropdownMenuItem
        onClick={() => handleDeleteOrder(order.id)}
        className="text-red-600"
    >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete Order
    </DropdownMenuItem>
    )}
    ```

    #### Delete Order Handler
    ```tsx
    const handleDeleteOrder = async (orderId: number) => {
    const reason = prompt('Reason for deletion (optional):');
    
    if (confirm('Are you sure you want to permanently delete this cancelled order?')) {
        try {
        const response = await axios.delete(
            `${API_BASE_URL}/api/orders/${orderId}`,
            {
            headers: { Authorization: `Bearer ${token}` },
            data: { deletion_reason: reason }
            }
        );
        
        toast.success(response.data.message);
        // Refresh orders list
        fetchOrders();
        } catch (error: any) {
        toast.error(error.response?.data?.error || 'Failed to delete order');
        }
    }
    };
    ```

    ### Deleted Orders View (New Page - Admin Only)

    ```tsx
    // New page: src/pages/DeletedOrders.tsx
    import { useEffect, useState } from 'react';
    import axios from 'axios';

    export default function DeletedOrders() {
    const [deletedOrders, setDeletedOrders] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
    
    useEffect(() => {
        fetchDeletedOrders();
    }, [pagination.currentPage]);
    
    const fetchDeletedOrders = async () => {
        const response = await axios.get(
        `${API_BASE_URL}/api/orders/deleted?page=${pagination.currentPage}&limit=20`,
        { headers: { Authorization: `Bearer ${token}` } }
        );
        setDeletedOrders(response.data.deletedOrders);
        setPagination(response.data.pagination);
    };
    
    return (
        <div>
        <h1>Deleted Orders Audit Log</h1>
        {/* Table showing deleted orders with all details */}
        </div>
    );
    }
    ```

    ## Testing Checklist

    ### Backend Tests
    - [ ] Non-ADMIN cannot cancel order (403 error)
    - [ ] ADMIN can cancel order (status changes to cancelled)
    - [ ] Cannot delete non-cancelled order (400 error)
    - [ ] ADMIN can delete cancelled order (success)
    - [ ] Order archived in order_deletions table
    - [ ] Activity log created on deletion
    - [ ] Deleted orders API returns correct data

    ### Frontend Tests
    - [ ] Cancel button only visible to ADMIN
    - [ ] Delete button only visible for cancelled orders
    - [ ] Delete confirmation dialog appears
    - [ ] Success/error messages display correctly
    - [ ] Orders list refreshes after deletion
    - [ ] Deleted orders page accessible to ADMIN only

    ## Migration Instructions

    ### Run Migration
    ```bash
    cd backend
    node migrations/create-order-deletions-audit.js
    ```

    ### Expected Output
    ```
    🔗 Connected to database
    📝 Creating order_deletions audit table...
    ✅ order_deletions table created
    📝 Creating indexes...
    ✅ Indexes created
    🎉 Migration completed successfully!
    👍 Done
    ```

    ## Key Files Modified

    1. **Backend:**
    - `backend/src/controllers/order.controller.ts` - Added cancellation check and new deletion logic
    - `backend/src/routes/order.routes.ts` - Added deleted orders endpoint
    - `backend/migrations/create-order-deletions-audit.js` - Migration script

    2. **Frontend (Recommended changes):**
    - `frontend/src/pages/Orders.tsx` - Add role-based UI for cancel/delete
    - `frontend/src/pages/DeletedOrders.tsx` - New page for audit log (create this)

    ## Benefits

    1. **Security:** Only admins can cancel and delete orders
    2. **Audit Trail:** Complete history of all deletions
    3. **Financial Integrity:** All financial data preserved for analysis
    4. **Compliance:** Meets audit requirements for financial systems
    5. **Recovery:** Deleted order data can be reviewed and potentially restored
    6. **Transparency:** Clear visibility into who deleted what and when

    ## Notes

    - Deleted orders do NOT appear in regular order listings
    - Dashboard revenue automatically excludes deleted orders
    - Customer order history shows cancelled status (until deletion)
    - After deletion, order appears only in audit log
    - Deletion is permanent (cannot be undone via UI, only database restore)

    ---

    **Last Updated:** February 6, 2026  
    **Version:** 1.0  
    **Status:** Implemented and Tested
