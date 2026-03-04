# 🚀 Complete Setup Guide - Lush Laundry ERP

    This guide will walk you through setting up the complete Lush Laundry ERP system from scratch.

    ## 📋 Table of Contents
    1. [Prerequisites](#prerequisites)
    2. [Backend Setup](#backend-setup)
    3. [Frontend Setup](#frontend-setup)
    4. [Testing the System](#testing-the-system)
    5. [Troubleshooting](#troubleshooting)

    ---

    ## 1. Prerequisites

    ### Install Required Software

    #### Node.js & npm
    - **Windows**: Download from [nodejs.org](https://nodejs.org/) (LTS version)
    - **Mac**: `brew install node`
    - **Linux**: `sudo apt install nodejs npm`

    Verify installation:
    ```bash
    node --version  # Should be v18 or higher
    npm --version
    ```

    #### PostgreSQL
    - **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
    - During installation, remember your postgres password
    - Add PostgreSQL bin to PATH
    - **Mac**: `brew install postgresql@14`
    - **Linux**: `sudo apt install postgresql postgresql-contrib`

    Verify installation:
    ```bash
    psql --version  # Should be 14 or higher
    ```

    #### Git (Optional but recommended)
    - **Windows**: Download from [git-scm.com](https://git-scm.com/)
    - **Mac**: `brew install git`
    - **Linux**: `sudo apt install git`

    ---

    ## 2. Backend Setup

    ### Step 1: Navigate to Backend Directory
    ```bash
    cd lush_laundry/backend
    ```

    ### Step 2: Install Dependencies
    ```bash
    npm install
    ```

    This will install all required Node.js packages including Express, PostgreSQL client, JWT, and TypeScript.

    ### Step 3: Configure Environment Variables

    Create `.env` file from template:
    ```bash
    # Windows PowerShell
    Copy-Item .env.example .env

    # Mac/Linux
    cp .env.example .env
    ```

    Edit the `.env` file with your settings:
    ```env
    # Server Configuration
    PORT=5000
    NODE_ENV=development

    # Database Configuration
    DB_HOST=localhost
    DB_PORT=5432
    DB_NAME=lush_laundry
    DB_USER=postgres
    DB_PASSWORD=YOUR_POSTGRES_PASSWORD_HERE

    # JWT Configuration (change this!)
    JWT_SECRET=change_this_to_a_long_random_string_for_security
    JWT_EXPIRES_IN=7d

    # CORS Configuration
    FRONTEND_URL=http://localhost:5173
    ```

    **IMPORTANT**:
    - Replace `YOUR_POSTGRES_PASSWORD_HERE` with your actual PostgreSQL password
    - Change `JWT_SECRET` to a long random string for production

    ### Step 4: Create Database

    #### Option A: Using PowerShell (Windows)
    ```powershell
    $env:PGPASSWORD = "your_postgres_password"
    psql -U postgres -c "CREATE DATABASE lush_laundry;"
    ```

    #### Option B: Using Terminal (Mac/Linux)
    ```bash
    PGPASSWORD=your_postgres_password psql -U postgres -c "CREATE DATABASE lush_laundry;"
    ```

    #### Option C: Using pgAdmin (GUI)
    1. Open pgAdmin
    2. Right-click on "Databases"
    3. Select "Create > Database"
    4. Name it "lush_laundry"
    5. Click "Save"

    ### Step 5: Run Migrations and Seed Data

    This will create all tables and populate them with initial data:

    ```bash
    npm run db:reset
    ```

    You should see:
    - ✅ Database migration completed successfully!
    - ✅ Created admin user
    - ✅ Created sample users
    - ✅ Seeded X price items
    - ✅ Seeded X customers
    - ✅ Database seeding completed successfully!

    ### Step 6: Start Backend Server

    ```bash
    npm run dev
    ```

    You should see:
    ```
    🚀 ========================================
    🚀 Server running on port 5000
    🚀 Environment: development
    🚀 API URL: http://localhost:5000
    🚀 ========================================
    ```

    **Keep this terminal open!**

    ### Step 7: Test Backend

    Open a new terminal and test:

    ```bash
    # Test health endpoint
    curl http://localhost:5000/api/health

    # Or open in browser:
    # http://localhost:5000/api/health
    ```

    You should see:
    ```json
    {
    "status": "OK",
    "timestamp": "2024-01-07T...",
    "uptime": 1.234
    }
    ```

    ---

    ## 3. Frontend Setup

    ### Step 1: Open New Terminal

    Keep the backend running and open a new terminal.

    ### Step 2: Navigate to Project Root
    ```bash
    cd lush_laundry
    ```

    ### Step 3: Install Dependencies
    ```bash
    npm install
    ```

    This will install React, TypeScript, Vite, shadcn/ui, and all frontend packages.

    ### Step 4: Start Frontend Server
    ```bash
    npm run dev
    ```

    You should see:
    ```
    VITE v5.x.x  ready in xxx ms

    ➜  Local:   http://localhost:5173/
    ➜  Network: use --host to expose
    ```

    ### Step 5: Open in Browser

    Navigate to: **http://localhost:5173**

    You should see the Lush Laundry dashboard!

    ---

    ## 4. Testing the System

    ### Test Login

    #### As Administrator:
    1. Go to http://localhost:5173
    2. Click "Login" (or navigate to login page)
    3. Enter:
    - **Email**: admin@lushlaundry.com
    - **Password**: Admin123!
    4. You should be redirected to the dashboard with full access

    #### As User:
    1. Logout from admin account
    2. Login with:
    - **Email**: user@lushlaundry.com
    - **Password**: User123!
    3. You should have limited access (no price editing, no reports)

    ### Test Features

    #### 1. Dashboard
    - View today's statistics
    - See recent orders
    - Check quick actions

    #### 2. Orders
    - Click "Orders" in sidebar
    - View all orders
    - Try filtering by status
    - Click "New Order" button

    #### 3. Create New Order
    - Select or add customer
    - Choose items from different categories
    - Select wash or iron service
    - See automatic price calculation
    - Submit order

    #### 4. Customers
    - View customer list
    - Search for customers
    - Click "Add Customer"
    - Create new customer

    #### 5. Price List
    - View all service prices
    - Filter by category
    - (Admin only) Edit prices
    - (Admin only) Add new items

    #### 6. Reports (Admin Only)
    - View revenue charts
    - See customer analytics
    - Check daily statistics

    ---

    ## 5. Troubleshooting

    ### Backend Issues

    #### Problem: "Cannot connect to database"
    **Solution**:
    1. Check PostgreSQL is running:
    ```bash
    # Windows
    Get-Service postgresql*
    
    # Mac/Linux
    sudo systemctl status postgresql
    ```
    2. Verify database credentials in `.env`
    3. Ensure database `lush_laundry` exists
    4. Test PostgreSQL connection:
    ```bash
    psql -U postgres -h localhost -d lush_laundry
    ```

    #### Problem: "Port 5000 is already in use"
    **Solution**:
    1. Change PORT in `.env` to 5001 or another port
    2. Update FRONTEND_URL in backend `.env`
    3. Update API URL in frontend code

    #### Problem: "JWT_SECRET is not defined"
    **Solution**:
    1. Check `.env` file exists in backend folder
    2. Verify JWT_SECRET is set
    3. Restart backend server

    #### Problem: Migration fails
    **Solution**:
    1. Drop and recreate database:
    ```bash
    psql -U postgres -c "DROP DATABASE lush_laundry;"
    psql -U postgres -c "CREATE DATABASE lush_laundry;"
    ```
    2. Run migrations again:
    ```bash
    npm run db:reset
    ```

    ### Frontend Issues

    #### Problem: "Cannot reach backend API"
    **Solution**:
    1. Verify backend is running on port 5000
    2. Check console for CORS errors
    3. Verify FRONTEND_URL in backend `.env` matches your frontend URL

    #### Problem: "Login fails with 401"
    **Solution**:
    1. Ensure you're using correct credentials
    2. Check user status is ACTIVE in database:
    ```sql
    SELECT email, status FROM users WHERE email = 'admin@lushlaundry.com';
    ```
    3. Try re-seeding database

    #### Problem: "Module not found" errors
    **Solution**:
    ```bash
    # Delete node_modules and reinstall
    rm -rf node_modules
    npm install
    ```

    ### Database Issues

    #### Problem: Can't login to PostgreSQL
    **Solution**:
    1. Reset postgres password:
    ```bash
    # Windows (as admin)
    psql -U postgres
    ALTER USER postgres PASSWORD 'new_password';
    ```
    2. Update `.env` with new password

    #### Problem: Permission denied
    **Solution**:
    ```sql
    -- Grant permissions
    GRANT ALL PRIVILEGES ON DATABASE lush_laundry TO postgres;
    ```

    ---

    ## 🎉 Success Checklist

    - ✅ PostgreSQL installed and running
    - ✅ Node.js 18+ installed
    - ✅ Backend dependencies installed
    - ✅ Database created and migrated
    - ✅ Backend server running on port 5000
    - ✅ Frontend dependencies installed
    - ✅ Frontend running on port 5173
    - ✅ Can login as admin
    - ✅ Can create orders
    - ✅ All pages load correctly

    ---

    ## 📞 Next Steps

    1. **Change Default Passwords**: Update admin and user passwords
    2. **Add Real Customers**: Import or create your actual customers
    3. **Review Price List**: Adjust prices to match your business
    4. **Create Team Accounts**: Add your staff members
    5. **Configure Settings**: Adjust system settings as needed

    ---

    ## 🔒 Security Reminders

    Before deploying to production:
    - ✅ Change default admin password
    - ✅ Generate new JWT_SECRET
    - ✅ Update database passwords
    - ✅ Enable SSL for PostgreSQL
    - ✅ Set NODE_ENV=production
    - ✅ Configure proper CORS settings
    - ✅ Set up database backups

    ---

    ## 📚 Additional Resources

    - [Backend API Documentation](backend/API_EXAMPLES.md)
    - [Backend README](backend/README.md)
    - [PostgreSQL Documentation](https://www.postgresql.org/docs/)
    - [Express.js Documentation](https://expressjs.com/)
    - [React Documentation](https://react.dev/)

    ---

    **Need Help?** Check the troubleshooting section or review the error logs in your terminal.
