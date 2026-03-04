# Quick Start: Enable Google OAuth Locally (5 Minutes)

    ## Step 1: Get Google Credentials (3 min)

    1. Open [Google Cloud Console](https://console.cloud.google.com/)
    2. Click **"New Project"** → Name: "Lush Laundry ERP" → Create
    3. In search bar, type "Google+ API" → Enable
    4. Go to **Credentials** (left sidebar)
    5. Click **"Create Credentials"** → OAuth 2.0 Client ID
    6. Configure consent screen:
    - User type: External
    - App name: Lush Laundry ERP
    - Add your email
    - Save
    7. Create OAuth Client ID:
    - Application type: **Web application**
    - Name: Lush Laundry Web
    - Authorized redirect URIs → Click **"Add URI"**:
        - `http://localhost:5000/auth/google/callback`
        - `https://yourdomain.com/auth/google/callback` (for later)
    - Click **Create**
    8. Copy the **Client ID** and **Client Secret**

    ---

    ## Step 2: Update .env File (1 min)

    Open `backend/.env` and add:

    ```env
    # Google OAuth
    GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
    GOOGLE_CLIENT_SECRET=your_client_secret_here
    GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
    SESSION_SECRET=ThisIsARandomSecret32CharactersMin
    FRONTEND_URL=http://localhost:3000

    # Authorized Admins (YOUR Gmail)
    AUTHORIZED_ADMIN_EMAILS=youremail@gmail.com
    ```

    Replace:
    - `your_client_id_here` → Paste Client ID from Step 1
    - `your_client_secret_here` → Paste Client Secret from Step 1
    - `youremail@gmail.com` → Your Gmail address

    ---

    ## Step 3: Install Packages (1 min)

    ```bash
    cd backend
    npm install passport passport-google-oauth20 express-session
    npm install --save-dev @types/passport @types/passport-google-oauth20 @types/express-session
    ```

    ---

    ## Step 4: Run Database Migration (30 sec)

    ```bash
    # Connect to your local database
    psql -U postgres -d lush_laundry

    # Run this SQL
    ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(20) DEFAULT 'LOCAL';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT FALSE;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS temp_password_expires_at TIMESTAMP;

    UPDATE users SET auth_provider = 'LOCAL' WHERE auth_provider IS NULL;

    CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

    \q
    ```

    ---

    ## Step 5: Copy Passport Config (30 sec)

    **Option A**: If you haven't created the files yet, follow the full implementation guide in `GOOGLE_AUTH_IMPLEMENTATION.md`

    **Option B**: Quick test - I'll implement it for you! Just say: *"Implement Google OAuth now"*

    ---

    ## Step 6: Start Servers & Test (1 min)

    ```bash
    # Terminal 1 - Backend
    cd backend
    npm run dev

    # Terminal 2 - Frontend
    cd frontend
    npm run dev
    ```

    1. Open browser: `http://localhost:3000`
    2. Click **"Sign in with Google"**
    3. Select your Gmail (the one in `AUTHORIZED_ADMIN_EMAILS`)
    4. Authorize the app
    5. **Success!** You're logged in as Admin

    ---

    ## What Happens:

    1. Google OAuth popup appears
    2. You authorize with your Gmail
    3. Backend receives Google user info
    4. Checks if email is in `AUTHORIZED_ADMIN_EMAILS`
    5. ✅ **Auto-creates admin account** with:
    - Name from Google profile
    - Email from Google
    - Role: ADMIN
    - auth_provider: GOOGLE
    6. Redirects to dashboard
    7. You're logged in!

    ---

    ## Verification

    Check database to see your new admin account:

    ```sql
    SELECT id, full_name, email, role, auth_provider, google_id, created_at
    FROM users
    WHERE auth_provider = 'GOOGLE';
    ```

    Should show:
    ```
    id | full_name      | email              | role  | auth_provider | google_id      | created_at
    1  | Hussein Ngobi  | hussein@gmail.com  | ADMIN | GOOGLE        | 1234567890...  | 2026-01-19...
    ```

    ---

    ## When You Deploy to Production:

    1. Keep same Client ID/Secret
    2. Update production `.env`:
    ```env
    GOOGLE_CALLBACK_URL=https://yourdomain.com/auth/google/callback
    FRONTEND_URL=https://yourdomain.com
    ```
    3. Google automatically uses correct callback URL
    4. **No code changes needed!**

    ---

    ## Troubleshooting

    ### Error: "Redirect URI Mismatch"

    **Fix**: Go to Google Cloud Console → Credentials → Edit your OAuth Client → Make sure **exactly** this is listed:
    ```
    http://localhost:5000/auth/google/callback
    ```

    ### Error: "Email not authorized"

    **Fix**: Check `.env` file - is your Gmail in `AUTHORIZED_ADMIN_EMAILS`?

    ### Error: "Cannot find module 'passport'"

    **Fix**: Did you run `npm install` in `backend/` folder?

    ---

    ## Next Steps

    Once local Google OAuth works:
    - Add business owner's Gmail to `AUTHORIZED_ADMIN_EMAILS`
    - Test creating desktop agent accounts with temp passwords
    - Deploy to production with same setup

    **Ready to implement? Say: "Implement Google OAuth now" and I'll create all the files!**
