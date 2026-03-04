# LUSH LAUNDRY ERP - ROLE-BASED ACCESS CONTROL (RBAC)

        **System:** Lush Laundry Management System  
        **Date:** February 2, 2026  
        **Roles:** ADMIN, MANAGER, DESKTOP_AGENT

        ---

        ## 🎯 Role Hierarchy

        ```
        ┌─────────────────────────────────────────────────────────┐
        │                    ADMINISTRATOR                         │
        │              (Full System Control)                       │
        │  • System configuration                                  │
        │  • Financial oversight                                   │
        │  • User management                                       │
        │  • All manager + agent permissions                       │
        └─────────────────────────────────────────────────────────┘
                                ▼
        ┌─────────────────────────────────────────────────────────┐
        │                      MANAGER                             │
        │            (Business Operations)                         │
        │  • Approve expenses                                      │
        │  • Activate/suspend desktop agents                       │
        │  • Financial reports                                     │
        │  • All desktop agent permissions                         │
        └─────────────────────────────────────────────────────────┘
                                ▼
        ┌─────────────────────────────────────────────────────────┐
        │                  DESKTOP AGENT                           │
        │               (Daily Operations)                         │
        │  • Process customer orders                               │
        │  • Accept payments                                       │
        │  • Update order status                                   │
        │  • View assigned data only                               │
        └─────────────────────────────────────────────────────────┘
        ```

        ---

        ## 📋 DETAILED PERMISSIONS MATRIX

        ### 1. CUSTOMER MANAGEMENT

        | Action | ADMIN | MANAGER | DESKTOP_AGENT |
        |--------|-------|---------|---------------|
        | **View customers** | ✅ All | ✅ All | ✅ All |
        | **Add new customer** | ✅ | ✅ | ✅ |
        | **Edit customer details** | ✅ | ✅ | ✅ Own created only |
        | **Delete customer** | ✅ | ✅ | ❌ |
        | **View customer financial history** | ✅ Complete | ✅ Complete | ✅ Basic only |
        | **Export customer data** | ✅ | ✅ | ❌ |

        **Business Rule:**
        - Customers with UNPAID/PARTIAL orders cannot be deleted (all roles)
        - Desktop agents can only edit customers they created
        - Deletion requires manager/admin approval

        ---

        ### 2. ORDER MANAGEMENT

        | Action | ADMIN | MANAGER | DESKTOP_AGENT |
        |--------|-------|---------|---------------|
        | **View orders** | ✅ All orders | ✅ All orders | ✅ Own orders only |
        | **Create order** | ✅ | ✅ | ✅ |
        | **Edit order** | ✅ Any order | ✅ Any order | ✅ Own orders (if not delivered) |
        | **Delete order** | ✅ Paid only | ✅ Paid only | ❌ |
        | **Cancel order** | ✅ | ✅ | ✅ Own orders (before processing) |
        | **Apply discount** | ✅ Up to 50% | ✅ Up to 20% | ✅ Up to 10% |
        | **Override price** | ✅ | ✅ Max 15% | ❌ |
        | **Change order status** | ✅ | ✅ | ✅ Own orders |
        | **View order analytics** | ✅ Complete | ✅ Complete | ✅ Personal stats |

        **Business Rules:**
        - Orders with UNPAID/PARTIAL status cannot be deleted (all roles)
        - Desktop agents see only orders they created
        - Discounts require approval if exceeding role limit
        - Status changes logged with user ID

        **Order Workflow:**
        ```
        Desktop Agent creates → Processing → Ready → Manager/Agent marks Delivered
                                                ↓
                                            Payment recorded
        ```

        ---

        ### 3. PAYMENT MANAGEMENT

        | Action | ADMIN | MANAGER | DESKTOP_AGENT |
        |--------|-------|---------|---------------|
        | **Accept cash payment** | ✅ | ✅ | ✅ |
        | **Accept mobile money** | ✅ | ✅ | ✅ |
        | **Accept bank transfer** | ✅ | ✅ | ❌ Manager approval |
        | **Process refund** | ✅ | ✅ | ❌ |
        | **View payment history** | ✅ All | ✅ All | ✅ Own only |
        | **Reconcile cash drawer** | ✅ | ✅ | ✅ End of shift |
        | **Override payment status** | ✅ | ✅ With reason | ❌ |

        **Business Rules:**
        - All payments logged with timestamp + user ID
        - Bank transfers require manager verification
        - Refunds require manager/admin approval with reason
        - Daily cash reconciliation mandatory for agents

        ---

        ### 4. EXPENSE MANAGEMENT

        | Action | ADMIN | MANAGER | DESKTOP_AGENT |
        |--------|-------|---------|---------------|
        | **View expenses** | ✅ All | ✅ All | ✅ Own submitted |
        | **Submit expense** | ✅ Auto-approved | ✅ Needs admin | ✅ Needs manager |
        | **Approve expense** | ✅ All | ✅ Agent expenses | ❌ |
        | **Reject expense** | ✅ | ✅ | ❌ |
        | **Edit expense** | ✅ Any | ✅ Pending only | ✅ Own pending |
        | **Delete expense** | ✅ | ❌ | ❌ |
        | **Expense categories** | ✅ Manage | ✅ View | ✅ View |

        **Expense Approval Workflow:**
        ```
        DESKTOP_AGENT submits → MANAGER approves → Recorded in books
                                    ↓ (if rejected)
                                Agent notified

        MANAGER submits → ADMIN approves → Recorded in books
                            ↓ (if rejected)
                        Manager notified

        ADMIN submits → Auto-approved → Recorded in books
        ```

        **Professional Recommendation:**
        - **Expense limits without approval:**
        - Desktop Agent: UGX 0 (all need manager approval)
        - Manager: UGX 0 (all need admin approval)
        - Admin: Unlimited (auto-approved, but logged)

        - **Categorization required:**
        - Transport, Supplies, Maintenance, Utilities, Other
        - Attach receipt/proof for amounts > UGX 50,000

        ---

        ### 5. INVENTORY MANAGEMENT

        | Action | ADMIN | MANAGER | DESKTOP_AGENT |
        |--------|-------|---------|---------------|
        | **View inventory** | ✅ | ✅ | ✅ |
        | **Add inventory item** | ✅ | ✅ | ❌ |
        | **Edit item details** | ✅ | ✅ | ❌ |
        | **Delete item** | ✅ | ✅ With reason | ❌ |
        | **Update stock levels** | ✅ | ✅ | ✅ After restocking |
        | **Low stock alerts** | ✅ | ✅ | ✅ View only |
        | **Stock transfer** | ✅ | ✅ | ❌ |
        | **Inventory reports** | ✅ Complete | ✅ Summary | ❌ |

        **Business Rules:**
        - Stock adjustments require reason (all roles)
        - Items used in orders cannot be deleted
        - Low stock emails sent to admin + managers
        - Physical inventory count monthly (manager required)

        ---

        ### 6. EMPLOYEE & PAYROLL MANAGEMENT

        | Action | ADMIN | MANAGER | DESKTOP_AGENT |
        |--------|-------|---------|---------------|
        | **View employees** | ✅ All | ✅ All | ✅ Names only |
        | **Add employee** | ✅ | ✅ Submit for approval | ❌ |
        | **Edit employee** | ✅ | ✅ Non-salary fields | ❌ |
        | **Terminate employee** | ✅ | ❌ Submit request | ❌ |
        | **Process payroll** | ✅ | ❌ | ❌ |
        | **Edit salaries** | ✅ | ❌ | ❌ |
        | **View salary amounts** | ✅ | ✅ | ❌ |
        | **Mark attendance** | ✅ | ✅ | ✅ Self only |

        **Payroll Workflow:**
        ```
        Monthly:
        ADMIN generates payroll → Reviews amounts → Approves payment
                                    ↓
                            Payment methods executed (Bank/Mobile Money)
                                    ↓
                            Salary slips generated & emailed
        ```

        **Business Rules:**
        - Only ADMIN can change salaries
        - Managers can submit salary change requests
        - Employee cannot be deleted if they have salary history
        - Payroll records are immutable after approval

        ---

        ### 7. USER MANAGEMENT

        | Action | ADMIN | MANAGER | DESKTOP_AGENT |
        |--------|-------|---------|---------------|
        | **View users** | ✅ All | ✅ Agents only | ❌ |
        | **Create user** | ✅ All roles | ✅ Desktop agents | ❌ |
        | **Edit user** | ✅ All | ✅ Agents only | ❌ |
        | **Delete user** | ✅ | ❌ | ❌ |
        | **Activate user** | ✅ | ✅ Agents only | ❌ |
        | **Suspend user** | ✅ | ✅ Agents only | ❌ |
        | **Reset password** | ✅ All | ✅ Agents only | ✅ Own only |
        | **Change role** | ✅ | ❌ | ❌ |

        **User Management Workflow:**

        **Creating Desktop Agent (by Manager):**
        ```
        1. Manager creates agent account (status: PENDING)
        2. Admin reviews & activates (status: ACTIVE)
        3. Agent receives credentials via email
        4. Agent logs in & changes password
        ```

        **Creating Manager (Admin only):**
        ```
        1. Admin creates manager account
        2. Manager receives credentials
        3. Manager logs in & sets password
        ```

        **Suspending User:**
        ```
        Manager suspends agent → Immediate effect → Admin notified
        Admin can suspend anyone → Immediate effect
        Suspended user cannot login
        ```

        **Business Rules:**
        - Users tied to orders/expenses cannot be deleted
        - Can mark as INACTIVE instead
        - All user actions logged (audit trail)
        - Session timeout: 15 minutes (configurable by admin)

        ---

        ### 8. PRICE LIST MANAGEMENT

        | Action | ADMIN | MANAGER | DESKTOP_AGENT |
        |--------|-------|---------|---------------|
        | **View price list** | ✅ | ✅ | ✅ |
        | **Add price item** | ✅ | ✅ Submit for approval | ❌ |
        | **Edit price** | ✅ | ✅ Submit for approval | ❌ |
        | **Delete price item** | ✅ | ❌ | ❌ |
        | **Apply discount** | ✅ | ✅ Up to 20% | ❌ |
    | **Set express pricing** | ✅ Manual/Auto | ✅ Submit for approval | ❌ |
    | **Deactivate item** | ✅ | ✅ | ❌ |

    **Price Change Workflow:**
    ```
    Manager submits price change → Admin reviews → Approves/Rejects
                                        ↓ (if approved)
                                New price effective from date
                                        ↓
                                Old orders retain old pricing
    ```

    **Express Pricing Logic:**

    **When CREATING a price item (Admin only):**
    ```
    1. Admin enters wash_price (e.g., UGX 5,000)
    2. System AUTOMATICALLY calculates express_price = wash_price × 2
    → Express price: UGX 10,000 (automatic, not editable during creation)
    3. Price item saved with:
    - wash_price: 5,000
    - iron_price: 4,000 (manual entry)
    - express_price: 10,000 (auto-calculated)
    - express_mode: 'AUTO' (system flag)
    ```

    **When EDITING a price item (Admin only):**
    ```
    Admin has TWO options:

    OPTION 1: Keep Automatic (Default)
    - Toggle: "Express Pricing: AUTO"
    - Express price = wash_price × 2
    - If wash_price changes, express auto-updates
    - express_mode: 'AUTO'

    OPTION 2: Set Manual Override
    - Toggle: "Express Pricing: MANUAL"
    - Admin enters custom express_price (e.g., UGX 12,000)
    - Express price stays at 12,000 even if wash_price changes
    - express_mode: 'MANUAL'

    Admin can switch between AUTO ↔ MANUAL anytime:
    - AUTO → MANUAL: Enter custom price
    - MANUAL → AUTO: System recalculates (wash_price × 2)
    ```

    **Example Scenarios:**

    **Scenario 1: Standard Item (Automatic)**
    ```
    Suit:
    - Wash: UGX 5,000
    - Iron: UGX 4,000
    - Express: AUTO (5,000 × 2 = 10,000)

    Admin edits wash price to 6,000:
    - Express auto-updates to 12,000 ✅
    ```

    **Scenario 2: Premium Item (Manual Override)**
    ```
    Wedding Dress:
    - Wash: UGX 15,000
    - Iron: UGX 12,000
    - Express: MANUAL (UGX 25,000) ← Admin sets custom price

    Admin edits wash price to 18,000:
    - Express stays at 25,000 (manual override) ✅
    ```

    **Scenario 3: Reverting to Automatic**
    ```
    Admin previously set manual express price (25,000)
    Admin toggles back to AUTO:
    - System recalculates: 18,000 × 2 = 36,000
    - Express mode: AUTO
    ```

    **Business Rules:**
    - Price items used in orders cannot be deleted
    - Can deactivate instead (is_active = false)
    - Price history maintained
    - **Express pricing:**
    - **Creation:** Always automatic (2× wash price)
    - **Editing:** Admin chooses AUTO or MANUAL
    - **AUTO mode:** Express = wash_price × 2 (updates automatically)
    - **MANUAL mode:** Admin sets custom price (stays fixed)
    - Manager price change requests require admin approval
        | **Expense reports** | ✅ | ✅ | ❌ |
        | **Customer analytics** | ✅ | ✅ | ✅ Own customers |
        | **Employee performance** | ✅ | ✅ | ✅ Self only |
        | **Inventory reports** | ✅ | ✅ | ❌ |
        | **Financial statements** | ✅ | ✅ View only | ❌ |
        | **Export data (CSV/PDF)** | ✅ | ✅ | ❌ |
        | **Custom reports** | ✅ | ❌ | ❌ |

        **Dashboard Views:**

        **ADMIN sees:**
        - Total revenue (all time + today)
        - Total expenses breakdown
        - Profit/loss trends
        - Outstanding balances
        - Employee performance
        - System health

        **MANAGER sees:**
        - Revenue (all time + today)
        - Expense summary
        - Pending approvals (expenses, users)
        - Order status distribution
        - Customer retention

        **DESKTOP_AGENT sees:**
        - Personal orders today
        - Personal revenue today
        - Pending orders assigned
        - Customer pickups pending
        - Personal performance metrics

        ---

        ### 10. ACCOUNTING & FINANCIAL MANAGEMENT

        | Action | ADMIN | MANAGER | DESKTOP_AGENT |
        |--------|-------|---------|---------------|
        | **Income statement** | ✅ | ✅ View | ❌ |
        | **Balance sheet** | ✅ | ✅ View | ❌ |
        | **Cash flow** | ✅ | ✅ View | ❌ |
        | **Trial balance** | ✅ | ❌ | ❌ |
        | **Fiscal year close** | ✅ | ❌ | ❌ |
        | **Chart of accounts** | ✅ Manage | ✅ View | ❌ |
        | **Journal entries** | ✅ | ❌ | ❌ |
        | **Reconciliation** | ✅ | ✅ Submit | ❌ |

        **Business Rules:**
        - Financial statements generated automatically
        - Only ADMIN can close fiscal year
        - Accounting entries immutable after month-end
        - Monthly reconciliation required (manager submits, admin approves)

        ---

        ### 11. SETTINGS & CONFIGURATION

        | Action | ADMIN | MANAGER | DESKTOP_AGENT |
        |--------|-------|---------|---------------|
        | **Business settings** | ✅ | ❌ | ❌ |
        | **Tax rates** | ✅ | ❌ | ❌ |
        | **Discount rules** | ✅ | ✅ View | ❌ |
        | **Notification settings** | ✅ | ✅ Own only | ✅ Own only |
        | **Backup settings** | ✅ | ❌ | ❌ |
        | **Email templates** | ✅ | ❌ | ❌ |
        | **SMS settings** | ✅ | ❌ | ❌ |
        | **WhatsApp integration** | ✅ | ❌ | ❌ |
        | **Session timeout** | ✅ | ❌ | ❌ |

        ---

        ### 12. NOTIFICATIONS & ALERTS

        | Notification Type | ADMIN | MANAGER | DESKTOP_AGENT |
        |-------------------|-------|---------|---------------|
        | **Low stock alerts** | ✅ | ✅ | ❌ |
        | **Overdue payments** | ✅ | ✅ | ✅ Own only |
        | **Pending approvals** | ✅ | ✅ | ❌ |
        | **Daily sales summary** | ✅ | ✅ | ✅ Personal |
        | **Employee absence** | ✅ | ✅ | ❌ |
        | **System errors** | ✅ | ❌ | ❌ |
        | **Backup status** | ✅ | ❌ | ❌ |
        | **Order ready** | ✅ | ✅ | ✅ Own orders |

        ---

        ## 🔐 SECURITY & AUDIT

        ### Audit Trail (All Roles)

        Every action is logged with:
        - User ID + Role
        - Action type (CREATE, UPDATE, DELETE)
        - Timestamp
        - IP address
        - Before/after values (for updates)
        - Reason (for deletions/major changes)

        **Logged Actions:**
        - User login/logout
        - Order creation/modification
        - Payment processing
        - Expense submission/approval
        - Inventory adjustments
        - Price changes
        - User management actions
        - System settings changes

        **Retention:** 7 years (compliance)

        ---

        ### Session Management

        | Setting | ADMIN | MANAGER | DESKTOP_AGENT |
        |---------|-------|---------|---------------|
        | **Session timeout** | 30 min | 20 min | 15 min |
        | **Concurrent sessions** | 3 | 2 | 1 |
        | **IP restriction** | Optional | Optional | Recommended |
        | **2FA requirement** | Recommended | Optional | Optional |

        ---

        ## 📱 MOBILE ACCESS

        | Feature | ADMIN | MANAGER | DESKTOP_AGENT |
        |---------|-------|---------|---------------|
        | **Mobile app** | ✅ Full access | ✅ Limited | ✅ Orders only |
        | **Approve expenses** | ✅ | ✅ | ❌ |
        | **View reports** | ✅ | ✅ | ✅ Personal |
        | **Process payments** | ✅ | ✅ | ✅ |
        | **Notifications** | ✅ | ✅ | ✅ |

        ---

        ## 🎯 RECOMMENDED PROFESSIONAL SETUP

        ### Expense Approval (Recommended):

        **All expenses require approval - no auto-approval for anyone:**

        ```
        DESKTOP_AGENT expense → MANAGER reviews → Approves/Rejects
                                    ↓
                            Recorded in books

        MANAGER expense → ADMIN reviews → Approves/Rejects
                            ↓
                        Recorded in books

        ADMIN expense → LOGGED (no approval needed, but auditable)
        ```

        **Benefits:**
        - ✅ Two-person verification for all money out
        - ✅ Prevents unauthorized spending
        - ✅ Audit trail for compliance
        - ✅ Manager accountability (admin oversight)

        ### User Activation (Recommended):

        **Managers can create desktop agents, admin activates:**

        ```
        MANAGER creates agent account → Status: PENDING
                            ↓
        ADMIN reviews & activates → Status: ACTIVE
                            ↓
        Agent receives credentials → Logs in
        ```

        **Benefits:**
        - ✅ Managers handle daily staffing
        - ✅ Admin maintains security oversight
        - ✅ Prevents unauthorized access
        - ✅ Clear separation of duties

        ---

        ## 📊 IMPLEMENTATION IN BACKEND

        ### Middleware Structure:

        ```typescript
        // backend/src/middleware/rbac.ts

        export const requireAdmin = (req, res, next) => {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        next();
        };

        export const requireManager = (req, res, next) => {
        if (!['ADMIN', 'MANAGER'].includes(req.user.role)) {
            return res.status(403).json({ error: 'Manager access required' });
        }
        next();
        };

        export const requireDesktopAgent = (req, res, next) => {
        // All authenticated users can access (if needed)
        next();
        };
        ```

        ### Route Protection Examples:

        ```typescript
        // Expenses - Only managers can approve
        router.post('/expenses/:id/approve', 
        authenticate, 
        requireManager, 
        expenseController.approve
        );

        // Users - Only admin can change roles
        router.patch('/users/:id/role', 
        authenticate, 
        requireAdmin, 
        userController.changeRole
        );

        // Orders - All authenticated users
        router.post('/orders', 
        authenticate, 
        orderController.create
        );
        ```

        ---

        ## 🎓 ROLE SUMMARIES

        ### 👑 ADMINISTRATOR
        **Who:** Business owner, IT manager  
        **Access:** Everything  
        **Responsibilities:**
        - System configuration
        - Financial oversight
        - User management
        - Approve manager expenses
        - Close fiscal periods
        - Final authority on all decisions

        **Cannot:** Delete records tied to financial data (system protection)

        ---

        ### 👔 MANAGER
        **Who:** Branch manager, operations manager  
        **Access:** Business operations  
        **Responsibilities:**
        - Approve desktop agent expenses
        - Activate/suspend desktop agents
        - Monitor daily operations
        - Review financial reports
        - Handle customer escalations
        - Submit own expenses to admin

        **Cannot:** 
        - Delete users
        - Change system settings
        - Process payroll
        - Access admin functions

        ---

        ### 💼 DESKTOP AGENT
        **Who:** Front desk staff, cashiers  
        **Access:** Daily customer service  
        **Responsibilities:**
        - Create/process orders
        - Accept payments
        - Update order status
        - Submit expenses for approval
        - Reconcile daily cash
        - Customer service

        **Cannot:**
        - Approve anything
        - Delete orders/customers
        - View other agents' data
        - Access financial reports
        - Manage inventory
        - Create users

        ---

        ## ✅ BEST PRACTICES

        1. **Least Privilege:** Users get minimum access needed for their job
        2. **Separation of Duties:** No one can approve their own actions
        3. **Audit Everything:** All actions logged with user ID
        4. **Regular Reviews:** Admin reviews permissions quarterly
        5. **Offboarding:** Immediately suspend users when they leave
        6. **Strong Passwords:** Enforce password complexity
        7. **Session Management:** Auto-logout after inactivity
        8. **Training:** Document what each role can/cannot do

        ---

        **This RBAC model ensures:**
        - ✅ Security (proper access control)
        - ✅ Accountability (audit trail)
        - ✅ Efficiency (managers handle daily approvals)
        - ✅ Compliance (financial controls)
        - ✅ Scalability (easy to add more roles)

        **Recommended for production use.**
