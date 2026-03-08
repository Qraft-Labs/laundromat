# Testing Guide: Localhost → Production

    This guide shows you how to test features on localhost, then deploy to production with confidence.

    ---

    ## 🏠 PART 1: LOCALHOST TESTING

    ### Step 1: Start Development Servers

    ```powershell
    # Terminal 1 - Start Backend (Port 5000)
    cd d:\work_2026\lush_laundry\backend
    npm run dev

    # Expected output:
    # 🚀 Server running on port 5000
    # 🔗 http://localhost:5000
    # ✅ Connected to database
    ```

    ```powershell
    # Terminal 2 - Start Frontend (Port 5173)
    cd d:\work_2026\lush_laundry\frontend
    npm run dev

    # Expected output:
    # ➜  Local:   http://localhost:5173/
    # ➜  Network: http://192.168.1.x:5173/
    ```

    **✅ Result:** 
    - Frontend: http://localhost:5173
    - Backend API: http://localhost:5000/api
    - Database: Supabase (production database)

    ---

    ### Step 2: Test Login on Localhost

    **Access:** http://localhost:5173/login

    **Admin Credentials:**
    ```
    Email: husseinibram555@gmail.com
    Password: Your_Admin_Password
    ```

    **What to verify:**
    - ✅ Login page loads without errors
    - ✅ Email field accepts input
    - ✅ Password field shows/hides password
    - ✅ Click "Sign In" button
    - ✅ Dashboard loads after successful login
    - ✅ Browser console shows: "🌐 API Base URL: http://localhost:5000/api"

    **If login fails:**
    - Check backend terminal for errors
    - Check browser console (F12) for API errors
    - Verify backend is running on port 5000
    - Check frontend .env: `VITE_API_URL=http://localhost:5000`

    ---

    ### Step 3: Test User Registration on Localhost

    **Access:** http://localhost:5173/create-account

    **Register Test User:**
    ```
    Full Name: Test Manager
    Email: testmanager@gmail.com (or your test Gmail)
    Password: TestPass123!
    Confirm Password: TestPass123!
    ```

    **What to verify:**
    - ✅ Form validates email (shows error for disposable emails)
    - ✅ Password strength indicator shows "Strong"
    - ✅ Click "Create Account" button
    - ✅ Success message: "Account Request Submitted!"
    - ✅ Message explains admin will assign role
    - ✅ Redirects to login page after 3 seconds

    **Backend checks:**
    - ✅ User created with status = PENDING
    - ✅ Email sent to admin (husseinibram555@gmail.com)
    - ✅ Check your Gmail inbox for "🔔 New User Registration Pending Approval"

    ---

    ### Step 4: Test Admin Approval on Localhost

    **Login as Admin:** http://localhost:5173/login
    ```
    Email: husseinibram555@gmail.com
    Password: Your_Admin_Password
    ```

    **Navigate to User Management:**
    1. Click "User Management" in sidebar
    2. Click "Pending Approval" tab
    3. Find "Test Manager" in the list

    **Approve with Role:**
    1. Click "Approve" button
    2. Dialog opens: "Approve User"
    3. **Select Role from Dropdown:**
    - Choose "Manager" (or any role you want to test)
    4. Click "Approve with Selected Role"
    5. Success message: "User approved successfully with MANAGER role"

    **Verify Email Sent:**
    - Check test user's Gmail inbox (testmanager@gmail.com)
    - Email subject: "✅ Your Lush Laundry Account Has Been Approved!"
    - Email shows: "Your Role: MANAGER"
    - Email has button: "Login to Lush Laundry"
    - Button links to: http://localhost:5173/login (in localhost)

    **Test User Login:**
    1. Click "Login to Lush Laundry" button in email
    2. Or manually go to: http://localhost:5173/login
    3. Login with test user credentials:
    ```
    Email: testmanager@gmail.com
    Password: TestPass123!
    ```
    4. ✅ Dashboard loads with MANAGER role permissions

    ---

    ### Step 5: Test Role Permissions on Localhost

    **As MANAGER (Test Manager account):**
    - ✅ Can access: Dashboard, Orders, Customers, Inventory
    - ✅ Can approve: Desktop Agents
    - ❌ Cannot: Create other admins, access all settings

    **As ADMIN (Your account):**
    - ✅ Full access to all features
    - ✅ Can assign any role (ADMIN, MANAGER, DESKTOP_AGENT)
    - ✅ Can manage all users

    ---

    ## 🚀 PART 2: DEPLOY TO PRODUCTION

    ### Step 1: Prepare for Deployment

    **Check everything works on localhost first:**
    - [x] Login works
    - [x] Registration works
    - [x] Admin approval with role selection works
    - [x] Emails sent (admin notification + user approval)
    - [x] Role permissions enforced correctly

    **No errors in:**
    - Backend terminal (no red error messages)
    - Frontend browser console (F12 → Console tab)
    - No TypeScript errors in VSCode

    ---

    ### Step 2: Commit Changes to Git

    ```powershell
    # Navigate to project root
    cd d:\work_2026\lush_laundry

    # Check what files changed
    git status

    # Add all changes
    git add .

    # Commit with descriptive message
    git commit -m "Feature: Role assignment during user approval with email notifications"

    # Push to GitHub
    git push origin main
    ```

    **Expected output:**
    ```
    Enumerating objects: 15, done.
    Counting objects: 100% (15/15), done.
    Compressing objects: 100% (8/8), done.
    Writing objects: 100% (8/8), 2.34 KiB | 1.17 MiB/s, done.
    Total 8 (delta 7), reused 0 (delta 0)
    To https://github.com/Qraft-Labs/laundromat.git
    abc1234..def5678  main -> main
    ```

    ---

    ### Step 3: Verify Auto-Deployment

    **Netlify (Frontend):**
    1. Go to: https://app.netlify.com/sites/laundrosys/deploys
    2. Watch build progress (~2 minutes)
    3. Status changes: "Building" → "Published"
    4. Frontend deployed to: https://laundrosys.netlify.app

    **Render (Backend):**
    1. Go to: https://dashboard.render.com
    2. Find "lush-laundry-api" service
    3. Watch build progress (~5 minutes)
    4. Status changes: "Building" → "Live"
    5. Backend deployed to: https://lush-laundry-api.onrender.com

    **Check Logs:**
    - Netlify: https://app.netlify.com/sites/laundrosys/deploys → Click latest deploy → "Deploy log"
    - Render: Dashboard → "lush-laundry-api" → "Logs" tab

    **Look for errors:**
    - ❌ Build failures (dependency issues, TypeScript errors)
    - ❌ Runtime errors (missing env vars, database connection)
    - ✅ Successful deployment messages

    ---

    ### Step 4: Test Login on Production

    **Access:** https://laundrosys.netlify.app/login

    **Admin Credentials (Same as localhost):**
    ```
    Email: husseinibram555@gmail.com
    Password: Your_Admin_Password
    ```

    **What to verify:**
    - ✅ Production site loads (not localhost)
    - ✅ Login form works
    - ✅ Dashboard loads after login
    - ✅ Browser console shows: "🌐 API Base URL: https://lush-laundry-api.onrender.com/api"
    - ✅ No CORS errors in console

    **If login fails:**
    - Check Render backend logs for errors
    - Verify Render env vars set correctly:
    - `FRONTEND_URL=https://laundrosys.netlify.app`
    - `DATABASE_URL` or individual DB_* vars
    - `JWT_SECRET` set
    - Check Netlify env vars:
    - `VITE_API_URL=https://lush-laundry-api.onrender.com`

    ---

    ### Step 5: Test Registration on Production

    **Access:** https://laundrosys.netlify.app/create-account

    **Register Production Test User:**
    ```
    Full Name: Production Test CEO
    Email: ceo@yourcompany.com (real email)
    Password: SecurePass456!
    Confirm Password: SecurePass456!
    ```

    **What to verify:**
    - ✅ Form validates email
    - ✅ Click "Create Account"
    - ✅ Success message appears
    - ✅ **Check your Gmail** (husseinibram555@gmail.com)
    - ✅ Admin notification email received from production

    **Email should show:**
    - Subject: "🔔 New User Registration Pending Approval - Production Test CEO"
    - Body shows user details
    - Link goes to: https://laundrosys.netlify.app/user-management

    ---

    ### Step 6: Test Approval on Production

    **Login as Admin:** https://laundrosys.netlify.app/login

    **Navigate to User Management → Pending Approval:**
    1. Find "Production Test CEO"
    2. Click "Approve"
    3. Select role: "Administrator"
    4. Click "Approve with Selected Role"

    **Verify Production Email Sent:**
    - Check CEO's email inbox (ceo@yourcompany.com)
    - Email subject: "✅ Your Lush Laundry Account Has Been Approved!"
    - Email shows: "Your Role: ADMIN"
    - **Button links to:** https://laundrosys.netlify.app/login (Production URL!)

    **Test CEO Login on Production:**
    1. Click "Login to Lush Laundry" in email
    2. Login with CEO credentials
    3. ✅ Dashboard loads as ADMIN
    4. ✅ Full access to all features

    ---

    ## 🔍 TROUBLESHOOTING COMMON ISSUES

    ### Issue: "Network Error" on Login (Production)

    **Cause:** Backend not responding or CORS issue

    **Fix:**
    1. Check Render service status: https://dashboard.render.com
    2. Check Render logs for errors
    3. Verify Render env var: `FRONTEND_URL=https://laundrosys.netlify.app`
    4. Restart Render service if needed

    ---

    ### Issue: "Email not sent" (Localhost or Production)

    **Cause:** Gmail app password not configured or incorrect

    **Fix:**
    1. Get Gmail app password: https://myaccount.google.com/apppasswords
    2. Enable 2-Step Verification first
    3. Generate new app password for "Mail"
    4. Update `.env` (localhost) or Render env vars (production):
    ```
    EMAIL_USER=husseinibram555@gmail.com
    EMAIL_PASSWORD=your_16_char_app_password
    ```
    5. Restart backend server

    ---

    ### Issue: "Login works on localhost but not production"

    **Cause:** Environment variables mismatch

    **Fix:**
    1. **Netlify Environment Variables:**
    - Go to: https://app.netlify.com/sites/laundrosys/settings/env
    - Add: `VITE_API_URL` = `https://lush-laundry-api.onrender.com`
    - Redeploy site
    
    2. **Render Environment Variables:**
    - Go to: Render dashboard → lush-laundry-api → Environment
    - Verify all variables set (DB_*, JWT_SECRET, FRONTEND_URL, etc.)
    - Restart service

    ---

    ### Issue: "CORS Error" in Browser Console

    **Cause:** Backend not allowing frontend domain

    **Fix:**
    1. Check Render env var: `FRONTEND_URL=https://laundrosys.netlify.app`
    2. Check backend logs for CORS rejection message
    3. Ensure backend `NODE_ENV=production` (not development)
    4. Restart Render service

    ---

    ## 📋 DEPLOYMENT CHECKLIST

    ### Before Every Deployment:
    - [ ] Test all features on localhost
    - [ ] No errors in backend terminal
    - [ ] No errors in browser console
    - [ ] Git commit with clear message
    - [ ] Push to GitHub

    ### After Deployment:
    - [ ] Wait for Netlify build (~2 min)
    - [ ] Wait for Render build (~5 min)
    - [ ] Check deployment logs (Netlify + Render)
    - [ ] Test login on production
    - [ ] Test critical features (registration, approval)
    - [ ] Verify emails sent from production

    ### Emergency Rollback:
    If production breaks after deployment:
    1. Go to Netlify: https://app.netlify.com/sites/laundrosys/deploys
    2. Click previous working deploy
    3. Click "Publish deploy" button
    4. Frontend rolls back immediately

    For backend:
    1. Git revert last commit
    2. Push to GitHub
    3. Render auto-deploys reverted version

    ---

    ## 🎯 SUMMARY

    **Workflow:**
    1. ✅ Develop on localhost
    2. ✅ Test thoroughly locally
    3. ✅ Git commit + push
    4. ✅ Auto-deploy to production
    5. ✅ Test on production
    6. ✅ Monitor for issues

    **Both environments work identically!**
    - Same database (Supabase)
    - Same authentication system
    - Same email notifications
    - Same features

    **You can confidently:**
    - Test new features on localhost
    - Push changes knowing they'll work in production
    - Login works on both localhost and production URLs

    🎉 **Your system is production-ready!**
