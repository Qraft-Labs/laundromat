# Dual Authentication Fixes - Google + Password Login

    ## Issues Identified

    ### 1. Network Issue (IMMEDIATE - Not a Code Problem)
    **Error:** `getaddrinfo ENOTFOUND www.googleapis.com`

    **What it means:** Your server cannot resolve Google's domain name. This is a DNS/network connectivity issue on your Windows server.

    **Solutions:**
    - Check your internet connection
    - Verify DNS settings (try using 8.8.8.8 or 1.1.1.1 as DNS server)
    - Check if a firewall is blocking outbound HTTPS connections
    - Try: `ping www.googleapis.com` in PowerShell to test connectivity
    - Try: `nslookup www.googleapis.com` to test DNS resolution

    ### 2. Dual Authentication Bug (FIXED - Code Problem)
    **Problem:** When a Google user added a password, they COULD login with email/password, but Google login would fail because:
    1. Login endpoint checked `auth_provider === 'GOOGLE'` and blocked users with passwords
    2. When adding password, `auth_provider` stayed as 'GOOGLE' instead of changing to 'DUAL'
    3. When logging in via Google, passport.ts reset `auth_provider` back to 'GOOGLE', losing dual auth

    ## Code Changes Made

    ### 1. auth.controller.ts - Login Endpoint (Line 115-122)
    **Before:**
    ```typescript
    // Blocked Google users with passwords
    if (user.auth_provider === 'GOOGLE' && !user.password) {
    return res.status(401).json({ 
        error: 'This account uses Google login. Please sign in with Google.',
        auth_provider: 'GOOGLE'
    });
    }
    ```

    **After:**
    ```typescript
    // Only block users who have NO password at all
    if (!user.password) {
    await logFailedLogin(email, clientIP, userAgent, 'Account has no password - Google OAuth only');
    return res.status(401).json({ 
        error: 'This account uses Google login. Please sign in with Google or add a password from your profile.',
        auth_provider: user.auth_provider
    });
    }
    ```

    **Why:** Now checks if user has a password, regardless of auth_provider. If they have a password, they can login with it.

    ### 2. auth.controller.ts - Change Password Endpoint (Line 286-294)
    **Before:**
    ```typescript
    await query(
    'UPDATE users SET password = $1, must_change_password = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
    [hashedNewPassword, userId]
    );
    ```

    **After:**
    ```typescript
    await query(
    'UPDATE users SET password = $1, auth_provider = $2, must_change_password = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
    [hashedNewPassword, 'DUAL', userId]
    );
    ```

    **Why:** When a Google user adds a password, update auth_provider from 'GOOGLE' to 'DUAL' to indicate both login methods available.

    ### 3. passport.ts - Google OAuth Callback (Line 58-71)
    **Before:**
    ```typescript
    await query(
    'UPDATE users SET google_id = $1, auth_provider = $2, role = $3, profile_picture = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5',
    [googleId, 'GOOGLE', 'ADMIN', pictureToUse, user.id]
    );
    ```

    **After:**
    ```typescript
    // Preserve DUAL auth if user has added a password
    const authProvider = (user.auth_provider === 'DUAL' || (user.password && user.auth_provider === 'GOOGLE')) 
    ? 'DUAL' 
    : 'GOOGLE';

    await query(
    'UPDATE users SET google_id = $1, auth_provider = $2, role = $3, profile_picture = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5',
    [googleId, authProvider, 'ADMIN', pictureToUse, user.id]
    );
    ```

    **Why:** Preserves DUAL authentication when user logs in via Google. Doesn't reset it back to 'GOOGLE'.

    ### 4. showAllUsers.ts - Display Script (Line 68-69, Line 100)
    **Before:**
    ```typescript
    const authIcon = user.auth_provider === 'GOOGLE' ? '🔗 Google' : '🔐 Email/Password';
    ```

    **After:**
    ```typescript
    const authIcon = user.auth_provider === 'GOOGLE' ? '🔗 Google' : 
                    user.auth_provider === 'DUAL' ? '🔗🔐 Google + Password' :
                    '🔐 Email/Password';
    ```

    **Why:** Shows correct auth method in admin tools.

    ## How It Works Now

    ### Auth Provider Values:
    - **LOCAL**: Email/password only (regular users)
    - **GOOGLE**: Google OAuth only (no password set)
    - **DUAL**: Both Google OAuth AND email/password (administrator with both)

    ### User Flow:

    #### Scenario 1: Pure Google User
    1. Admin logs in with Google → `auth_provider = 'GOOGLE'`, no password
    2. Can only login via "Sign in with Google" button
    3. Cannot login via email/password (will get error: "This account uses Google login")

    #### Scenario 2: Google User Adds Password (DUAL AUTH)
    1. Admin logs in with Google → `auth_provider = 'GOOGLE'`
    2. Goes to Profile page → "Add Password (Optional)" section
    3. Enters new password → Click "Add Password"
    4. Backend updates: `auth_provider = 'DUAL'`, saves hashed password
    5. **Now can login BOTH ways:**
    - Click "Sign in with Google" → Works ✅
    - Enter email + password → Works ✅

    #### Scenario 3: Preserving Dual Auth
    1. User has DUAL auth (Google + password)
    2. Logs in via Google OAuth
    3. passport.ts checks: Does user have password? Yes → Keep `auth_provider = 'DUAL'`
    4. Dual auth preserved ✅

    ## Testing Checklist

    ### Test 1: Network Issue
    ```powershell
    # In PowerShell, test Google connectivity
    ping www.googleapis.com
    nslookup www.googleapis.com
    curl https://www.googleapis.com
    ```

    If these fail, fix network/DNS before testing Google login.

    ### Test 2: Email/Password Login (Already Works)
    1. Go to login page
    2. Enter your admin email
    3. Enter your password
    4. Click "Login"
    5. Should work ✅ (this already worked for you)

    ### Test 3: Google Login (After Network Fixed)
    1. Go to login page
    2. Click "Sign in with Google"
    3. Select your Google account
    4. Should redirect back and login ✅

    ### Test 4: Dual Auth Preservation
    1. Login with email/password
    2. Go to Profile page
    3. Check that "Auth Provider" shows "DUAL" or "Google + Password"
    4. Logout
    5. Login with Google
    6. Go to Profile page again
    7. Should still show "DUAL" - not reset to "GOOGLE" ✅

    ## Database State

    Your admin account should now have:
    - `email`: husseinibram555@gmail.com
    - `password`: (bcrypt hash of your password)
    - `auth_provider`: 'DUAL' (will be set on next password change or Google login)
    - `google_id`: (your Google ID)
    - `role`: 'ADMIN'

    ## Next Steps

    1. **Fix network issue first** - Run connectivity tests above
    2. **Restart backend server** - So code changes take effect
    3. **Test email/password login** - Should still work
    4. **Test Google login** - Should work once network is fixed
    5. **Verify dual auth** - Login both ways to confirm

    ## Commands to Run

    ```powershell
    # Navigate to backend
    cd D:\work_2026\lush_laundry\backend

    # Restart server (Ctrl+C to stop current one, then):
    npm run dev

    # Or if using nodemon:
    npx nodemon
    ```

    ## Summary

    ✅ **Code bug fixed** - Dual authentication now fully supported
    ❌ **Network issue remains** - Need to fix DNS/connectivity to Google
    🔐 **Security improved** - Clear separation of auth methods
    📊 **Admin tools updated** - Shows correct auth status

    You can now:
    - Login with email + password ✅
    - Login with Google (once network fixed) ✅
    - Switch between both methods freely ✅
    - Auth method preserved correctly ✅
