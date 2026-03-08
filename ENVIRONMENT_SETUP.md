# Environment Configuration Guide

    This document explains how to configure environments for **localhost development** and **production deployment**.

    ---

    ## 🏠 LOCALHOST DEVELOPMENT (Testing on Your Computer)

    ### Frontend (React + Vite)
    **File:** `frontend/.env`
    ```env
    # Local development - Backend running on localhost:5000
    VITE_API_URL=http://localhost:5000
    VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
    ```

    **How to test:**
    ```powershell
    # Terminal 1 - Start Backend
    cd backend
    npm run dev
    # ✅ Backend running on http://localhost:5000

    # Terminal 2 - Start Frontend
    cd frontend
    npm run dev
    # ✅ Frontend running on http://localhost:5173
    ```

    **Access:**
    - Frontend: http://localhost:5173
    - Backend API: http://localhost:5000/api
    - Login works with localhost URLs

    ---

    ### Backend (Node.js + Express)
    **File:** `backend/.env`
    ```env
    # Development environment
    NODE_ENV=development
    PORT=5000

    # Supabase Database Connection
    DB_HOST=aws-1-ap-south-1.pooler.supabase.com
    DB_PORT=5432
    DB_NAME=postgres
    DB_USER=postgres.xrkptygpwjdizvhkgvpo
    DB_PASSWORD=your_supabase_password

    # JWT & Session Secrets
    JWT_SECRET=your_jwt_secret_here
    SESSION_SECRET=your_session_secret_here

    # CORS - Allow localhost frontend
    FRONTEND_URL=http://localhost:5173

    # Email Configuration (Gmail)
    EMAIL_USER=husseinibram555@gmail.com
    EMAIL_PASSWORD=your_gmail_app_password

    # Google OAuth (Development)
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
    ```

    **Database:** Already using Supabase (production database) even in development
    - This means your localhost backend connects to Supabase
    - No need for local PostgreSQL installation
    - All data synced with production database

    ---

    ## 🚀 PRODUCTION DEPLOYMENT

    ### Frontend (Netlify)
    **File:** `frontend/.env.production`
    ```env
    # Production Backend URL (Render.com)
    VITE_API_URL=https://lush-laundry-api.onrender.com

    # Google OAuth Client ID (Production)
    VITE_GOOGLE_CLIENT_ID=your_production_google_client_id
    ```

    **Deployment:**
    ```powershell
    # Build for production
    cd frontend
    npm run build

    # Deploy to Netlify (automatic via Git push)
    git add .
    git commit -m "Update frontend"
    git push origin main
    # ✅ Netlify auto-deploys: https://laundrosys.netlify.app
    ```

    **Netlify Environment Variables:**
    Go to: https://app.netlify.com/sites/laundrosys/settings/env
    Add:
    - `VITE_API_URL` = `https://lush-laundry-api.onrender.com`
    - `VITE_GOOGLE_CLIENT_ID` = Your production Google Client ID

    ---

    ### Backend (Render.com)
    **Environment Variables in Render Dashboard:**

    Go to: https://dashboard.render.com/web/srv-YOUR_SERVICE_ID/env

    **Required Variables:**
    ```env
    NODE_ENV=production
    PORT=5000

    # Supabase Database (Same as localhost)
    DB_HOST=aws-1-ap-south-1.pooler.supabase.com
    DB_PORT=5432
    DB_NAME=postgres
    DB_USER=postgres.xrkptygpwjdizvhkgvpo
    DB_PASSWORD=your_supabase_password

    # JWT & Session Secrets (Generate new for production)
    JWT_SECRET=production_jwt_secret_32_chars_min
    SESSION_SECRET=production_session_secret_32_chars_min

    # CORS - Allow Netlify frontend
    FRONTEND_URL=https://laundrosys.netlify.app

    # Email Configuration (Gmail - Same as localhost)
    EMAIL_USER=husseinibram555@gmail.com
    EMAIL_PASSWORD=your_gmail_app_password

    # Google OAuth (Production)
    GOOGLE_CLIENT_ID=your_production_google_client_id
    GOOGLE_CLIENT_SECRET=your_production_google_client_secret
    GOOGLE_CALLBACK_URL=https://lush-laundry-api.onrender.com/api/auth/google/callback

    # Authorized Admin Emails
    AUTHORIZED_ADMIN_EMAILS=husseinibram555@gmail.com
    ```

    **Deployment:**
    ```powershell
    # Commit backend changes
    cd backend
    git add .
    git commit -m "Update backend"
    git push origin main
    # ✅ Render auto-deploys: https://lush-laundry-api.onrender.com
    ```

    ---

    ## 🔄 CORS CONFIGURATION (Already Configured)

    Your backend automatically handles CORS for both environments:

    ### Development Mode:
    ```typescript
    // backend/src/index.ts
    if (config.nodeEnv === 'development') {
    return callback(null, true); // ✅ Allows ALL origins (localhost, 192.168.x.x, etc.)
    }
    ```
    - ✅ Localhost frontend (http://localhost:5173) ✓
    - ✅ Network IPs (http://192.168.1.x:5173) ✓
    - ✅ Mobile hotspot (http://192.168.137.x:5173) ✓

    ### Production Mode:
    ```typescript
    // backend/src/index.ts
    const allowedOrigins = [config.cors.origin]; // From FRONTEND_URL env var
    if (allowedOrigins.includes(origin)) {
    callback(null, true); // ✅ Only allows Netlify domain
    }
    ```
    - ✅ Netlify frontend (https://laundrosys.netlify.app) ✓
    - ❌ Other domains blocked ✗

    ---

    ## 🗄️ DATABASE CONFIGURATION

    **Single Database for All Environments:**
    - **Provider:** Supabase PostgreSQL
    - **Host:** aws-1-ap-south-1.pooler.supabase.com
    - **Port:** 5432
    - **Database:** postgres
    - **User:** postgres.xrkptygpwjdizvhkgvpo

    **Same database used by:**
    - ✅ Localhost backend (development testing)
    - ✅ Render.com backend (production)

    **Advantages:**
    - No data sync needed between environments
    - Test with real production data
    - Database changes immediately available everywhere

    **Safety:**
    - Use transaction rollbacks when testing destructive operations locally
    - Always backup before major schema changes
    - Test queries in Supabase SQL Editor first

    ---

    ## 📧 EMAIL CONFIGURATION

    **Gmail SMTP (Same for localhost & production):**

    1. **Enable 2-Step Verification:**
    - Go to: https://myaccount.google.com/security
    - Turn on 2-Step Verification

    2. **Create App Password:**
    - Go to: https://myaccount.google.com/apppasswords
    - Select "Mail" app
    - Generate password (16 characters)
    - Copy this password

    3. **Update .env files:**
    ```env
    EMAIL_USER=husseinibram555@gmail.com
    EMAIL_PASSWORD=your_16_char_app_password
    ```

    4. **Update Render environment variables:**
    - Add `EMAIL_USER` and `EMAIL_PASSWORD`
    - Restart service

    **Emails Sent:**
    - ✅ Admin notification (new user registration)
    - ✅ User approval notification (with login link)
    - ✅ Password reset emails
    - ✅ Daily backup reports (optional)

    ---

    ## 🧪 TESTING WORKFLOW

    ### 1. Test Locally First:
    ```powershell
    # Start both servers
    cd backend && npm run dev    # Terminal 1
    cd frontend && npm run dev   # Terminal 2

    # Open browser: http://localhost:5173
    # Test login, registration, approval flow
    ```

    ### 2. Verify Features:
    - ✅ Login with existing account
    - ✅ Register new account (PENDING status)
    - ✅ Admin receives email notification
    - ✅ Admin approves with role selection
    - ✅ User receives approval email with login link
    - ✅ User logs in with assigned role

    ### 3. Push to Production:
    ```powershell
    # Commit all changes
    git add .
    git commit -m "Feature: Role assignment during approval"
    git push origin main

    # Wait for auto-deployment:
    # - Netlify rebuilds frontend (~2 minutes)
    # - Render rebuilds backend (~5 minutes)
    ```

    ### 4. Test Production:
    - Open: https://laundrosys.netlify.app
    - Test same workflow as localhost
    - Verify emails are sent
    - Check Render logs for any errors

    ---

    ## 🔍 TROUBLESHOOTING

    ### Issue: Frontend can't connect to backend (localhost)
    **Check:**
    1. Backend running? Check Terminal 1 for "🚀 Server running on port 5000"
    2. Frontend .env: `VITE_API_URL=http://localhost:5000`
    3. CORS error in browser console? Backend should allow localhost in dev mode

    **Fix:**
    ```powershell
    # Restart both servers
    cd backend && npm run dev
    cd frontend && npm run dev
    ```

    ---

    ### Issue: Frontend can't connect to backend (production)
    **Check:**
    1. Render service running? Check: https://dashboard.render.com
    2. Netlify env vars set? Check: https://app.netlify.com/sites/laundrosys/settings/env
    3. CORS error? Verify Render env: `FRONTEND_URL=https://laundrosys.netlify.app`

    **Fix:**
    ```bash
    # Update Render environment variable
    FRONTEND_URL=https://laundrosys.netlify.app
    # Restart Render service
    ```

    ---

    ### Issue: Emails not sending
    **Check:**
    1. Gmail App Password created? (Not regular password)
    2. Environment variables set correctly?
    - Localhost: `backend/.env`
    - Production: Render dashboard env vars
    3. Check backend logs for email errors

    **Fix:**
    ```bash
    # Generate new app password
    # Update EMAIL_PASSWORD in .env and Render
    # Restart backend server
    ```

    ---

    ## 📋 CHECKLIST BEFORE DEPLOYMENT

    ### Frontend:
    - [ ] `.env` configured for localhost (http://localhost:5000)
    - [ ] `.env.production` created (https://lush-laundry-api.onrender.com)
    - [ ] Netlify env vars match production needs
    - [ ] Test build locally: `npm run build`

    ### Backend:
    - [ ] `.env` configured for localhost
    - [ ] Render env vars configured (all 15+ variables)
    - [ ] FRONTEND_URL points to Netlify: https://laundrosys.netlify.app
    - [ ] EMAIL_USER and EMAIL_PASSWORD set
    - [ ] Database connection tested

    ### Testing:
    - [ ] Localhost login works
    - [ ] Localhost registration works
    - [ ] Admin approval with role selection works
    - [ ] Emails received (admin notification + user approval)
    - [ ] Production login works (after deployment)
    - [ ] Production registration works
    - [ ] Production emails sent

    ---

    ## 🎯 SUMMARY

    **Localhost (Development):**
    - Frontend: http://localhost:5173 → Backend: http://localhost:5000
    - Database: Supabase (production database)
    - CORS: Open (allows all origins)
    - Emails: Gmail SMTP

    **Production (Deployed):**
    - Frontend: https://laundrosys.netlify.app → Backend: https://lush-laundry-api.onrender.com
    - Database: Supabase (same database)
    - CORS: Restricted (only Netlify domain)
    - Emails: Gmail SMTP (same)

    **Both environments work seamlessly!** ✅
