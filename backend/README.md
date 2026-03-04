# Lush Laundry Backend API

    Backend API for Lush Laundry ERP System built with Node.js, Express, TypeScript, and PostgreSQL.

    ## Features

    - ✅ JWT-based authentication
    - ✅ Role-based authorization (ADMIN/USER)
    - ✅ RESTful API design
    - ✅ PostgreSQL database
    - ✅ TypeScript for type safety
    - ✅ Input validation
    - ✅ Security best practices

    ## Setup

    ### Prerequisites
    - Node.js 18+ and npm
    - PostgreSQL 14+

    ### Installation

    1. Install dependencies:
    ```bash
    npm install
    ```

    2. Set up environment variables:
    ```bash
    cp .env.example .env
    # Edit .env with your database credentials
    ```

    3. Create PostgreSQL database:
    ```sql
    CREATE DATABASE lush_laundry;
    ```

    4. Run migrations and seed data:
    ```bash
    npm run db:reset
    ```

    5. Start development server:
    ```bash
    npm run dev
    ```

    Server will start on http://localhost:5000

    ## API Documentation

    ### Authentication Endpoints

    - `POST /api/auth/register` - Register new user (requires admin approval)
    - `POST /api/auth/login` - Login and get JWT token
    - `GET /api/auth/me` - Get current user profile

    ### User Management (Admin only)

    - `GET /api/users` - Get all users
    - `GET /api/users/:id` - Get user by ID
    - `PUT /api/users/:id` - Update user
    - `PUT /api/users/:id/approve` - Approve pending user
    - `PUT /api/users/:id/role` - Change user role
    - `DELETE /api/users/:id` - Delete user

    ### Customer Endpoints

    - `GET /api/customers` - Get all customers
    - `GET /api/customers/:id` - Get customer by ID
    - `POST /api/customers` - Create customer
    - `PUT /api/customers/:id` - Update customer
    - `DELETE /api/customers/:id` - Delete customer

    ### Price Items (Admin for write)

    - `GET /api/prices` - Get all price items
    - `GET /api/prices/:id` - Get price item by ID
    - `POST /api/prices` - Create price item (Admin)
    - `PUT /api/prices/:id` - Update price item (Admin)
    - `DELETE /api/prices/:id` - Delete price item (Admin)

    ### Orders

    - `GET /api/orders` - Get all orders
    - `GET /api/orders/:id` - Get order by ID
    - `POST /api/orders` - Create order
    - `PUT /api/orders/:id` - Update order
    - `PUT /api/orders/:id/status` - Update order status
    - `DELETE /api/orders/:id` - Delete order

    ### Inventory (Admin for write)

    - `GET /api/inventory` - Get all inventory items
    - `POST /api/inventory` - Add inventory item (Admin)
    - `PUT /api/inventory/:id` - Update inventory (Admin)
    - `POST /api/inventory/:id/transaction` - Record transaction

    ### Reports (Admin only)

    - `GET /api/reports/dashboard` - Dashboard statistics
    - `GET /api/reports/revenue` - Revenue reports
    - `GET /api/reports/customers` - Customer analytics

    ## Default Admin Account

    After seeding, you can login with:
    - Email: admin@lushlaundry.com
    - Password: Admin123!

    **IMPORTANT:** Change this password immediately in production!

    ## Project Structure

    ```
    backend/
    ├── src/
    │   ├── config/         # Configuration files
    │   ├── models/         # Database models
    │   ├── controllers/    # Route controllers
    │   ├── services/       # Business logic
    │   ├── routes/         # API routes
    │   ├── middleware/     # Express middleware
    │   ├── utils/          # Helper functions
    │   ├── database/       # DB migrations & seeds
    │   └── index.ts        # Entry point
    ├── dist/               # Compiled JavaScript
    └── package.json
    ```

    ## Security Notes

    - All passwords are hashed with bcrypt
    - JWT tokens for authentication
    - CORS configured for frontend
    - Helmet.js for security headers
    - Input validation on all endpoints
    - SQL injection prevention with parameterized queries
