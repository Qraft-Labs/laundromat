# Lush Laundry ERP System

    A comprehensive ERP system for dry cleaning and laundry businesses, built with modern web technologies.

    ## 🏗️ Project Structure

    ```
    lush_laundry/
    ├── backend/          # Node.js + Express + PostgreSQL API
└── frontend/         # React + TypeScript frontend
    - React 18 with TypeScript
    - Vite for build tooling
    - shadcn/ui + Tailwind CSS
    - TanStack Query for data fetching
    - React Router for navigation

    ### Backend
    - Node.js + Express + TypeScript
    - PostgreSQL database
    - JWT authentication
    - Role-based access control (RBAC)

    ## 👥 User Roles

    ### ADMINISTRATOR (Shareholders)
    - ✅ Create and manage other administrators
    - ✅ Approve new users
    - ✅ Adjust item prices
    - ✅ Add/edit/delete service items
    - ✅ Access financial reports
    - ✅ Full system access

    ### USER (Cashier/Desk Agents)
    - ✅ Create and process orders
    - ✅ Manage customer information
    - ✅ Handle transactions
    - ✅ Update order status
    - ❌ Cannot modify prices
    - ❌ Limited financial access

    ## 🏁 Quick Start

    ### Prerequisites
    - Node.js 18+ and npm
    - PostgreSQL 14+

    ### 1. Set Up Backend

    ```bash
    cd backend

    # Install dependencies
    npm install

    # Set up environment variables
    cp .env.example .env
    # Edit .env with your database credentials

    # Create PostgreSQL database
    createdb lush_laundry

    # Run migrations and seed data
    npm run db:reset

    # Start development server
    npm run dev
    ```

    Backend runs on http://localhost:5000

    ### 2. Set Up Frontend

    ```bash
cd frontend
Install dependencies

    npm run dev
    ```

    Frontend runs on http://localhost:5173

    ### 3. Default Login Credentials

    **Administrator:**
    - Email: admin@lushlaundry.com
    - Password: Admin123!

    **User:**
    - Email: user@lushlaundry.com
    - Password: User123!

    **⚠️ IMPORTANT:** Change these passwords in production!

    ## 📚 API Documentation

    See [backend/README.md](backend/README.md) for complete API documentation.

    ### Base URL
    ```
    http://localhost:5000/api
    ```

    ### Main Endpoints
    - `/api/auth/*` - Authentication
    - `/api/users/*` - User management (Admin)
    - `/api/customers/*` - Customer management
    - `/api/prices/*` - Price list management
    - `/api/orders/*` - Order management
    - `/api/reports/*` - Analytics & reports (Admin)

    ## 📦 Features

    - 📊 Dashboard with real-time statistics
    - 🛒 Complete order management
    - 👥 Customer database with history
    - 💰 Dynamic price management
    - 📦 Inventory tracking
    - 📈 Revenue reports & analytics
    - 🔐 Secure authentication & authorization
    - 🚚 Delivery management

    ## 🗄️ Database Schema

    Main tables: users, customers, price_items, orders, order_items, inventory_items

    See migration file for complete schema.

    ## 🛠️ Development

    ### Backend Commands
    ```bash
    npm run dev      # Development server
    npm run build    # Build for production
    npm run migrate  # Run database migrations
    npm run seed     # Seed sample data
    ```

    ### Frontend Commands
    ```bash
    npm run dev      # Development server
    npm run build    # Build for production
    npm run lint     # Lint code
    ```

    ## 🔒 Security Features

    - Password hashing with bcrypt
    - JWT-based authentication
    - Role-based authorization
    - CORS protection
    - Input validation
    - SQL injection prevention

    ## 📄 License

    Private - All Rights Reserved

    ---

    Built with ❤️ for Lush Laundry
