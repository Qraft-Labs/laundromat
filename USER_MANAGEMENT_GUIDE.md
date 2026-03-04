# 👥 User Management & Access Control System

    ## 📋 Overview

    The Lush Laundry ERP now includes a **comprehensive User Management and Access Control System** for administrators. This system provides:

    - ✅ **Multi-Administrator Support** - Multiple admins can manage the system
    - ✅ **User Approval Workflow** - New users require admin approval before access
    - ✅ **Role-Based Access Control (RBAC)** - Different roles with specific permissions
    - ✅ **Activity Tracking & Audit Logs** - Track every action by every user
    - ✅ **Security Controls** - Suspend/activate/delete user accounts
    - ✅ **Comprehensive Dashboard** - View all users, statistics, and activities

    ---

    ## 🎯 Key Features

    ### 1. **User Registration & Approval**
    - Users register via the "Create Account" page
    - New accounts start with **PENDING** status
    - Cannot login until approved by an administrator
    - Any admin can approve or reject pending users
    - Rejection includes reason for documentation

    ### 2. **User Roles**
    The system supports 2 user roles:

    | Role | Description | Default Permissions |
    |------|-------------|-------------------|
    | **ADMIN** | System administrators / Owners | Full access to everything, user management, auditing |
    | **CASHIER** | Desktop agents / Front desk staff | Handle daily operations (orders, customers, payments, deliveries) |

    **Note:** 
    - **Admins** typically do oversight, auditing, and system management
    - **Cashiers (Desktop Agents)** are the main users who run daily business operations
    - Administrators can change user roles anytime

    ### 3. **Activity Audit Logs**
    Every action is logged with details:
    - Who performed the action (user ID, name, email, role)
    - What was done (action type)
    - When it happened (timestamp)
    - Where it happened (IP address, user agent)
    - What was affected (resource type and ID)
    - Additional details (JSON data)

    **Logged Actions Include:**
    - CREATE_ORDER, UPDATE_ORDER, DELETE_ORDER
    - CREATE_CUSTOMER, UPDATE_CUSTOMER, DELETE_CUSTOMER
    - CREATE_PAYMENT, EDIT_PAYMENT
    - APPROVE_USER, REJECT_USER, SUSPEND_USER, ACTIVATE_USER
    - UPDATE_USER_ROLE, DELETE_USER
    - LOGIN_SUCCESS, LOGIN_FAILED
    - And many more...

    ### 4. **Security Controls**
    Administrators can:
    - ✅ Approve pending user registrations
    - ✅ Reject registrations with reason
    - ✅ Suspend active user accounts
    - ✅ Activate suspended accounts
    - ✅ Change user roles
    - ✅ Delete users (with restrictions)
    - ✅ View complete activity history

    **Security Rules:**
    - ❌ Administrators cannot suspend other admins
    - ❌ Administrators cannot delete other admins
    - ❌ Administrators cannot suspend themselves
    - ❌ Administrators cannot change their own role
    - ❌ Users with existing orders cannot be deleted (suspend instead)

    ---

    ## 🖥️ User Management Interface

    ### Accessing User Management
    **Location:** Dashboard → Sidebar → **"User Management"** (Shield icon)

    **Who Can Access:** Administrators only (other roles cannot see this menu item)

    ### Dashboard Sections

    #### **1. Statistics Cards**
    - Total Users
    - Active Users (green)
    - Pending Approval (yellow)
    - Suspended (red)
    - Administrators (purple)

    #### **2. Tabs**

    **Tab 1: All Users**
    - View all registered users
    - Search by name or email
    - Filter by status (Active, Pending, Suspended, Rejected)
    - Filter by role (Administrator, Desktop Agent)
    - Actions: View Details, Approve, Reject, Suspend, Activate, Delete

    **Tab 2: Pending Approval**
    - Shows only users awaiting approval
    - Quick approve/reject buttons
    - Displays registration date
    - Shows requested role

    **Tab 3: Activity Logs**
    - Last 50 activities across all users
    - Shows: User, Action, Resource, Timestamp, IP
    - Color-coded action icons (Create ➕, Edit ✏️, Delete 🗑️, etc.)

    ---

    ## 🚀 How to Use

    ### For Administrators

    #### **Approve a New User:**
    1. Go to User Management
    2. Click "Pending Approval" tab
    3. Review user details
    4. Click "Approve" button
    5. Confirm approval
    6. User can now login

    #### **Reject a Registration:**
    1. Go to User Management
    2. Click "Pending Approval" tab
    3. Click "Reject" button
    4. Enter rejection reason
    5. Confirm rejection
    6. User receives rejection status

    #### **Suspend a User:**
    1. Go to User Management
    2. Find the user in "All Users" tab
    3. Click Ban icon (🚫)
    4. Enter suspension reason
    5. Confirm suspension
    6. User cannot login until reactivated

    #### **Change User Role:**
    1. Go to User Management
    2. Find the user
    3. Click the user's name or "View Details"
    4. Select new role from dropdown
    5. Click "Update Role"
    6. User's permissions change immediately

    #### **View User Activity:**
    1. Go to User Management
    2. Click "Activity Logs" tab
    3. See all activities across all users
    4. Filter by user, action, or resource type

    #### **Delete a User:**
    1. Go to User Management
    2. Find the user (non-admin only)
    3. Click Delete icon (🗑️)
    4. Confirm deletion
    5. User account removed permanently

    **Note:** Users with existing orders cannot be deleted for data integrity.

    ---

    ### For New Users

    #### **Registration Process:**
    1. Go to login page
    2. Click "Create Account"
    3. Fill in:
    - Full Name
    - Email
    - Phone
    - Password
    4. Click "Register"
    5. **Wait for admin approval**
    6. You'll see "Awaiting admin approval" message
    7. Once approved, login with your credentials

    **What Happens:**
    - Your account starts with **PENDING** status
    - You cannot login until an administrator approves
    - Any admin can approve your account
    - You'll receive your assigned role upon approval

    ---

    ## 🔒 Database Schema

    ### activity_logs Table
    ```sql
    CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    user_email VARCHAR(255),
    user_name VARCHAR(255),
    user_role VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id INTEGER,
    details JSONB,
    ip_address VARCHAR(100),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ```

    **Indexes:**
    - user_id
    - action
    - created_at (DESC)
    - resource_type, resource_id

    ### security_audit_logs Table
    ```sql
    CREATE TABLE security_audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    email VARCHAR(255),
    event_type VARCHAR(50) NOT NULL,
    ip_address VARCHAR(100),
    user_agent TEXT,
    event_details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ```

    **Logs:**
    - LOGIN_SUCCESS
    - LOGIN_FAILED
    - PASSWORD_RESET
    - ACCOUNT_LOCKED

    ### Updated users Table
    Added fields:
    - `last_login TIMESTAMP` - Last successful login
    - `approved_by INTEGER` - Which admin approved the account
    - `approved_at TIMESTAMP` - When the account was approved
    - `rejection_reason TEXT` - Reason if rejected/suspended

    ---

    ## 🔌 API Endpoints

    All endpoints require admin authentication:
    ```typescript
    Headers: { Authorization: `Bearer ${token}` }
    ```

    ### User Management

    | Method | Endpoint | Description |
    |--------|----------|-------------|
    | GET | `/api/admin/users` | Get all users (with filters) |
    | GET | `/api/admin/users/pending` | Get pending users |
    | GET | `/api/admin/users/statistics` | Get user statistics |
    | PUT | `/api/admin/users/:userId/approve` | Approve user |
    | PUT | `/api/admin/users/:userId/reject` | Reject user |
    | PUT | `/api/admin/users/:userId/suspend` | Suspend user |
    | PUT | `/api/admin/users/:userId/activate` | Activate user |
    | PUT | `/api/admin/users/:userId/role` | Update user role |
    | DELETE | `/api/admin/users/:userId` | Delete user |

    ### Activity Logs

    | Method | Endpoint | Description |
    |--------|----------|-------------|
    | GET | `/api/admin/activity-logs` | Get activity logs (with filters) |

    **Query Parameters:**
    - `userId` - Filter by user ID
    - `action` - Filter by action type
    - `resourceType` - Filter by resource type
    - `limit` - Number of results (default: 100)
    - `offset` - Pagination offset (default: 0)

    ---

    ## 📊 Example API Responses

    ### Get All Users
    ```json
    {
    "success": true,
    "users": [
        {
        "id": 1,
        "email": "admin@lushlaundry.com",
        "full_name": "Admin User",
        "phone": "0700123456",
        "role": "ADMIN",
        "status": "ACTIVE",
        "created_at": "2026-01-01T10:00:00Z",
        "last_login": "2026-01-09T08:30:00Z",
        "created_by_name": null,
        "approved_by_name": null
        },
        {
        "id": 2,
        "email": "cashier@lushlaundry.com",
        "full_name": "Jane Doe",
        "phone": "0700234567",
        "role": "CASHIER",
        "status": "ACTIVE",
        "created_at": "2026-01-05T14:20:00Z",
        "last_login": "2026-01-09T09:15:00Z",
        "approved_by": 1,
        "approved_by_name": "Admin User",
        "approved_at": "2026-01-05T15:00:00Z"
        }
    ],
    "count": 2
    }
    ```

    ### Get Activity Logs
    ```json
    {
    "success": true,
    "logs": [
        {
        "id": 123,
        "user_id": 1,
        "user_email": "admin@lushlaundry.com",
        "user_name": "Admin User",
        "user_role": "ADMIN",
        "action": "APPROVE_USER",
        "resource_type": "USER",
        "resource_id": 2,
        "details": {
            "approved_user": "Jane Doe",
            "approved_user_email": "cashier@lushlaundry.com"
        },
        "ip_address": "192.168.1.100",
        "created_at": "2026-01-09T10:00:00Z"
        }
    ],
    "total": 1,
    "limit": 100,
    "offset": 0
    }
    ```

    ### Get Statistics
    ```json
    {
    "success": true,
    "statistics": {
        "total_users": 10,
        "active_users": 7,
        "pending_users": 2,
        "suspended_users": 1,
        "rejected_users": 0,
        "admin_count": 2,
        "manager_count": 1,
        "cashier_count": 3,
        "agent_count": 2,
        "user_count": 2
    },
    "recent_actions": [
        { "action": "CREATE_ORDER", "count": 15 },
        { "action": "APPROVE_USER", "count": 2 },
        { "action": "LOGIN_SUCCESS", "count": 45 }
    ]
    }
    ```

    ---

    ## 🛡️ Security Best Practices

    ### For Administrators:

    1. **Review Pending Users Promptly**
    - Check pending users daily
    - Verify phone numbers and email addresses
    - Confirm legitimate business purpose

    2. **Assign Appropriate Roles**
    - Don't give admin role unnecessarily
    - Cashiers should only have cashier role
    - Agents should only have agent role

    3. **Monitor Activity Logs**
    - Check logs weekly for suspicious activity
    - Look for failed login attempts
    - Verify large deletions or bulk changes

    4. **Use Suspension Instead of Deletion**
    - Suspend users who leave the company
    - Keep audit trail intact
    - Can reactivate if needed

    5. **Document Rejections/Suspensions**
    - Always provide clear reasons
    - Helps with future reference
    - Maintains accountability

    ### For All Users:

    1. **Protect Your Password**
    - Use strong, unique passwords
    - Don't share credentials
    - Change password regularly

    2. **Logout When Done**
    - Always logout after work
    - Don't leave sessions open
    - Especially on shared computers

    3. **Report Suspicious Activity**
    - Notify admins of unusual behavior
    - Report unauthorized access attempts
    - Keep business data secure

    ---

    ## 🔧 Setup & Deployment

    ### Database Migration

    Run the migration to create audit tables:

    ```bash
    cd backend
    psql -U your_username -d lush_laundry -f src/database/migrations/add_audit_logs.sql
    ```

    Or use pgAdmin:
    1. Connect to your database
    2. Open Query Tool
    3. Load `add_audit_logs.sql`
    4. Execute

    **What It Creates:**
    - `activity_logs` table
    - `security_audit_logs` table
    - Indexes for performance
    - User status enums (if not exist)
    - Additional user fields

    ### Backend Setup

    The backend routes are automatically loaded. Just ensure:

    ```typescript
    // backend/src/routes/index.ts
    import userManagementRoutes from './userManagement.routes';
    router.use('/admin', userManagementRoutes);
    ```

    **Already configured!** ✅

    ### Frontend Setup

    Route added to App.tsx:

    ```typescript
    <Route
    path="/user-management"
    element={
        <ProtectedRoute requireAdmin>
        <UserManagement />
        </ProtectedRoute>
    }
    />
    ```

    Sidebar link added (admin-only):

    ```typescript
    { name: 'User Management', href: '/user-management', icon: Shield, adminOnly: true }
    ```

    **Already configured!** ✅

    ---

    ## 📈 Monitoring & Reporting

    ### Activity Reports

    **Daily Summary:**
    - Total active users
    - New registrations
    - Pending approvals
    - Login attempts (success/failed)
    - Orders created per user
    - Most active users

    **Weekly Report:**
    - User growth
    - Role distribution
    - Suspension/activation trends
    - Security incidents
    - System usage patterns

    **Monthly Audit:**
    - Complete activity logs export
    - User access review
    - Role assignment verification
    - Compliance check

    ### Exporting Logs

    Use the API to export logs:

    ```bash
    # Get last 30 days of activity
    curl -X GET "http://localhost:3000/api/admin/activity-logs?limit=10000" \
    -H "Authorization: Bearer YOUR_TOKEN" \
    > activity_logs_30days.json
    ```

    ---

    ## 🐛 Troubleshooting

    ### Issue: "Access Denied" on User Management Page
    **Solution:**
    - Verify you're logged in as ADMIN role
    - Check AuthContext for isAdmin flag
    - Ensure JWT token includes correct role

    ### Issue: Cannot Approve Users
    **Solution:**
    - Check backend logs for errors
    - Verify database connection
    - Ensure you're an ADMIN
    - Check user status is PENDING

    ### Issue: Activity Logs Not Appearing
    **Solution:**
    - Verify tables were created (run migration)
    - Check backend middleware is attached
    - Ensure database permissions
    - Look for console errors

    ### Issue: Cannot Delete User
    **Solution:**
    - Check if user has existing orders
    - Verify user is not ADMIN role
    - Ensure you're not deleting yourself
    - Use suspend instead if orders exist

    ---

    ## ✅ Testing Checklist

    ### User Registration & Approval
    - [ ] New user can register
    - [ ] Registration shows "pending approval" status
    - [ ] Pending user cannot login
    - [ ] Admin sees pending user in dashboard
    - [ ] Admin can approve user
    - [ ] Approved user can login
    - [ ] Admin can reject user
    - [ ] Rejected user cannot login

    ### User Management
    - [ ] Admin can view all users
    - [ ] Search by name/email works
    - [ ] Status filter works
    - [ ] Role filter works
    - [ ] Admin can suspend user
    - [ ] Suspended user cannot login
    - [ ] Admin can activate suspended user
    - [ ] Admin can change user role
    - [ ] Role changes take effect immediately

    ### Activity Logging
    - [ ] User login logs activity
    - [ ] Order creation logs activity
    - [ ] User approval logs activity
    - [ ] Role change logs activity
    - [ ] Activity logs show correct user info
    - [ ] IP address is captured
    - [ ] Timestamps are accurate

    ### Security
    - [ ] Non-admin cannot access user management
    - [ ] Admin cannot suspend another admin
    - [ ] Admin cannot delete another admin
    - [ ] Admin cannot delete self
    - [ ] Users with orders cannot be deleted
    - [ ] Rejection reason is required
    - [ ] Suspension reason is required

    ---

    ## 🎉 Summary

    **What's Now Available:**

    ✅ **Professional User Management System**
    - Multi-administrator support
    - User approval workflow
    - Role-based access control
    - Activity tracking & audit logs
    - Security controls

    ✅ **Complete Admin Dashboard**
    - View all users with filters
    - Approve/reject pending users
    - Suspend/activate accounts
    - Change user roles
    - Delete users (with restrictions)
    - View activity logs

    ✅ **Comprehensive Audit Trail**
    - Every action logged
    - User identification
    - IP address tracking
    - Timestamp recording
    - Resource tracking
    - Details in JSON format

    ✅ **Security & Compliance**
    - Track who did what
    - When it happened
    - What was changed
    - Detect unauthorized actions
    - Maintain data integrity
    - Meet audit requirements

    ---

    **Ready to Use!** 🚀

    1. Run database migration
    2. Login as admin
    3. Click "User Management" in sidebar
    4. Start managing users!

    ---

    *Last Updated: January 9, 2026*
    *Lush Laundry ERP - Enterprise User Management System*
