# Financial Management & Expense Tracking System

    ## Overview

    Complete financial management system for tracking daily expenses, revenue, and profitability. **Admin-only access** ensures financial data security.

    ## Features

    ### 1. 💰 Daily Expense Recording
    Record all business expenses with detailed information:
    - **Date** - When expense occurred
    - **Category** - Predefined categories (Salaries, Transport, Utilities, etc.)
    - **Description** - What the expense was for
    - **Amount** - Money spent
    - **Payment Method** - CASH, MOBILE_MONEY, BANK_TRANSFER, CARD
    - **Paid To** - Who received the payment
    - **Receipt Number** - Optional receipt reference
    - **Notes** - Additional details
    - **Approval Status** - PENDING → APPROVED/REJECTED by admin

    ### 2. 📊 Financial Dashboard (Admin Only)
    Real-time overview of business finances:
    - **Total Revenue** - Money coming IN from orders
    - **Total Expenses** - Money going OUT (approved expenses)
    - **Net Profit** - Revenue - Expenses
    - **Cash Flow** - Paid vs Outstanding amounts
    - **Top Expense Categories** - Where money is being spent
    - **Daily Trends** - 30-day revenue/expense/profit chart
    - **Pending Approvals** - Expenses awaiting admin approval

    ### 3. 📈 Financial Reports
    Comprehensive reports with date ranges:
    - **Profit & Loss Statement** - Complete P&L with margins
    - **Revenue Breakdown** - By payment status (PAID, PARTIAL, UNPAID)
    - **Expense Breakdown** - By category
    - **Top Customers** - By revenue contribution
    - **Daily/Weekly/Monthly Grouping** - Flexible reporting periods

    ### 4. ✅ Approval Workflow
    Two-step expense process:
    1. **User Records** - Any user can record expenses
    2. **Admin Approves** - Only approved expenses count in financials
    3. **Cannot Edit** - Once approved, expense is locked (prevents fraud)

    ---

    ## Database Tables

    ### `expenses`
    ```sql
    - id (Primary Key)
    - expense_date (Date of expense)
    - category_id (FK to expense_categories)
    - description (What was purchased/paid for)
    - amount (Money spent)
    - payment_method (CASH, MOBILE_MONEY, BANK_TRANSFER, CARD)
    - paid_to (Recipient name)
    - receipt_number (Optional)
    - notes (Additional details)
    - recorded_by (FK to users - who recorded it)
    - approved_by (FK to users - admin who approved)
    - approval_status (PENDING, APPROVED, REJECTED)
    - created_at, updated_at
    ```

    ### `expense_categories`
    ```sql
    - id (Primary Key)
    - name (Category name)
    - description
    - color (Hex color for UI)
    - is_active (Boolean)
    ```

    **Default Categories:**
    1. Salaries & Wages
    2. Transport
    3. Utilities
    4. Supplies
    5. Maintenance
    6. Rent
    7. Marketing
    8. Miscellaneous

    ### `financial_summary`
    ```sql
    - id (Primary Key)
    - summary_date (Date)
    - total_revenue (From orders)
    - total_expenses (From expenses)
    - net_profit (Revenue - Expenses)
    - orders_count
    - expenses_count
    ```

    **Auto-updated via triggers:**
    - When order is created → revenue increases
    - When expense is added → expenses increase
    - Net profit calculated automatically

    ---

    ## API Endpoints

    ### Expenses

    #### 1. Record Expense
    **POST** `/api/expenses`
    ```json
    {
    "expense_date": "2026-01-10",
    "category_id": 2,
    "description": "Transport for delivery to customer",
    "amount": 15000,
    "payment_method": "CASH",
    "paid_to": "Boda Boda Driver",
    "receipt_number": "TRP-001",
    "notes": "Urgent delivery to Kampala"
    }
    ```

    **Response:**
    ```json
    {
    "message": "Expense recorded successfully",
    "expense": {
        "id": 1,
        "expense_date": "2026-01-10",
        "description": "Transport for delivery to customer",
        "amount": "15000.00"
    }
    }
    ```

    #### 2. Get All Expenses
    **GET** `/api/expenses?page=1&limit=20&from_date=2026-01-01&to_date=2026-01-31&category_id=2&approval_status=PENDING&search=transport`

    **Response:**
    ```json
    {
    "expenses": [
        {
        "id": 1,
        "expense_date": "2026-01-10",
        "description": "Transport for delivery",
        "amount": "15000.00",
        "payment_method": "CASH",
        "paid_to": "Boda Boda Driver",
        "category_name": "Transport",
        "category_color": "#3b82f6",
        "approval_status": "PENDING",
        "recorded_by_name": "John Doe",
        "approved_by_name": null,
        "created_at": "2026-01-10T10:30:00Z"
        }
    ],
    "pagination": {
        "currentPage": 1,
        "totalPages": 3,
        "totalCount": 45,
        "pageSize": 20
    }
    }
    ```

    #### 3. Approve/Reject Expense (Admin Only)
    **PATCH** `/api/expenses/:id/approve`
    ```json
    {
    "approval_status": "APPROVED"  // or "REJECTED"
    }
    ```

    #### 4. Get Expense Statistics (Admin Only)
    **GET** `/api/expenses/statistics?from_date=2026-01-01&to_date=2026-01-31`

    **Response:**
    ```json
    {
    "total": {
        "total_expenses": "500000.00",
        "total_count": 45
    },
    "byCategory": [
        {
        "category": "Salaries & Wages",
        "color": "#10b981",
        "amount": "200000.00",
        "count": 5
        },
        {
        "category": "Transport",
        "amount": "150000.00",
        "count": 20
        }
    ],
    "pending": {
        "pending_count": 5,
        "pending_amount": "75000.00"
    }
    }
    ```

    ### Financial Reports (Admin Only)

    #### 1. Financial Dashboard
    **GET** `/api/financial/dashboard?period=month`

    Periods: `today`, `week`, `month`, `year`

    **Response:**
    ```json
    {
    "summary": {
        "total_revenue": "5000000.00",
        "total_expenses": "2000000.00",
        "net_profit": "3000000.00",
        "total_orders": 150,
        "total_expense_records": 45
    },
    "revenueBreakdown": [
        { "payment_status": "PAID", "count": 120, "amount": "4500000.00" },
        { "payment_status": "PARTIAL", "count": 20, "amount": "300000.00" },
        { "payment_status": "UNPAID", "count": 10, "amount": "200000.00" }
    ],
    "topExpenses": [
        { "category": "Salaries & Wages", "amount": "800000.00", "count": 5 },
        { "category": "Rent", "amount": "500000.00", "count": 1 }
    ],
    "dailyTrend": [
        { "date": "2026-01-01", "revenue": "150000", "expenses": "50000", "profit": "100000" },
        { "date": "2026-01-02", "revenue": "200000", "expenses": "75000", "profit": "125000" }
    ],
    "cashFlow": {
        "cash_in": "4500000.00",
        "outstanding": "500000.00"
    },
    "pendingExpenses": {
        "count": 5,
        "amount": "75000.00"
    }
    }
    ```

    #### 2. Detailed Financial Report
    **GET** `/api/financial/report?from_date=2026-01-01&to_date=2026-01-31&group_by=day`

    Group by: `day`, `week`, `month`

    **Response:**
    ```json
    {
    "period": {
        "from": "2026-01-01",
        "to": "2026-01-31",
        "grouping": "day"
    },
    "summary": [
        {
        "period": "2026-01-01",
        "revenue": "150000",
        "expenses": "50000",
        "profit": "100000",
        "orders": 5,
        "expense_records": 3
        }
    ],
    "expenseBreakdown": [
        { "category": "Transport", "amount": "150000", "count": 20 }
    ],
    "revenueSources": [
        { "payment_status": "PAID", "order_count": 120, "total_amount": "4500000" }
    ],
    "topCustomers": [
        { "name": "John Doe", "phone": "+256700123456", "order_count": 10, "total_spent": "300000" }
    ]
    }
    ```

    #### 3. Profit & Loss Statement
    **GET** `/api/financial/profit-loss?from_date=2026-01-01&to_date=2026-01-31`

    **Response:**
    ```json
    {
    "period": {
        "from": "2026-01-01",
        "to": "2026-01-31"
    },
    "revenue": {
        "gross_revenue": 5000000,
        "discounts": 200000,
        "net_revenue": 4800000,
        "cash_received": 4500000,
        "outstanding": 300000
    },
    "expenses": {
        "categories": [
        { "category": "Salaries & Wages", "amount": "800000" },
        { "category": "Transport", "amount": "150000" },
        { "category": "Utilities", "amount": "100000" }
        ],
        "total": 2000000
    },
    "summary": {
        "net_profit": 2800000,
        "profit_margin": "58.33%",
        "total_orders": 150
    }
    }
    ```

    ---

    ## User Permissions

    | Feature | User/Cashier | Admin |
    |---------|--------------|-------|
    | Record Expense | ✅ Yes | ✅ Yes |
    | View Own Expenses | ✅ Yes | ✅ Yes |
    | View All Expenses | ❌ No | ✅ Yes |
    | Approve Expenses | ❌ No | ✅ Yes |
    | Edit Approved Expenses | ❌ No | ❌ No |
    | Delete Approved Expenses | ❌ No | ❌ No |
    | Financial Dashboard | ❌ No | ✅ Yes |
    | Financial Reports | ❌ No | ✅ Yes |
    | Profit & Loss | ❌ No | ✅ Yes |

    ---

    ## Setup Instructions

    ### 1. Run Database Migration

    ```bash
    cd D:\work_2026\lush_laundry\backend
    psql -U postgres -d lush_laundry -f src/database/migrations/add_expenses_and_financials.sql
    ```

    This creates:
    - ✅ `expenses` table
    - ✅ `expense_categories` table (with 8 default categories)
    - ✅ `financial_summary` table
    - ✅ Auto-triggers to update financial summary

    ### 2. Restart Backend Server

    ```bash
    npm run dev
    ```

    ### 3. Test API Endpoints

    Use Postman or frontend to test:
    - Record expense
    - View expenses
    - Approve expense (as admin)
    - View financial dashboard

    ---

    ## Frontend Implementation Example

    ### Daily Expenses Page Component

    ```tsx
    // frontend/src/pages/Expenses.tsx
    import { useState, useEffect } from 'react';
    import { Button } from '@/components/ui/button';
    import { Dialog } from '@/components/ui/dialog';
    import { Input } from '@/components/ui/input';
    import { Textarea } from '@/components/ui/textarea';
    import { Select } from '@/components/ui/select';
    import { Badge } from '@/components/ui/badge';
    import { Plus, DollarSign, Check, X } from 'lucide-react';
    import axios from 'axios';

    export const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [formData, setFormData] = useState({
        expense_date: new Date().toISOString().split('T')[0],
        category_id: '',
        description: '',
        amount: '',
        payment_method: 'CASH',
        paid_to: '',
        receipt_number: '',
        notes: '',
    });

    useEffect(() => {
        fetchExpenses();
        fetchCategories();
    }, []);

    const fetchExpenses = async () => {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/expenses', {
        headers: { Authorization: `Bearer ${token}` },
        });
        setExpenses(response.data.expenses);
    };

    const fetchCategories = async () => {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/expenses/categories', {
        headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(response.data);
    };

    const handleSubmit = async () => {
        const token = localStorage.getItem('token');
        await axios.post('http://localhost:5000/api/expenses', formData, {
        headers: { Authorization: `Bearer ${token}` },
        });
        setShowAddDialog(false);
        fetchExpenses();
    };

    const handleApprove = async (id: number, status: 'APPROVED' | 'REJECTED') => {
        const token = localStorage.getItem('token');
        await axios.patch(
        `http://localhost:5000/api/expenses/${id}/approve`,
        { approval_status: status },
        { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchExpenses();
    };

    return (
        <div className="p-6">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Daily Expenses</h1>
            <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Record Expense
            </Button>
        </div>

        <div className="bg-white rounded-lg shadow">
            <table className="w-full">
            <thead className="bg-gray-50">
                <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-left">Paid To</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
                </tr>
            </thead>
            <tbody>
                {expenses.map((expense) => (
                <tr key={expense.id} className="border-t">
                    <td className="px-4 py-3">{expense.expense_date}</td>
                    <td className="px-4 py-3">
                    <Badge style={{ backgroundColor: expense.category_color }}>
                        {expense.category_name}
                    </Badge>
                    </td>
                    <td className="px-4 py-3">{expense.description}</td>
                    <td className="px-4 py-3 text-right font-semibold">
                    UGX {parseFloat(expense.amount).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">{expense.paid_to || '-'}</td>
                    <td className="px-4 py-3">
                    <Badge
                        className={
                        expense.approval_status === 'APPROVED'
                            ? 'bg-green-500'
                            : expense.approval_status === 'REJECTED'
                            ? 'bg-red-500'
                            : 'bg-yellow-500'
                        }
                    >
                        {expense.approval_status}
                    </Badge>
                    </td>
                    <td className="px-4 py-3">
                    {expense.approval_status === 'PENDING' && (
                        <div className="flex gap-2">
                        <Button
                            size="sm"
                            className="bg-green-500"
                            onClick={() => handleApprove(expense.id, 'APPROVED')}
                        >
                            <Check className="w-4 h-4" />
                        </Button>
                        <Button
                            size="sm"
                            className="bg-red-500"
                            onClick={() => handleApprove(expense.id, 'REJECTED')}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                        </div>
                    )}
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>

        {/* Add Expense Dialog - implement with Dialog component */}
        </div>
    );
    };
    ```

    ---

    ## Security Features

    1. **Admin-Only Financial Data** - Regular users cannot see profit/loss
    2. **Approval Workflow** - Expenses must be approved to count
    3. **Immutable After Approval** - Cannot edit/delete approved expenses
    4. **Activity Logging** - All expense actions logged
    5. **User Tracking** - Know who recorded and who approved each expense

    ---

    ## Use Cases

    ### Daily Operations
    1. **Morning**: Cashier records overnight cleaning supplies expense
    2. **Midday**: Admin approves pending expenses
    3. **Evening**: Manager checks daily profit on dashboard

    ### Month-End
    1. **Generate P&L Statement** for the month
    2. **Review expense categories** - identify cost savings
    3. **Track revenue trends** - plan for next month
    4. **Send report to stakeholders**

    ### Ad-Hoc
    - **Transport Reimbursement**: Staff records transport, admin approves
    - **Emergency Repairs**: Record expense immediately, approve later
    - **Contractor Payments**: Track all vendor payments with receipts

    ---

    ## Next Steps

    1. ✅ **Run Migration** - Create database tables
    2. ✅ **Test APIs** - Use Postman to verify endpoints
    3. 🔄 **Build Frontend** - Create Expenses and Financial Dashboard pages
    4. 🔄 **Add Reports Export** - PDF/Excel export functionality
    5. 🔄 **Email Reports** - Automated monthly financial reports

    ---

    **Last Updated:** January 10, 2026  
    **Version:** 1.0  
    **Status:** Ready for Testing
