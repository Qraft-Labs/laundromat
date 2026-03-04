# Production User Account Setup Guide

    ## Overview
    This document explains the user account structure for production deployment, including admin accounts for business owners and developer super-admin access for troubleshooting.

    ---

    ## 1. User Account Types

    ### A. **Business Admin Account** (Primary Administrator)
    - **Purpose**: Day-to-day business management
    - **Access**: Full admin access to all features
    - **Login Method**: Google OAuth (Gmail)
    - **Created**: Automatically on first Google sign-in
    - **Permissions**:
    - Manage orders, customers, payments
    - View reports and analytics
    - Approve expenses
    - Manage staff accounts (cashiers, drivers)
    - Configure price list and delivery zones

    ### B. **Developer Super Admin Account** (Technical Support)
    - **Purpose**: Technical troubleshooting and system maintenance
    - **Access**: Full admin access + system logs
    - **Login Method**: Google OAuth (Your Gmail)
    - **Created**: Automatically on first Google sign-in
    - **Additional Features**:
    - Access to raw database queries (future)
    - System health monitoring
    - Error log viewing
    - Database backup/restore

    ### C. **Desktop Agent Accounts** (Cashiers/Staff)
    - **Purpose**: Front-desk order taking
    - **Access**: Limited to orders, customers, payments
    - **Login Method**: Email + password (temporary, must change)
    - **Created**: By admin via User Management page

    ### D. **Driver Accounts**
    - **Purpose**: Delivery management
    - **Access**: View assigned deliveries only
    - **Login Method**: Email + password
    - **Created**: By admin via User Management page

    ---

    ## 2. Initial Setup Steps

    ### Step 1: Configure Authorized Admin Emails

    Edit `.env` file to whitelist both admin accounts:

    ```env
    AUTHORIZED_ADMIN_EMAILS=businessowner@gmail.com,hussein@yourdomain.com
    ```

    **Replace**:
    - `businessowner@gmail.com` - Business owner's Gmail
    - `hussein@yourdomain.com` - Your developer Gmail

    ### Step 2: Deploy Application

    ```bash
    # Run deployment cleanup (ONCE)
    psql -U postgres -d lush_laundry -f backend/src/database/clear_test_data.sql

    # Start production server
    cd backend
    npm run build
    pm2 start dist/server.js --name lush-laundry-api
    ```

    ### Step 3: First Admin Login (Business Owner)

    1. Open production URL: `https://yourdomain.com`
    2. Click **"Sign in with Google"**
    3. Select business owner's Gmail account
    4. System automatically creates admin account
    5. Redirect to dashboard

    **Database Record Created**:
    ```sql
    INSERT INTO users (full_name, email, role, auth_provider, google_id)
    VALUES ('Business Owner', 'businessowner@gmail.com', 'ADMIN', 'GOOGLE', 'google_user_id_here');
    ```

    ### Step 4: Second Admin Login (Developer)

    1. Open same URL: `https://yourdomain.com`
    2. Click **"Sign in with Google"**
    3. Select your developer Gmail
    4. System creates second admin account
    5. Redirect to dashboard

    **Result**: Two admin accounts exist, both with full access.

    ---

    ## 3. Creating Staff Accounts

    ### For Desktop Agents (Cashiers):

    **Via Web Admin Panel**:
    1. Login as admin (Google OAuth)
    2. Go to **User Management** page
    3. Click **"Add New User"**
    4. Fill form:
    - **Full Name**: Jane Doe
    - **Email**: jane@lushlaundry.com
    - **Phone**: +256700000000
    - **Role**: Desktop Agent
    5. Click **"Create User"**

    **System generates**:
    - Random 8-character temporary password (e.g., `AB12CD34`)
    - Password expires in 7 days
    - `must_change_password = true`

    **Share credentials**:
    ```
    Desktop Agent Login:
    Email: jane@lushlaundry.com
    Temporary Password: AB12CD34

    ⚠️ This password expires in 7 days.
    You MUST change it on first login.
    ```

    ### First Login (Desktop Agent):

    1. Agent opens desktop app
    2. Enters email + temp password
    3. System prompts: **"You must change your password"**
    4. Agent enters new password (minimum 6 characters)
    5. Password saved, `must_change_password = false`
    6. Access granted

    ---

    ## 4. Account Comparison Table

    | Feature | Business Admin | Developer Admin | Desktop Agent | Driver |
    |---------|---------------|-----------------|---------------|--------|
    | **Login Method** | Google OAuth | Google OAuth | Email + Password | Email + Password |
    | **Auto-Created** | ✅ Yes | ✅ Yes | ❌ Manual | ❌ Manual |
    | **Manage Users** | ✅ Yes | ✅ Yes | ❌ No | ❌ No |
    | **View Reports** | ✅ Yes | ✅ Yes | ❌ No | ❌ No |
    | **Take Orders** | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
    | **Approve Expenses** | ✅ Yes | ✅ Yes | ❌ No | ❌ No |
    | **View Deliveries** | ✅ All | ✅ All | ✅ All | ✅ Assigned only |
    | **Temp Password** | ❌ No | ❌ No | ✅ Yes | ✅ Yes |
    | **Email Whitelist** | ✅ Required | ✅ Required | ❌ Not required | ❌ Not required |

    ---

    ## 5. Security Best Practices

    ### For Admin Accounts:

    1. **Use Gmail with 2FA**:
    - Enable 2-factor authentication on Gmail
    - Adds extra security layer before OAuth

    2. **Limit Authorized Emails**:
    - Only add trusted Gmail accounts to whitelist
    - Update `.env` when admin changes

    3. **Regular Review**:
    - Quarterly review of admin access
    - Remove departed staff from whitelist

    ### For Desktop Agents:

    1. **Temporary Password Policy**:
    - 7-day expiration (default)
    - Contact admin to reset if expired

    2. **Strong Password Requirements**:
    - Minimum 6 characters (enforced)
    - Recommend: uppercase, lowercase, numbers

    3. **Account Deactivation**:
    - When staff leaves, delete their user account
    - System blocks deletion if they created orders

    ---

    ## 6. Troubleshooting Access

    ### Issue: "Email not authorized" when admin logs in

    **Cause**: Gmail not in `AUTHORIZED_ADMIN_EMAILS` whitelist

    **Solution**:
    ```bash
    # Edit .env
    nano .env

    # Add email to list
    AUTHORIZED_ADMIN_EMAILS=existing@gmail.com,newadmin@gmail.com

    # Restart server
    pm2 restart lush-laundry-api
    ```

    ### Issue: Desktop agent says "Temporary password expired"

    **Cause**: 7 days passed since account creation

    **Solution**:
    1. Admin deletes old user account
    2. Admin creates new account with same email
    3. New temp password generated
    4. Share new credentials with agent

    ### Issue: Can't delete user account

    **Cause**: User created orders (preserves audit trail)

    **Solution**:
    - System intentionally blocks deletion
    - Keep account for historical records
    - Or manually delete orders first (not recommended)

    ---

    ## 7. Database Schema Reference

    ```sql
    -- Users table structure
    CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password VARCHAR(255),  -- NULL for Google OAuth users
    role VARCHAR(20) NOT NULL,  -- ADMIN, CASHIER, DRIVER
    auth_provider VARCHAR(20) DEFAULT 'LOCAL',  -- GOOGLE or LOCAL
    google_id VARCHAR(255),  -- Google user ID
    must_change_password BOOLEAN DEFAULT FALSE,
    temp_password_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ```

    ---

    ## 8. Quick Reference Commands

    ### Check current admins:
    ```sql
    SELECT full_name, email, role, auth_provider, created_at
    FROM users
    WHERE role = 'ADMIN'
    ORDER BY created_at;
    ```

    ### Add admin email to whitelist:
    ```bash
    # Edit .env
    AUTHORIZED_ADMIN_EMAILS=admin1@gmail.com,admin2@gmail.com,developer@gmail.com
    ```

    ### Manually create admin (emergency):
    ```sql
    -- Only if Google OAuth fails
    INSERT INTO users (full_name, email, role, auth_provider)
    VALUES ('Emergency Admin', 'emergency@gmail.com', 'ADMIN', 'GOOGLE');
    ```

    ### Check all active users:
    ```sql
    SELECT full_name, email, role, auth_provider, must_change_password
    FROM users
    ORDER BY role, created_at;
    ```

    ---

    ## 9. Post-Deployment Checklist

    - [ ] Business owner Gmail added to `.env` whitelist
    - [ ] Developer Gmail added to `.env` whitelist
    - [ ] Business owner successfully logged in via Google
    - [ ] Developer successfully logged in via Google
    - [ ] First desktop agent account created
    - [ ] Desktop agent successfully changed temp password
    - [ ] All staff accounts created (cashiers, drivers)
    - [ ] Test login for each role

    ---

    ## 10. Future Enhancements

    ### Possible Additions:
    - **Role-based permissions**: Fine-grained access control
    - **Activity logging**: Track who did what and when
    - **Session management**: Auto-logout after inactivity
    - **Password complexity**: Enforce stronger password rules
    - **Account lockout**: Lock after 5 failed login attempts

    ---

    ## Support

    For technical issues or questions:
    - Developer: hussein@yourdomain.com
    - System logs: Check `pm2 logs lush-laundry-api`
    - Database access: `psql -U postgres -d lush_laundry`
