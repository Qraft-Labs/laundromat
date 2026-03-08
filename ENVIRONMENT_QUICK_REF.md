# Quick Reference: Environment Variables Setup

    ## 🏠 LOCALHOST TESTING

    ### Start Development Servers:
    ```powershell
    # Terminal 1 - Backend
    cd backend
    npm run dev
    # ✅ http://localhost:5000

    # Terminal 2 - Frontend  
    cd frontend
    npm run dev
    # ✅ http://localhost:5173
    ```

    ### Login Access:
    - **URL:** http://localhost:5173/login
    - **Admin:** husseinibram555@gmail.com
    - **Backend API:** http://localhost:5000/api
    - **Database:** Supabase (production database)

    ---

    ## 🚀 PRODUCTION (DEPLOYED)

    ### URLs:
    - **Frontend:** https://laundrosys.netlify.app
    - **Backend:** https://lush-laundry-api.onrender.com
    - **Database:** Supabase (same database)

    ### Login Access:
    - **URL:** https://laundrosys.netlify.app/login
    - **Admin:** husseinibram555@gmail.com
    - **Works automatically after deployment**

    ---

    ## 🔄 DEPLOYMENT WORKFLOW

    1. **Test Locally:**
    ```powershell
    # Make changes, test on localhost
    ```

    2. **Commit & Push:**
    ```powershell
    git add .
    git commit -m "Your changes"
    git push origin main
    ```

    3. **Auto-Deploy:**
    - Netlify rebuilds frontend (~2 min)
    - Render rebuilds backend (~5 min)
    - Both use same Supabase database

    4. **Test Production:**
    - Open https://laundrosys.netlify.app
    - Test same features as localhost

    ---

    ## ✅ CURRENT STATUS

    ### Frontend (.env files):
    - ✅ `.env` → Localhost (http://localhost:5000)
    - ✅ `.env.production` → Production (https://lush-laundry-api.onrender.com)

    ### Backend (Environment):
    - ✅ Localhost: Uses `backend/.env`
    - ✅ Production: Uses Render dashboard env vars

    ### Database:
    - ✅ Single Supabase instance
    - ✅ Used by both localhost and production
    - ✅ No data sync needed

    ### CORS:
    - ✅ Localhost: Open (allows all origins)
    - ✅ Production: Restricted (Netlify only)

    **Both environments fully configured! 🎉**
