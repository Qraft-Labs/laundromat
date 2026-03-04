# ⚡ Quick Start - Lush Laundry Backend

    Get the backend running in 5 minutes!

    ## 🚀 Prerequisites
    - Node.js 18+ installed
    - PostgreSQL installed and running

    ## 📦 Installation

    ### 1. Navigate to Backend
    ```bash
    cd backend
    ```

    ### 2. Install Dependencies
    ```bash
    npm install
    ```

    ### 3. Configure Environment
    ```bash
    # Windows
    Copy-Item .env.example .env

    # Mac/Linux
    cp .env.example .env
    ```

    Edit `.env` and set your PostgreSQL password:
    ```env
    DB_PASSWORD=your_postgres_password_here
    JWT_SECRET=change_this_to_something_random_and_secure
    ```

    ### 4. Create Database
    ```bash
    # Using psql
    psql -U postgres -c "CREATE DATABASE lush_laundry;"

    # Or use pgAdmin GUI to create database named "lush_laundry"
    ```

    ### 5. Setup Database & Seed Data
    ```bash
    npm run db:reset
    ```

    ### 6. Start Server
    ```bash
    npm run dev
    ```

    Server starts on http://localhost:5000 ✓

    ## 🧪 Test It

    Open browser or use curl:
    ```bash
    curl http://localhost:5000/api/health
    ```

    Should return:
    ```json
    {
    "status": "OK",
    "timestamp": "...",
    "uptime": ...
    }
    ```

    ## 🔑 Default Login

    **Admin:**
    ```
    Email: admin@lushlaundry.com
    Password: Admin123!
    ```

    **User:**
    ```
    Email: user@lushlaundry.com
    Password: User123!
    ```

    ## 📖 Next Steps

    1. Test API with [API Examples](API_EXAMPLES.md)
    2. Read [Full Setup Guide](../SETUP_GUIDE.md)
    3. Check [API Documentation](README.md)

    ## ❓ Problems?

    ### Can't connect to database
    - Check PostgreSQL is running
    - Verify password in `.env`
    - Ensure database exists: `psql -U postgres -l`

    ### Port already in use
    - Change PORT in `.env` to 5001

    ### Migration fails
    ```bash
    # Drop and recreate
    psql -U postgres -c "DROP DATABASE lush_laundry;"
    psql -U postgres -c "CREATE DATABASE lush_laundry;"
    npm run db:reset
    ```

    ## 🎯 That's it!

    Your backend is now running and ready for:
    - API testing
    - Frontend integration
    - Production deployment

    ---

    **Full documentation:** [SETUP_GUIDE.md](../SETUP_GUIDE.md)
