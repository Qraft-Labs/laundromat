# 🗺️ Lush Laundry ERP - Project Map

    ## 📁 Complete File Structure

    ```
    lush_laundry/
    │
    ├── 📄 README.md                    # Main project overview
    ├── 📄 SETUP_GUIDE.md               # Complete setup instructions
    ├── 📄 IMPLEMENTATION_SUMMARY.md    # What was built & how
    ├── 📄 package.json                 # Frontend dependencies
    │
    ├── 🎨 FRONTEND (React + TypeScript)
    │   ├── src/
    │   │   ├── App.tsx                 # Main app component
    │   │   ├── main.tsx                # Entry point
    │   │   ├── pages/                  # Page components
    │   │   │   ├── Dashboard.tsx       # 📊 Dashboard with stats
    │   │   │   ├── Orders.tsx          # 📋 Order list & filtering
    │   │   │   ├── NewOrder.tsx        # ➕ Create new order
    │   │   │   ├── Customers.tsx       # 👥 Customer management
    │   │   │   ├── PriceList.tsx       # 💰 Service pricing
    │   │   │   ├── Inventory.tsx       # 📦 Inventory (placeholder)
    │   │   │   ├── Deliveries.tsx      # 🚚 Deliveries (placeholder)
    │   │   │   ├── Reports.tsx         # 📈 Analytics & charts
    │   │   │   ├── Settings.tsx        # ⚙️ Settings (placeholder)
    │   │   │   └── Help.tsx            # ❓ Help (placeholder)
    │   │   ├── components/
    │   │   │   ├── layout/             # Layout components
    │   │   │   ├── dashboard/          # Dashboard widgets
    │   │   │   ├── orders/             # Order components
    │   │   │   └── ui/                 # shadcn/ui components (40+)
    │   │   ├── data/
    │   │   │   └── priceData.ts        # 🔄 TO REPLACE: Mock data
    │   │   └── hooks/                  # Custom React hooks
    │   └── public/                     # Static assets
    │
    └── 🔧 BACKEND (Node.js + Express + PostgreSQL)
        ├── 📄 README.md                # Backend documentation
        ├── 📄 QUICKSTART.md            # Quick setup guide
        ├── 📄 API_EXAMPLES.md          # API testing examples
        ├── 📄 package.json             # Backend dependencies
        ├── 📄 tsconfig.json            # TypeScript config
        ├── 📄 .env.example             # Environment template
        ├── 📄 setup.ps1                # Windows setup script
        ├── 📄 setup.sh                 # Mac/Linux setup script
        │
        └── src/
            ├── 📄 index.ts             # ⚡ Server entry point
            │
            ├── config/                 # 🔧 Configuration
            │   ├── index.ts            # Environment variables
            │   └── database.ts         # PostgreSQL connection pool
            │
            ├── models/                 # 📋 TypeScript Types
            │   ├── User.ts             # User types (ADMIN/USER)
            │   ├── Customer.ts         # Customer data types
            │   ├── PriceItem.ts        # Service pricing types
            │   └── Order.ts            # Order & items types
            │
            ├── controllers/            # 🎮 Business Logic
            │   ├── auth.controller.ts       # 🔐 Login, register
            │   ├── user.controller.ts       # 👤 User management
            │   ├── customer.controller.ts   # 👥 Customer CRUD
            │   ├── price.controller.ts      # 💰 Price management
            │   ├── order.controller.ts      # 📦 Order processing
            │   └── report.controller.ts     # 📊 Analytics
            │
            ├── routes/                 # 🛣️ API Routes
            │   ├── index.ts            # Route aggregator
            │   ├── auth.routes.ts      # /api/auth/*
            │   ├── user.routes.ts      # /api/users/*
            │   ├── customer.routes.ts  # /api/customers/*
            │   ├── price.routes.ts     # /api/prices/*
            │   ├── order.routes.ts     # /api/orders/*
            │   └── report.routes.ts    # /api/reports/*
            │
            ├── middleware/             # 🛡️ Middleware
            │   ├── auth.ts             # JWT & role-based auth
            │   ├── error.ts            # Error handling
            │   └── validation.ts       # Input validation
            │
            └── database/               # 🗄️ Database Operations
                ├── migrate.ts          # Create all tables
                └── seed.ts             # Seed sample data
    ```

    ---

    ## 🔄 Data Flow

    ### Authentication Flow
    ```
    User Login (Frontend)
        ↓
    POST /api/auth/login (Backend)
        ↓
    Validate credentials (bcrypt)
        ↓
    Generate JWT token
        ↓
    Return token + user info
        ↓
    Store in localStorage (Frontend)
        ↓
    Include in Authorization header for all requests
    ```

    ### Order Creation Flow
    ```
    New Order Page (Frontend)
        ↓
    Select Customer
        ↓
    Add Items (from price list)
        ↓
    POST /api/orders with items[] (Backend)
        ↓
    Begin Database Transaction
        ↓
    Generate Order Number (ORD-2024-XXX)
        ↓
    Fetch Current Prices
        ↓
    Calculate Totals
        ↓
    Create Order Record
        ↓
    Create Order Items
        ↓
    Commit Transaction
        ↓
    Return Complete Order
        ↓
    Show Success Message (Frontend)
    ```

    ### Price Management Flow (Admin)
    ```
    Price List Page (Frontend - Admin view)
        ↓
    PUT /api/prices/:id (Backend)
        ↓
    Verify User Role = ADMIN
        ↓
    Update Price in Database
        ↓
    Return Updated Price
        ↓
    Update UI (Frontend)
    ```

    ---

    ## 🗄️ Database Schema

    ```
    ┌─────────────┐
    │   users     │
    │─────────────│
    │ id (PK)     │◄───┐
    │ email       │    │
    │ password    │    │ created_by
    │ full_name   │    │
    │ role        │    │
    │ status      │    │
    │ created_at  │    │
    └─────────────┘    │
                    │
        │              │
        │ user_id      │
        │              │
        ↓              │
    ┌─────────────┐   │
    │   orders    │   │
    │─────────────│   │
    │ id (PK)     │   │
    │ order_number│   │
    │ customer_id │───┼─────┐
    │ user_id     │───┘     │
    │ status      │         │
    │ total       │         │
    └─────────────┘         │
        │                   │
        │ order_id          │
        │                   │
        ↓                   │
    ┌─────────────┐         │
    │ order_items │         │
    │─────────────│         │
    │ id (PK)     │         │
    │ order_id    │───┐     │
    │ price_item  │   │     │
    │ quantity    │   │     │
    │ unit_price  │   │     │
    └─────────────┘   │     │
                    │     │
        ┌─────────────┘     │
        │                   │
        ↓                   ↓
    ┌─────────────┐    ┌─────────────┐
    │ price_items │    │  customers  │
    │─────────────│    │─────────────│
    │ id (PK)     │    │ id (PK)     │
    │ name        │    │ customer_id │
    │ category    │    │ name        │
    │ price       │    │ phone       │
    │ ironing     │    │ email       │
    │ is_active   │    │ location    │
    └─────────────┘    └─────────────┘
    ```

    ---

    ## 🎯 User Roles & Permissions

    ### 👑 ADMINISTRATOR
    - ✅ User Management
    - Create/approve/delete users
    - Change user roles
    - View all users
    - ✅ Price Management
    - Add/edit/delete service items
    - Adjust prices
    - Activate/deactivate items
    - ✅ Full Order Access
    - View all orders
    - Create/edit/delete orders
    - Access order history
    - ✅ Customer Management
    - Full CRUD operations
    - ✅ Reports & Analytics
    - Dashboard statistics
    - Revenue reports
    - Customer analytics
    - ✅ Financial Access
    - View all financial data
    - Generate reports

    ### 👤 USER (Cashier/Desk Agent)
    - ✅ Order Management
    - Create new orders
    - View orders
    - Update order status
    - ✅ Customer Management
    - View customers
    - Create/edit customers
    - ✅ Price Viewing
    - View price list (read-only)
    - ❌ Cannot
    - Adjust prices
    - Manage users
    - Access reports
    - Delete orders

    ---

    ## 📊 API Endpoints Summary

    | Method | Endpoint | Access | Description |
    |--------|----------|--------|-------------|
    | POST | `/api/auth/register` | Public | Register new user |
    | POST | `/api/auth/login` | Public | Login & get token |
    | GET | `/api/auth/me` | Auth | Get current user |
    | GET | `/api/users` | Admin | List all users |
    | PUT | `/api/users/:id/approve` | Admin | Approve user |
    | GET | `/api/customers` | Auth | List customers |
    | POST | `/api/customers` | Auth | Create customer |
    | GET | `/api/prices` | Auth | View prices |
    | PUT | `/api/prices/:id` | Admin | Update price |
    | GET | `/api/orders` | Auth | List orders |
    | POST | `/api/orders` | Auth | Create order |
    | PUT | `/api/orders/:id/status` | Auth | Update status |
    | GET | `/api/reports/dashboard` | Admin | Dashboard stats |
    | GET | `/api/reports/revenue` | Admin | Revenue report |

    ---

    ## 🚦 Status Legend

    | Status | Meaning |
    |--------|---------|
    | ✅ | Complete & tested |
    | 🔄 | Needs frontend integration |
    | ⚙️ | Placeholder (future work) |
    | 🔐 | Requires authentication |
    | 👑 | Admin only |

    ---

    ## 📝 Current State

    ### ✅ Backend: 100% Complete
    - All API endpoints implemented
    - Database schema finalized
    - Authentication & authorization working
    - Sample data seeded
    - Documentation complete

    ### 🔄 Frontend: 70% Complete
    - UI components: ✅ Done
    - Page layouts: ✅ Done
    - Mock data: 🔄 Needs replacement with API calls
    - Authentication: 🔄 Needs implementation
    - API integration: 🔄 In progress

    ### Next Priority:
    1. Create API service layer
    2. Implement authentication context
    3. Replace mock data with API calls
    4. Add loading & error states
    5. Test complete flow

    ---

    ## 🎓 Learning Resources

    - **Backend**: `backend/README.md` + `backend/API_EXAMPLES.md`
    - **Setup**: `SETUP_GUIDE.md`
    - **Summary**: `IMPLEMENTATION_SUMMARY.md`
    - **Quick Start**: `backend/QUICKSTART.md`

    ---

    **This map provides a complete overview of the entire project structure!**
