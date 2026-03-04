# 🔧 FIXING "ENOTFOUND "www.googleapis.com" ERROR

    ## Root Cause Identified ✅

    **Your Windows system has a PROXY configured:** `10.3.122.9:8080`

    Even though it's disabled, Node.js is getting confused and cannot resolve DNS.

    ---

    ## ✅ Immediate Fix (Code Changes Applied)

    I've added DNS fixes to your backend code. **Restart your backend server:**

    ```powershell
    # Stop current server (Ctrl+C)
    # Then restart:
    cd backend
    npm run dev
    ```

    **What was fixed:**
    - ✅ Force IPv4 DNS resolution (Windows IPv6 issues)
    - ✅ Clear proxy environment variables
    - ✅ Direct connection to Google APIs

    You should see these new messages when server starts:
    ```
    🌐 DNS Configuration: IPv4 priority (fixing Windows DNS issues)
    🔓 Proxy Settings: Disabled (direct connection)
    ```

    ---

    ## 🔧 Windows Network Fix (If Still Not Working)

    **Run this PowerShell script as ADMINISTRATOR:**

    ```powershell
    cd backend
    powershell -ExecutionPolicy Bypass -File fix-windows-network.ps1
    ```

    This will:
    1. ✅ Flush DNS cache
    2. ✅ Reset Winsock
    3. ✅ Reset TCP/IP
    4. ✅ Check/fix DNS servers
    5. ✅ Disable proxy if enabled
    6. ✅ Test Google connectivity

    ⚠️ **You may need to restart Windows after running this.**

    ---

    ## 🧪 Quick Test After Restart

    **Option 1: Test DNS from PowerShell**
    ```powershell
    # Should all succeed:
    ping www.googleapis.com
    nslookup www.googleapis.com
    Test-NetConnection www.googleapis.com -Port 443
    curl https://www.googleapis.com
    ```

    **Option 2: Test from Node.js**
    ```powershell
    cd backend
    node diagnose-google-oauth.js
    ```

    All tests should pass ✅

    ---

    ## 🎯 Test Google Login

    1. **Make sure backend is running** (with new DNS fixes)
    2. **Go to:** http://localhost:8080/login
    3. **Click:** "Sign in with Google"
    4. **Should work!** ✅

    ---

    ## 🔍 If STILL Not Working

    ### Check 1: Antivirus/Firewall
    Some antivirus software blocks Node.js specifically.

    **Windows Defender:**
    ```powershell
    # Add exception for Node.js
    New-NetFirewallRule -DisplayName "Node.js" -Direction Outbound -Program "C:\Program Files\nodejs\node.exe" -Action Allow
    ```

    ### Check 2: VPN
    If you're using a VPN, **disconnect it temporarily** and test.

    ### Check 3: IPv6
    Completely disable IPv6 on your network adapter:

    1. Open Network Connections
    2. Right-click your adapter → Properties
    3. Uncheck "Internet Protocol Version 6 (TCP/IPv6)"
    4. Click OK
    5. Restart computer

    ### Check 4: Hosts File
    Check if Google is blocked in hosts file:

    ```powershell
    notepad C:\Windows\System32\drivers\etc\hosts
    ```

    **Remove any lines containing:**
    - `googleapis.com`
    - `google.com`

    Save and restart.

    ---

    ## 📋 Diagnostic Checklist

    Run through this checklist:

    - [ ] Backend restarted with new DNS fixes
    - [ ] See new "DNS Configuration" and "Proxy Settings" messages
    - [ ] `ping www.googleapis.com` works
    - [ ] `nslookup www.googleapis.com` works
    - [ ] `Test-NetConnection www.googleapis.com -Port 443` succeeds
    - [ ] No VPN active
    - [ ] Windows Firewall allows Node.js
    - [ ] No proxy enabled in Windows
    - [ ] Hosts file doesn't block Google
    - [ ] Google Console has correct redirect URIs

    ---

    ## 🎉 Success Indicators

    **Backend logs should show:**
    ```
    🌐 DNS Configuration: IPv4 priority (fixing Windows DNS issues)
    🔓 Proxy Settings: Disabled (direct connection)
    ✅ Database connected successfully
    ```

    **When you test Google login:**
    ```
    GET /api/auth/google 302 2.225 ms - 0
    ✅ Updated existing user. Custom picture: true Using: /uploads/profiles/...
    GET /api/auth/google/callback?code=... 302 ... ms - ...
    ```

    **NO MORE `ENOTFOUND` errors!** ✅

    ---

    ## 💡 Understanding the Problem

    **What happened:**
    1. You click "Sign in with Google" in browser
    2. Browser redirects to Google (this works because browser uses Windows DNS)
    3. Google redirects back with authorization code
    4. Backend tries to contact `www.googleapis.com` to exchange code for token
    5. **Node.js uses its own DNS resolver** (not Windows DNS)
    6. Node.js DNS resolver fails because of proxy/IPv6 configuration
    7. Error: `ENOTFOUND www.googleapis.com`

    **What we fixed:**
    - Forced Node.js to use IPv4 DNS (more reliable on Windows)
    - Cleared proxy environment variables
    - Direct connection to Google APIs
    - Windows network reset (if needed)

    ---

    ## 🆘 Last Resort

    If nothing works, check:

    **1. Corporate Network?**
    If you're on a corporate network, they might be blocking OAuth.

    **2. ISP Issues?**
    Try mobile hotspot to test if it's your ISP.

    **3. Temporary Workaround:**
    For development, you can use email/password login (which already works):
    - Email: `husseinibram555@gmail.com`
    - Password: (your password)

    You have **DUAL authentication** enabled, so both methods work once network is fixed!

    ---

    ## 📞 Need More Help?

    After trying all fixes above, if still failing:

    1. Restart backend server
    2. Try Google login
    3. Copy the EXACT error from backend terminal
    4. Run: `node diagnose-google-oauth.js`
    5. Send both outputs

    ---

    ## ✅ Files Modified

    - `backend/src/index.ts` - Added DNS/proxy fixes
    - `backend/fix-windows-network.ps1` - Network fix script
    - `backend/diagnose-google-oauth.js` - Diagnostic tool

    **Next Steps:**
    1. Restart backend server (to load DNS fixes)
    2. Test Google login
    3. If fails, run PowerShell fix script as admin
    4. Restart Windows
    5. Test again
