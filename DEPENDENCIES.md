# 📦 Lush Laundry - Complete Dependencies Checklist

    This document lists ALL dependencies needed to run this project.

    ---

    ## ✅ ALREADY INSTALLED

    ### 1. Backend Node Packages
    **Location**: `backend/node_modules/`  
    **Status**: ✅ Installed (174 packages)  
    **Command**: `cd backend && npm install`

    **Key packages include**:
    - express (web server)
    - typescript + @types/node
    - pg (PostgreSQL client)
    - bcryptjs (password hashing)
    - jsonwebtoken (JWT authentication)
    - express-validator
    - cors, helmet, morgan
    - dotenv

    ### 2. Frontend Node Packages
    **Location**: `frontend/node_modules/`  
    **Status**: ✅ Installed (356 packages)  
    **Command**: `cd frontend && npm install`

    **Key packages include**:
    - react + react-dom
    - vite (build tool)
    - typescript
    - @tanstack/react-query (API data fetching)
    - react-router-dom (routing)
    - tailwindcss
    - shadcn/ui components
    - lucide-react (icons)

    ---

    ## ❌ STILL NEEDED (Must Install Separately)

    ### 3. PostgreSQL Database
    **Status**: ❌ Need to install on your computer  
    **Required Version**: PostgreSQL 14 or higher  
    **Why**: The backend stores all data in PostgreSQL database

    **Installation Options**:

    #### Option A: Official PostgreSQL (Recommended)
    1. Download from: https://www.postgresql.org/download/windows/
    2. Install with default settings
    3. **Remember the password you set for `postgres` user**
    4. Default port: 5432

    #### Option B: Docker (Alternative)
    ```bash
    docker run --name lush-postgres -e POSTGRES_PASSWORD=yourpassword -p 5432:5432 -d postgres:14
    ```

    **After Installation**:
    1. Create database:
    ```bash
    psql -U postgres
    CREATE DATABASE lush_laundry;
    \q
    ```

    2. Update backend `.env` file with your password:
    ```
    DB_PASSWORD=your_postgres_password
    ```

    ---

    ## 🔍 HOW TO CHECK WHAT'S INSTALLED

    ### Check Backend Dependencies:
    ```bash
    cd backend
    npm list --depth=0
    ```

    ### Check Frontend Dependencies:
    ```bash
    cd frontend
    npm list --depth=0
    ```

    ### Check PostgreSQL:
    ```bash
    psql --version
    ```

    ### Check Node.js (should already have):
    ```bash
    node --version   # Need v18 or higher
    npm --version
    ```

    ---

    ## 📋 INSTALLATION CHECKLIST

    - [x] **Node.js** - Already on your computer
    - [x] **Backend packages** - ✅ Done (174 packages)
    - [x] **Frontend packages** - ✅ Done (356 packages)
    - [ ] **PostgreSQL** - ⚠️ Need to install
    - [ ] **Create database** - ⚠️ After PostgreSQL installed
    - [ ] **Run migrations** - ⚠️ After database created
    - [ ] **Seed data** - ⚠️ Optional (sample data)

    ---

    ## 🚀 WHAT TO DO NEXT

    1. **Install PostgreSQL** (if not already installed)
    ```bash
    # Check if installed:
    psql --version
    
    # If not installed, download from postgresql.org
    ```

    2. **Create the database**:
    ```bash
    # Open PostgreSQL command line:
    psql -U postgres
    
    # Create database:
    CREATE DATABASE lush_laundry;
    
    # Exit:
    \q
    ```

    3. **Configure backend** - Create `backend/.env` file:
    ```env
    PORT=5000
    NODE_ENV=development
    
    DB_HOST=localhost
    DB_PORT=5432
    DB_NAME=lush_laundry
    DB_USER=postgres
    DB_PASSWORD=YOUR_POSTGRES_PASSWORD_HERE
    
    JWT_SECRET=your-super-secret-jwt-key-change-this
    JWT_EXPIRES_IN=7d
    
    FRONTEND_URL=http://localhost:5173
    ```

    4. **Run database migrations**:
    ```bash
    cd backend
    npm run migrate
    ```

    5. **Seed sample data** (optional):
    ```bash
    cd backend
    npm run seed
    ```

    6. **Start backend server**:
    ```bash
    cd backend
    npm run dev
    ```

    7. **Start frontend** (in new terminal):
    ```bash
    cd frontend
    npm run dev
    ```

    ---

    ## ❓ WHY Each Project Needs Its Own node_modules?

    **Short Answer**: Isolation and version control

    **Details**:
    - ✅ Project A can use React 18, Project B can use React 17
    - ✅ No conflicts between different project requirements
    - ✅ Easy to deploy (just copy folder with node_modules)
    - ✅ Each project is self-contained
    - ❌ Takes more disk space (trade-off for reliability)

    **Global vs Local**:
    - **Global packages** (`npm install -g`): Command-line tools (like `typescript`, `nodemon`)
    - **Local packages** (`npm install`): Project dependencies (in `node_modules/`)

    ---

    ## 💡 TIPS

    1. **`.gitignore` excludes `node_modules/`** - That's why you need `npm install` after cloning
    2. **`package.json`** lists what's needed - `npm install` reads this file
    3. **`package-lock.json`** locks exact versions - Ensures everyone gets same versions
    4. **Only install once per project** - Unless you add new packages later

    ---

    ## 🆘 TROUBLESHOOTING

    ### "Cannot find module 'express'"
    ```bash
    cd backend
    npm install
    ```

    ### "Cannot find module 'react'"
    ```bash
    cd frontend
    npm install
    ```

    ### "ECONNREFUSED" database error
    - PostgreSQL not running
    - Wrong password in `.env`
    - Database doesn't exist yet

    ### Port already in use (5000 or 5173)
    ```bash
    # Find and kill process using the port (Windows):
    netstat -ano | findstr :5000
    taskkill /PID <process_id> /F
    ```

    ---

    **Summary**: You have all Node packages installed! Just need PostgreSQL database now. 🎉
