# Google OAuth Setup Guide

    ## Current Configuration

    **Your Google Client ID:**
    ```
YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
    http://localhost:5000/api/auth/google/callback
    ```

    **Your Frontend URL:**
    ```
    http://localhost:8080
    ```

    ## ✅ Network Diagnostic Results

    **DNS Resolution:** ✅ Working (Can resolve www.googleapis.com)  
    **HTTPS Connection:** ✅ Working (Can reach Google servers)  
    **OAuth Endpoint:** ✅ Reachable

    **Conclusion:** Network is fine. Problem is Google Console configuration.

    ---

    ## 🔧 Fix in Google Cloud Console

    ### Step 1: Open Google Cloud Console
    Visit: https://console.cloud.google.com/apis/credentials

    ### Step 2: Find Your OAuth Client
    Click on: `337038818645-nhj03eq0qihithovt9mc036ej6kcvu8c`

    ### Step 3: Configure Authorized Redirect URIs
    **Must have EXACTLY (case-sensitive, no extra spaces):**

    ```
    http://localhost:5000/api/auth/google/callback
    ```

    **If deploying to production, also add:**
    ```
    https://yourdomain.com/api/auth/google/callback
    ```

    ### Step 4: Configure Authorized JavaScript Origins
    **Add these URLs:**

    ```
    http://localhost:5000
    http://localhost:8080
    ```

    **If deploying to production, also add:**
    ```
    https://yourdomain.com
    ```

    ### Step 5: Save Changes
    Click **"SAVE"** button at the bottom

    ⚠️ **IMPORTANT:** Changes can take 5-10 minutes to propagate!

    ---

    ## 🧪 Test After Configuration

    ### 1. Wait 5-10 Minutes
    Google needs time to update their servers.

    ### 2. Clear Browser Cache
    - Press `Ctrl + Shift + Delete`
    - Clear cookies and cache
    - Close all browser windows

    ### 3. Restart Backend Server
    ```powershell
    cd backend
    npm run dev
    ```

    ### 4. Test Login
    1. Go to: http://localhost:8080/login
    2. Click "Sign in with Google"
    3. Should redirect to Google login page
    4. After signing in, should redirect back to your app

    ---

    ## 🔍 Common Issues & Fixes

    ### Issue 1: "Redirect URI Mismatch"
    **Error:** `redirect_uri_mismatch`

    **Fix:** 
    - Check Google Console has EXACT URL: `http://localhost:5000/api/auth/google/callback`
    - No trailing slash!
    - Check for typos
    - Case-sensitive!

    ### Issue 2: "Origin Mismatch"
    **Error:** `Not a valid origin for the client`

    **Fix:**
    - Add `http://localhost:5000` to Authorized JavaScript origins
    - Add `http://localhost:8080` to Authorized JavaScript origins

    ### Issue 3: "Access Blocked"
    **Error:** `This app hasn't been verified by Google`

    **Fix:**
    - Click "Advanced"
    - Click "Go to [Your App Name] (unsafe)"
    - This is normal for development apps

    ### Issue 4: Still Getting "Failed to Obtain Access Token"
    **Possible Causes:**
    1. ❌ Google Console changes not propagated yet (wait 10 minutes)
    2. ❌ Wrong Client ID/Secret in .env file
    3. ❌ Browser has old cached OAuth state
    4. ❌ Session cookies interfering

    **Fix:**
    ```powershell
    # 1. Clear backend cache
    cd backend
    rm -r node_modules/.cache  # If exists

    # 2. Restart with clean state
    npm run dev

    # 3. Clear browser completely
    # - Clear all cookies for localhost
    # - Use incognito/private window
    ```

    ---

    ## 📋 Checklist

    Before testing, verify:

    - [ ] Google Console has correct Redirect URI
    - [ ] Google Console has correct JavaScript Origins
    - [ ] Clicked SAVE in Google Console
    - [ ] Waited 5-10 minutes
    - [ ] Backend server restarted
    - [ ] Browser cache cleared
    - [ ] Using correct email: `husseinibram555@gmail.com`
    - [ ] Email is in AUTHORIZED_ADMIN_EMAILS in .env

    ---

    ## 🎯 Your Current .env Settings

    These look correct:

    ```bash
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
AUTHORIZED_ADMIN_EMAILS=admin@example.com

    **Do NOT change these** - the issue is in Google Console configuration, not your .env file.

    ---

    ## 🔐 Security Note

    **Never share publicly:**
    - ❌ GOOGLE_CLIENT_SECRET
    - ❌ JWT_SECRET
    - ❌ Database passwords
    - ❌ Twilio tokens

    (Remove from git history if accidentally committed)

    ---

    ## 📞 If Still Not Working

    After following all steps above and waiting 10 minutes, if still failing:

    **Check Backend Logs for Exact Error:**
    ```powershell
    cd backend
    npm run dev
    # Then try Google login
    # Copy the EXACT error message
    ```

    **Check Frontend Console:**
    1. Open browser DevTools (F12)
    2. Go to Console tab
    3. Try Google login
    4. Look for error messages
    5. Copy exact error

    **Send these details:**
    - Exact error from backend terminal
    - Exact error from browser console
    - Screenshot of Google Console Authorized redirect URIs section
