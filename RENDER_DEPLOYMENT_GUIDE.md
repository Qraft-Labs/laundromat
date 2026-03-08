# 🚀 Render.com Backend Deployment Guide

    **Service:** Lush Laundry Backend  
    **Date:** March 8, 2026  
    **Deployment Method:** Manual (Direct from PC)

    ---

    ## 📋 Pre-Deployment Checklist

    Before you start, make sure you have:

    - [x] Render.com account created (sign up at https://render.com)
    - [x] Backend folder exists locally: `d:\work_2026\lush_laundry\backend`
    - [x] Git repository initialized in backend
    - [ ] Supabase database password ready
    - [ ] Gmail App Password ready (16 characters, no spaces)
    - [ ] Credit card on file (Render requires it even for free tier)

    ---

    ## 🚢 Deployment Steps

    ### **Step 1: Login to Render.com**

    1. Go to https://dashboard.render.com
    2. Sign in with your account
    3. You should see the Render dashboard

    ---

    ### **Step 2: Create New Web Service**

    1. Click **"New +"** button (top right)
    2. Select **"Web Service"**
    3. You'll see "Connect a repository" page

    ---

    ### **Step 3: Deploy from Local Git (Manual)**

    Since you're deploying directly from your PC (not from GitHub):

    1. On the "Connect a repository" page, scroll down
    2. Look for **"Or, deploy with Git"** section
    3. You'll see options:
    - **Public Git Repository** (use this for now)
    - Or use Render CLI

    **For Public Git Repository:**
    - Enter: `https://github.com/husseinngobi/lush_laundry`
    - Branch: `main`
    - Root Directory: `backend`

    **NOTE:** This will use your personal repository. The code is the same, but you'll need to manually trigger redeployments when you make changes.

    ---

    ### **Step 4: Configure Service**

    Fill in these details:

    **Name:**
    ```
    lush-laundry-backend
    ```

    **Region:**
    ```
    Oregon (US West) or Frankfurt (Europe) - Choose closest to Uganda
    ```

    **Branch:**
    ```
    main
    ```

    **Root Directory:**
    ```
    backend
    ```

    **Runtime:**
    ```
    Node
    ```

    **Build Command:**
    ```
    npm install && npm run build
    ```

    **Start Command:**
    ```
    npm start
    ```

    **Instance Type:**
    ```
    Free (for testing) or Starter ($7/month for production)
    ```

    ---

    ### **Step 5: Add Environment Variables**

    This is **CRITICAL** - the app won't work without these.

    Click **"Advanced"** or scroll down to **"Environment Variables"** section.

    Add each variable one by one:

    #### Database Variables (From Supabase)

    ```
    DATABASE_URL = postgresql://postgres.xrkptygpwjdizvhkgvpo:YOUR_PASSWORD@aws-1-ap-south-1.pooler.supabase.com:5432/postgres

    DB_HOST = aws-1-ap-south-1.pooler.supabase.com

    DB_PORT = 5432

    DB_NAME = postgres

    DB_USER = postgres.xrkptygpwjdizvhkgvpo

    DB_PASSWORD = YOUR_SUPABASE_PASSWORD
    ```

    **Where to find Supabase password:**
    - Go to Supabase dashboard
    - Project Settings > Database
    - Copy the password (or reset it if you forgot)

    #### Application Variables

    ```
    NODE_ENV = production

    PORT = 5000

    JWT_SECRET = generate_a_random_32_character_string_here_use_password_generator
    ```

    **To generate JWT_SECRET:**
    - Use a password generator (like LastPass, 1Password)
    - Make it at least 32 characters
    - Include letters, numbers, special characters
    - Example: `a7f3k9m2p5w8x1c4v6b9n3q7r2t5y8u1`

    #### Email Variables (Gmail)

    ```
    EMAIL_USER = husseinibram555@gmail.com

    EMAIL_PASSWORD = YOUR_16_CHAR_APP_PASSWORD

    BACKUP_EMAIL_USER = husseinibram555@gmail.com

    BACKUP_EMAIL_PASSWORD = YOUR_16_CHAR_APP_PASSWORD
    ```

    **Where to get Gmail App Password:**
    1. Go to https://myaccount.google.com/apppasswords
    2. Sign in to husseinibram555@gmail.com
    3. Click "Generate" (select "Mail" and "Other")
    4. Copy the 16-character password (no spaces)
    5. Paste here

    #### Frontend URL

    ```
    FRONTEND_URL = https://laundrosys.netlify.app
    ```

    **Note:** You can update this later after deploying frontend to Netlify

    #### Optional (SMS/WhatsApp - Can skip for now)

    ```
    SMS_ENABLED = false
    ```

    ---

    ### **Step 6: Create Web Service**

    1. Review all settings
    2. Click **"Create Web Service"** (bottom of page)
    3. Render will start building your app

    ---

    ### **Step 7: Monitor Deployment**

    Watch the build logs in real-time:

    **What to look for:**

    ✅ **Success Indicators:**
    ```
    ==> Installing dependencies...
    npm install
    ==> Building application...
    npm run build
    ✓ TypeScript compiled successfully
    ==> Starting application...
    npm start
    🚀 Server running on port 5000
    ✅ Database connected successfully
    📧 Email service initialized
    ```

    ❌ **Error Indicators:**
    ```
    ERROR: Connection terminated (Database issue)
    ERROR: Invalid credentials (Email issue)
    ERROR: Missing environment variable (Config issue)
    Build failed
    ```

    **Build typically takes:** 5-10 minutes

    ---

    ### **Step 8: Verify Deployment**

    Once build completes, you'll see:

    1. **Status:** "Live" (green dot)
    2. **URL:** `https://lush-laundry-backend.onrender.com` (or similar)

    **Test the deployment:**

    1. Copy your Render URL
    2. Open browser
    3. Visit: `https://YOUR_RENDER_URL.onrender.com/health`
    4. Should see: `{"status":"ok","timestamp":"..."}`

    ✅ If you see this, backend is working!

    ---

    ### **Step 9: Test Database Connection**

    Try logging in:

    1. Open: `https://YOUR_RENDER_URL.onrender.com/api/auth/login`
    2. Use Postman or browser dev tools
    3. Send POST request:
    ```json
    {
    "email": "admin@lushlaundry.com",
    "password": "Admin123!"
    }
    ```
    4. Should receive JWT token

    ✅ If login works, database connection is good!

    ---

    ### **Step 10: Save Your Render URL**

    **Your Render URL:** ___________________________________

    **Save this - you'll need it for:**
    - Frontend environment variable (VITE_API_URL)
    - Netlify configuration
    - Testing API endpoints

    ---

    ## 🔍 Troubleshooting Common Issues

    ### Issue 1: Build Fails - "Cannot find package.json"

    **Cause:** Root directory not set correctly

    **Fix:**
    1. Go to Render dashboard > Your service > Settings
    2. Check "Root Directory" is set to: `backend`
    3. If wrong, update and redeploy

    ---

    ### Issue 2: App Starts Then Crashes - "Connection terminated"

    **Cause:** Database credentials wrong

    **Fix:**
    1. Go to Settings > Environment
    2. Check DATABASE_URL matches Supabase exactly
    3. Verify DB_PASSWORD is correct
    4. Update and save (will auto-redeploy)

    ---

    ### Issue 3: Deployment Hangs at "Installing dependencies"

    **Cause:** Network issue or package installation problem

    **Fix:**
    1. Check Render status page: https://status.render.com
    2. Wait 5-10 minutes
    3. If still stuck, click "Manual Deploy" > "Clear build cache & deploy"

    ---

    ### Issue 4: "Port already in use"

    **Cause:** App trying to use fixed port

    **Fix:**
    1. Check backend/src/index.ts
    2. Should be: `const PORT = process.env.PORT || 5000;`
    3. Render assigns dynamic port, your app must use process.env.PORT

    ---

    ### Issue 5: CORS Errors When Testing

    **Cause:** FRONTEND_URL not matching actual frontend URL

    **Fix:**
    1. After deploying frontend, get Netlify URL
    2. Update FRONTEND_URL in Render environment variables
    3. Save (will auto-redeploy)

    ---

    ## 📊 After Deployment Checklist

    - [ ] Health check endpoint responds
    - [ ] Login works (database connected)
    - [ ] Check logs for errors
    - [ ] No crash/restart loops
    - [ ] Backend stays "Live" (green)
    - [ ] Save Render URL for frontend setup

    ---

    ## 🔄 How to Redeploy After Code Changes

    **Option 1: Manual Deploy**
    1. Push changes to GitHub (husseinngobi/lush_laundry)
    2. Go to Render dashboard
    3. Click "Manual Deploy" > "Deploy latest commit"

    **Option 2: Auto Deploy (Setup Later)**
    1. Connect Render to your GitHub repository
    2. Enable "Auto-Deploy" on main branch
    3. Every git push triggers deployment

    ---

    ## 💰 Pricing Notes

    **Free Tier:**
    - Spins down after 15 minutes of inactivity
    - First request takes 30-60 seconds (cold start)
    - 750 hours/month free

    **Starter ($7/month):**
    - Always on (no spin down)
    - Instant response times
    - Recommended for production

    **Tip:** Start with free tier for testing, upgrade when ready for production

    ---

    ## 🆘 Need Help?

    **If deployment fails:**

    1. Check build logs (scroll up in Render dashboard)
    2. Look for red error messages
    3. Common fixes:
    - Verify all environment variables
    - Check package.json has "build" and "start" scripts
    - Ensure backend/package.json exists

    **Still stuck?**
    - Copy error message from logs
    - Check Render documentation: https://render.com/docs
    - Ask me for help with specific error

    ---

    ## ✅ Success Criteria

    Your backend is successfully deployed when:

    - [x] Build completes without errors
    - [x] Status shows "Live" (green)
    - [x] Health endpoint returns `{"status":"ok"}`
    - [x] Can login with admin credentials
    - [x] Backend stays running (no crashes)
    - [x] Logs show "Database connected successfully"

    **If all checked, proceed to frontend deployment!** 🎉

    ---

    ## 📝 Next Steps

    After backend is deployed:

    1. ✅ Test all endpoints with Postman
    2. ✅ Update frontend VITE_API_URL with Render URL
    3. ✅ Deploy frontend to Netlify
    4. ✅ Test full system integration
    5. ✅ Monitor for 24 hours

    **Your Render URL:** ___________________________________ (Fill this in!)

    **Status:** 
    - [ ] Deployed Successfully
    - [ ] Testing in Progress
    - [ ] Production Ready

    ---

    **Deployment Date:** _______________  
    **Deployed By:** _______________  
    **Notes:** 
    ```
    (Add any notes about deployment process)
    ```

    ---

    Good luck! The deployment should be straightforward. Take your time with the environment variables - that's where most issues come from. 🚀
