# Session Timeout System Guide

    ## Overview
    Professional session timeout system with configurable duration and warning modals for enhanced security.

    ## Features

    ### 1. **Configurable Timeout Duration**
    - Administrators can set session timeout: 5, 10, 15, 20, 25, or 30 minutes
    - Default: 15 minutes of inactivity
    - Maximum: 30 minutes for security compliance
    - Configurable in Settings > Security section

    ### 2. **Two-Stage Timeout Process**

    #### Stage 1: Warning (60 seconds before expiration)
    - Professional modal with countdown timer
    - Yellow clock icon for visual warning
    - "Stay Logged In" button to reset timer
    - Real-time countdown display

    #### Stage 2: Expiration
    - Professional modal with security explanation
    - Red lock icon for security emphasis
    - Explains automatic logout for protection
    - "Go to Login" button for user action
    - Auto-redirect after 3 seconds

    ### 3. **Activity Tracking**
    System resets timer on these events:
    - Mouse clicks (`mousedown`)
    - Keyboard inputs (`keydown`)
    - Scrolling (`scroll`)
    - Touch events (`touchstart`)
    - Button clicks (`click`)

    ### 4. **Security Benefits**
    - Prevents unauthorized access to unattended devices
    - Protects sensitive business data
    - Compliance with security best practices
    - User-friendly implementation

    ## How It Works

    ```typescript
    // 1. User logs in → Timer starts (15 minutes default)

    // 2. User activity → Timer resets
    //    - Click, type, scroll, or touch

    // 3. No activity for (timeout - 60s) → Warning modal appears
    //    - Shows countdown: 60, 59, 58...
    //    - User can click "Stay Logged In"
    //    - Or ignore and session expires at 0

    // 4. If ignored → Expiration modal appears
    //    - Shows security message
    //    - Auto-logout after 3 seconds
    //    - Redirects to login page
    ```

    ## Configuration

    ### For Administrators

    1. Navigate to **Settings** → **Security**
    2. Scroll to **Session Timeout** section
    3. Select desired timeout duration from dropdown:
    - 5 minutes (shortest)
    - 10 minutes
    - 15 minutes (default)
    - 20 minutes
    - 25 minutes
    - 30 minutes (maximum)
    4. Click **Apply** button
    5. System will reload to apply new timeout
    6. Toast notification confirms change

    ### For Cashiers

    Cashiers use the timeout duration set by administrators. They cannot change this setting (security policy).

    ## User Experience Flow

    ### Scenario 1: Active User
    ```
    User logs in → Works continuously → Timer keeps resetting → No timeout occurs
    ```

    ### Scenario 2: Warning Heeded
    ```
    User logs in → Becomes inactive → Warning appears (60s) → 
    User clicks "Stay Logged In" → Timer resets → Continues working
    ```

    ### Scenario 3: Session Expires
    ```
    User logs in → Becomes inactive → Warning appears (60s) → 
    User doesn't respond → Expiration modal → Auto-logout → Login page
    ```

    ## Technical Implementation

    ### Components

    #### 1. **SessionTimeoutModal.tsx**
    ```tsx
    Props:
    - isOpen: boolean (modal visibility)
    - onClose: () => void (close handler)
    - onStayLoggedIn: () => void (reset timer)
    - remainingSeconds: number (countdown value)

    Features:
    - Real-time countdown (60 → 0)
    - Auto-closes at 0
    - Professional design
    ```

    #### 2. **SessionExpiredModal.tsx**
    ```tsx
    Props:
    - isOpen: boolean (modal visibility)
    - onLogin: () => void (navigate to login)

    Features:
    - Security explanation
    - Professional messaging
    - Clear call-to-action
    ```

    #### 3. **AuthContext.tsx** (Enhanced)
    ```tsx
    New Constants:
    - DEFAULT_INACTIVITY_TIMEOUT: 15 * 60 * 1000 (15 minutes)
    - WARNING_TIME: 60 * 1000 (60 seconds)
    - SESSION_TIMEOUT_KEY: 'lush_session_timeout'

    New State:
    - showTimeoutWarning: boolean
    - showExpiredModal: boolean
    - warningSeconds: number
    - warningTimer: React.MutableRefObject<NodeJS.Timeout | null>

    New Functions:
    - getSessionTimeout(): number (get user preference)
    - handleStayLoggedIn(): void (reset timers)
    - handleExpiredLogin(): void (navigate to login)
    ```

    #### 4. **Settings.tsx** (Updated)
    ```tsx
    New State:
    - sessionTimeout: number (minutes)

    New Function:
    - saveSessionTimeout(): void (save to localStorage)

    New UI Section:
    - Session Timeout configuration
    - Dropdown for duration selection
    - Apply button
    - Help text explaining how it works
    ```

    ### Storage

    ```typescript
    // LocalStorage Key
    const SESSION_TIMEOUT_KEY = 'lush_session_timeout';

    // Value Format
    // Store as milliseconds: minutes * 60 * 1000
    // Example: 15 minutes = 900000 milliseconds

    // Retrieve
    const timeout = localStorage.getItem(SESSION_TIMEOUT_KEY);
    const timeoutMs = timeout ? parseInt(timeout) : 900000; // Default 15 min
    ```

    ## Testing

    ### Test Cases

    #### 1. Default Timeout (15 minutes)
    1. Log in without changing settings
    2. Wait 14 minutes → No warning
    3. Wait 15 minutes → Warning appears
    4. Verify countdown works (60, 59, 58...)
    5. Click "Stay Logged In" → Warning disappears
    6. Verify can continue working

    #### 2. Custom Timeout (5 minutes)
    1. Go to Settings > Security
    2. Change timeout to 5 minutes
    3. Click Apply
    4. Log in again
    5. Wait 4 minutes → No warning
    6. Wait 5 minutes → Warning appears
    7. Ignore warning → Expiration modal after 60s
    8. Verify auto-logout after 3s

    #### 3. Maximum Timeout (30 minutes)
    1. Set timeout to 30 minutes
    2. Verify warning appears at 29 minutes
    3. Verify expiration at 30 minutes

    #### 4. Activity Tracking
    1. Log in
    2. Wait until near timeout
    3. Click somewhere on page
    4. Verify timer resets
    5. Test with: typing, scrolling, touching

    #### 5. Multiple Users
    1. Admin sets 10-minute timeout
    2. Cashier logs in
    3. Verify cashier gets 10-minute timeout
    4. Verify cashier cannot change setting

    ## Troubleshooting

    ### Issue: Timer not resetting on activity

    **Solution:**
    - Check browser console for errors
    - Verify event listeners attached
    - Refresh page to reinitialize

    ### Issue: Warning not appearing

    **Solution:**
    - Check localStorage for SESSION_TIMEOUT_KEY
    - Verify value is valid number
    - Clear localStorage and try again

    ### Issue: Session expires too quickly

    **Solution:**
    - Check configured timeout in Settings
    - Verify localStorage value: `localStorage.getItem('lush_session_timeout')`
    - Should be in milliseconds (15 min = 900000)

    ### Issue: Modal doesn't close

    **Solution:**
    - Refresh page
    - Clear browser cache
    - Check for JavaScript errors

    ## Security Considerations

    ### Best Practices

    1. **Default to Secure**: 15-minute default is reasonable
    2. **Maximum Limit**: 30 minutes maximum for security
    3. **User Education**: Modals explain why timeout exists
    4. **Activity Tracking**: Prevents frustrating unnecessary logouts
    5. **Warning Period**: 60 seconds gives time to respond

    ### Recommendations

    - **Admin Accounts**: Use shorter timeouts (10-15 minutes)
    - **Cashier Accounts**: Can use longer if needed (20-25 minutes)
    - **Shared Devices**: Always use shorter timeouts (5-10 minutes)
    - **Private Offices**: Can use maximum (30 minutes)

    ## Maintenance

    ### Future Enhancements

    1. **Per-Role Timeouts**: Different timeouts for admins vs cashiers
    2. **Remember Me**: Option for extended sessions (7 days)
    3. **Idle Detection**: More sophisticated activity detection
    4. **Session History**: Log of session expirations
    5. **Email Notifications**: Alert on forced logout
    6. **Audit Trail**: Track who changed timeout settings

    ### Updating Timeout Options

    To add new timeout options, edit:

    ```tsx
    // frontend/src/pages/Settings.tsx
    <SelectContent>
    <SelectItem value="5">5 minutes</SelectItem>
    <SelectItem value="10">10 minutes</SelectItem>
    <SelectItem value="15">15 minutes (Default)</SelectItem>
    <SelectItem value="20">20 minutes</SelectItem>
    <SelectItem value="25">25 minutes</SelectItem>
    <SelectItem value="30">30 minutes (Maximum)</SelectItem>
    {/* Add new options here */}
    </SelectContent>
    ```

    ## API Integration (Future)

    If backend session management is needed:

    ```typescript
    // backend/src/routes/settings.routes.ts
    router.put('/session-timeout', async (req, res) => {
    const { userId, timeout } = req.body;
    // Save to database
    await query(
        'UPDATE users SET session_timeout = $1 WHERE id = $2',
        [timeout, userId]
    );
    res.json({ success: true });
    });

    router.get('/session-timeout/:userId', async (req, res) => {
    const { userId } = req.params;
    const result = await query(
        'SELECT session_timeout FROM users WHERE id = $1',
        [userId]
    );
    res.json({ timeout: result.rows[0].session_timeout });
    });
    ```

    ## Summary

    The session timeout system provides:
    - ✅ Configurable duration (5-30 minutes)
    - ✅ Professional warning modals
    - ✅ Automatic activity tracking
    - ✅ User-friendly experience
    - ✅ Enhanced security
    - ✅ Clear documentation
    - ✅ Easy testing
    - ✅ Future-proof design

    Perfect for protecting your Lush Laundry ERP from unauthorized access while maintaining a professional user experience!
