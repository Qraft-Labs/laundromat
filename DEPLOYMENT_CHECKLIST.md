# ✅ Production Deployment Checklist

    ## Pre-Deployment (On Your PC)

    ### Code Preparation
    - [ ] All features tested locally
    - [ ] No console.log or debug statements
    - [ ] All tests passing
    - [ ] Code committed to git
    - [ ] Code pushed to GitHub repository

    ### Database Scripts Ready
    - [ ] `00_production_clean_setup.sql` - Creates empty database structure
    - [ ] `01_initial_business_data.sql` - Your price list and categories (customize first!)
    - [ ] Verified both scripts run without errors locally

    ### Environment Variables Prepared
    - [ ] List of all required environment variables documented
    - [ ] Google OAuth credentials ready
    - [ ] JWT secret generated (use: `openssl rand -base64 32`)
    - [ ] Admin email addresses listed

    ---

    ## Phase 1: Database Deployment

    ### Create Production Database
    - [ ] Signed up for Neon.tech (or Supabase/ElephantSQL)
    - [ ] Created new database project
    - [ ] Copied connection string
    - [ ] Tested connection from your PC

    ### Initialize Database Structure
    ```bash
    # Run clean setup (creates tables, NO data)
    psql "postgresql://your-connection-string" < backend/src/database/migrations/00_production_clean_setup.sql
    ```
    - [ ] Ran 00_production_clean_setup.sql successfully
    - [ ] Verified all 10 tables created
    - [ ] Verified all foreign keys exist
    - [ ] Verified all indexes created
    - [ ] Confirmed all sequences start at 1

    ### Add Initial Business Data
    ```bash
    # Add your price list and expense categories
    psql "postgresql://your-connection-string" < backend/src/database/migrations/01_initial_business_data.sql
    ```
    - [ ] Customized 01_initial_business_data.sql with YOUR prices
    - [ ] Ran 01_initial_business_data.sql successfully
    - [ ] Verified price items added
    - [ ] Verified expense categories added

    ### Verification Queries
    ```sql
    -- Check tables
    SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

    -- Check price items
    SELECT COUNT(*), category FROM price_items GROUP BY category;

    -- Check expense categories  
    SELECT name FROM expense_categories WHERE is_active = TRUE;

    -- Check data is clean
    SELECT COUNT(*) FROM customers;  -- Should be 0
    SELECT COUNT(*) FROM orders;     -- Should be 0
    SELECT COUNT(*) FROM users;      -- Should be 0 (unless you added manually)
    ```
    - [ ] All queries return expected results
    - [ ] No test data present
    - [ ] Structure is intact

    ---

    ## Phase 2: Backend Deployment (Render.com)

    ### Setup Render Account
    - [ ] Signed up for Render.com
    - [ ] Connected GitHub account
    - [ ] Authorized repository access

    ### Create Web Service
    - [ ] Clicked "New +" → "Web Service"
    - [ ] Selected lush_laundry repository
    - [ ] Configured settings:
    ```
    Name: lush-laundry-api
    Root Directory: backend
    Environment: Node
    Build Command: npm install && npm run build
    Start Command: node dist/server.js
    ```
    - [ ] Noted deployment URL (e.g., https://lush-laundry-api.onrender.com)

    ### Add Environment Variables
    - [ ] DB_HOST (from Neon connection string)
    - [ ] DB_PORT (5432)
    - [ ] DB_NAME (from Neon)
    - [ ] DB_USER (from Neon)
    - [ ] DB_PASSWORD (from Neon)
    - [ ] JWT_SECRET (generated random string)
    - [ ] JWT_EXPIRATION (15m)
    - [ ] GOOGLE_CLIENT_ID
    - [ ] GOOGLE_CLIENT_SECRET
    - [ ] GOOGLE_CALLBACK_URL (https://lush-laundry-api.onrender.com/auth/google/callback)
    - [ ] NODE_ENV (production)
    - [ ] PORT (5000)
    - [ ] FRONTEND_URL (will add after frontend deployment)
    - [ ] AUTHORIZED_ADMIN_EMAILS (your email)

    ### Deploy Backend
    - [ ] Clicked "Create Web Service"
    - [ ] Waited for build to complete (5-10 minutes)
    - [ ] Build succeeded (green checkmark)
    - [ ] Service is live

    ### Test Backend
    ```bash
    # Test health endpoint
    curl https://lush-laundry-api.onrender.com/health
    ```
    - [ ] Health check returns success
    - [ ] Backend is responding
    - [ ] Checked logs for errors (should be clean)

    ---

    ## Phase 3: Frontend Deployment (Netlify)

    ### Setup Netlify Account
    - [ ] Signed up for Netlify.com
    - [ ] Connected GitHub account
    - [ ] Authorized repository access

    ### Deploy Site
    - [ ] Clicked "Add new site" → "Import existing project"
    - [ ] Selected lush_laundry repository
    - [ ] Configured build settings:
    ```
    Base directory: frontend
    Build command: npm run build
    Publish directory: frontend/dist
    ```

    ### Add Environment Variables
    - [ ] VITE_API_URL (https://lush-laundry-api.onrender.com)
    - [ ] VITE_GOOGLE_CLIENT_ID (same as backend)

    ### Complete Deployment
    - [ ] Clicked "Deploy site"
    - [ ] Waited for build (3-5 minutes)
    - [ ] Build succeeded
    - [ ] Noted site URL (e.g., https://random-name-123.netlify.app)

    ### Test Frontend
    - [ ] Opened frontend URL in browser
    - [ ] Site loads without errors
    - [ ] UI displays correctly
    - [ ] Checked browser console (no errors)

    ---

    ## Phase 4: Connect Frontend & Backend

    ### Update Backend Environment
    - [ ] Went to Render dashboard
    - [ ] Opened lush-laundry-api service
    - [ ] Edited environment variables
    - [ ] Updated FRONTEND_URL to Netlify URL
    - [ ] Saved (triggers auto-redeploy)
    - [ ] Waited for redeploy to complete

    ### Update Google OAuth
    - [ ] Opened Google Cloud Console
    - [ ] Went to APIs & Services → Credentials
    - [ ] Edited OAuth 2.0 Client
    - [ ] Added Authorized Redirect URIs:
    ```
    https://lush-laundry-api.onrender.com/auth/google/callback
    https://random-name-123.netlify.app/auth/google/callback
    ```
    - [ ] Saved changes

    ---

    ## Phase 5: Initial Testing

    ### Test Authentication
    - [ ] Opened frontend URL
    - [ ] Clicked "Sign in with Google"
    - [ ] Successfully authenticated
    - [ ] Redirected to dashboard
    - [ ] Profile picture displayed (or initials)
    - [ ] Verified admin role assigned

    ### Test Customer Registration
    - [ ] Navigated to Customers page
    - [ ] Created first test customer
    - [ ] Customer ID = 1 (starts fresh!)
    - [ ] Customer data saved successfully

    ### Test Order Creation
    - [ ] Navigated to New Order page
    - [ ] Selected customer
    - [ ] Added items from price list
    - [ ] Verified prices display correctly
    - [ ] Created order
    - [ ] Order number = ORD-YYYYMMDD-1 (first order!)
    - [ ] Order saved successfully

    ### Test Payment Recording
    - [ ] Opened order details
    - [ ] Recorded payment
    - [ ] Payment status updated
    - [ ] Balance calculated correctly

    ### Test Other Features
    - [ ] Expense tracking works
    - [ ] Dashboard displays correct data
    - [ ] Reports generate properly
    - [ ] All pages load without errors

    ---

    ## Phase 6: Optional - Custom Domain

    ### If You Have a Domain (e.g., lushlaundry.com)

    #### Frontend (Netlify)
    - [ ] Went to Site settings → Domain management
    - [ ] Clicked "Add custom domain"
    - [ ] Entered domain: lushlaundry.com
    - [ ] Followed DNS configuration instructions
    - [ ] Waited for DNS propagation (can take 24-48 hours)
    - [ ] Verified SSL certificate issued (automatic, free)
    - [ ] Site accessible at https://lushlaundry.com

    #### Backend (Render)
    - [ ] Went to Settings → Custom Domain
    - [ ] Entered subdomain: api.lushlaundry.com
    - [ ] Followed DNS configuration
    - [ ] Waited for DNS propagation
    - [ ] Verified SSL certificate issued
    - [ ] API accessible at https://api.lushlaundry.com

    #### Update Environment Variables
    - [ ] Updated FRONTEND_URL in Render to custom domain
    - [ ] Updated VITE_API_URL in Netlify to custom API domain
    - [ ] Updated Google OAuth redirect URIs
    - [ ] Redeployed both services

    ---

    ## Phase 7: Post-Deployment

    ### Create Staff Accounts
    - [ ] Generated password hash for cashier
    ```bash
    node -e "console.log(require('bcryptjs').hashSync('TempPassword123', 10))"
    ```
    - [ ] Inserted staff user via SQL
    - [ ] Tested staff login
    - [ ] Verified desktop agent permissions

    ### Document Credentials
    - [ ] Admin email and password (secure location)
    - [ ] Staff accounts credentials
    - [ ] Database connection strings (secure!)
    - [ ] API URLs documented
    - [ ] Frontend URL documented

    ### Setup Monitoring
    - [ ] Enabled email alerts in Render (for downtime)
    - [ ] Enabled deploy notifications in Netlify
    - [ ] Bookmarked Render dashboard
    - [ ] Bookmarked Netlify dashboard
    - [ ] Bookmarked Neon dashboard

    ### Backup Plan
    - [ ] Documented database backup procedure
    - [ ] Created first manual backup
    ```bash
    pg_dump "postgresql://connection-string" > backup_YYYYMMDD.sql
    ```
    - [ ] Saved backup securely
    - [ ] Tested restore procedure (on separate test db)

    ---

    ## Phase 8: Go Live! 🚀

    ### Final Verification
    - [ ] All features tested in production
    - [ ] No errors in browser console
    - [ ] No errors in backend logs
    - [ ] Database connections stable
    - [ ] API responding quickly
    - [ ] Frontend loading fast
    - [ ] SSL certificates valid (green padlock)

    ### Inform Stakeholders
    - [ ] Notified business owner
    - [ ] Trained staff on system
    - [ ] Shared frontend URL
    - [ ] Provided login credentials
    - [ ] Documented troubleshooting steps

    ### Launch!
    - [ ] System is LIVE! 🎉
    - [ ] First real customer registered
    - [ ] First real order created
    - [ ] Payment processed successfully
    - [ ] Monitoring for issues
    - [ ] Ready for business!

    ---

    ## Rollback Plan (If Something Goes Wrong)

    ### Immediate Actions
    1. Check Render logs for backend errors
    2. Check Netlify logs for frontend errors
    3. Check browser console for client errors
    4. Verify environment variables are correct

    ### If Backend Fails
    ```bash
    # Rollback to previous version
    git log  # Find last working commit
    git revert HEAD  # Undo last commit
    git push origin main  # Auto-redeploys previous version
    ```

    ### If Database Issue
    ```bash
    # Restore from backup
    psql "postgresql://connection-string" < backup_YYYYMMDD.sql
    ```

    ### If Frontend Fails
    - Go to Netlify dashboard
    - Click "Deploys"
    - Find last successful deploy
    - Click "Publish deploy"

    ---

    ## Maintenance Checklist (Weekly)

    - [ ] Check Render logs for errors
    - [ ] Check Netlify analytics
    - [ ] Verify database backup exists
    - [ ] Monitor disk space usage
    - [ ] Check for security updates
    - [ ] Review error reports
    - [ ] Test critical workflows

    ---

    ## Success Criteria

    ### System is Successfully Deployed When:

    ✅ Frontend loads at public URL  
    ✅ Backend API responds to requests  
    ✅ Database accepts connections  
    ✅ Google OAuth works  
    ✅ Can create customers (ID starts at 1)  
    ✅ Can create orders (ID starts at 1)  
    ✅ Can record payments  
    ✅ Can track expenses  
    ✅ All features functional  
    ✅ No errors in logs  
    ✅ SSL certificates valid  
    ✅ Staff can login and use system  

    ---

    ## Estimated Timeline

    | Phase | Time Required |
    |-------|---------------|
    | Database Setup | 30 minutes |
    | Backend Deployment | 30 minutes |
    | Frontend Deployment | 20 minutes |
    | OAuth Configuration | 15 minutes |
    | Testing | 30 minutes |
    | Custom Domain (optional) | 24-48 hours (DNS) |
    | **Total First-Time** | **2-3 hours** |
    | **Future Deployments** | **Automatic (just push to GitHub)** |

    ---

    ## Help & Resources

    ### Documentation
    - [SIMPLE_DEPLOYMENT_GUIDE.md](./SIMPLE_DEPLOYMENT_GUIDE.md) - Detailed step-by-step guide
    - [TEST_VS_PRODUCTION_DATA.md](./TEST_VS_PRODUCTION_DATA.md) - Understanding data migration
    - [PRODUCTION_READINESS.md](./PRODUCTION_READINESS.md) - System health report

    ### Support Links
    - Neon Docs: https://neon.tech/docs/introduction
    - Render Docs: https://render.com/docs
    - Netlify Docs: https://docs.netlify.com

    ### Common Issues
    - **Backend won't start:** Check environment variables, especially database credentials
    - **Frontend can't reach API:** Verify VITE_API_URL and CORS settings
    - **Google OAuth fails:** Check redirect URIs match exactly
    - **Database connection fails:** Verify connection string format and credentials

    ---

    **Remember:** Take it one phase at a time. Don't rush. Each checkbox matters! 

    **Good luck with your deployment! 🚀**
