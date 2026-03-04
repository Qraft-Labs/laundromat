# Google OAuth Sign-In Implementation Guide

        ## Overview
        Implement Google OAuth 2.0 authentication for Administrator accounts, allowing secure sign-in without passwords. Desktop agents (cashiers) will be created by admins with temporary passwords.

        ---

        ## Architecture

        ### User Types & Authentication:

        1. **ADMIN** 🔐
        - Signs in with **Google OAuth** (Gmail account)
        - No password stored in database
        - Email must be authorized (whitelist)
        - Can manage all desktop agents

        2. **CASHIER/DESKTOP AGENT** 👤
        - Created by Admin through User Management page
        - Assigned **temporary password** on creation
        - **Must change password** on first login
        - Regular email/password authentication

    ### Environment Support:

    ✅ **Local Development** (Your PC)
    - Works with `http://localhost:5000`
    - Test Google OAuth before deployment
    - Use `.env` with localhost callback URL

    ✅ **Production** (Deployed Server)
    - Works with `https://yourdomain.com`
    - Use `.env.production` with production callback URL
    - Google Cloud Console supports BOTH URLs simultaneously

    ---

    ## Quick Start (Local Development)

    **Want to test Google OAuth RIGHT NOW on localhost?**

    1. Get Google credentials (5 minutes)
    2. Add to `.env`: `GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback`
    3. Install packages: `npm install passport passport-google-oauth20 express-session`
    4. Copy passport config (provided below)
    5. Start servers: `npm run dev`
    6. Click "Sign in with Google" → Login with your Gmail
    7. **Done!** You're logged in as admin

    ---

    ## Implementation Steps

    ### Phase 1: Google OAuth Setup (Backend)

    #### 1.1 Install Required Packages

    ```bash
    cd backend
    npm install passport passport-google-oauth20 express-session
    npm install --save-dev @types/passport @types/passport-google-oauth20 @types/express-session
    ```

    #### 1.2 Get Google OAuth Credentials

    1. Go to [Google Cloud Console](https://console.cloud.google.com/)
    2. Create new project: "Lush Laundry ERP"
    3. Enable Google+ API
    4. Create OAuth 2.0 credentials:
    - Application type: Web application
    - Authorized redirect URIs (ADD BOTH):
        - **Development**: `http://localhost:5000/auth/google/callback`
        - **Production**: `https://yourdomain.com/auth/google/callback`
    5. Copy:
    - **Client ID**: `xxx.apps.googleusercontent.com`
    - **Client Secret**: `xxxxx`

    **Note**: Google allows multiple redirect URIs. Your `.env` file determines which one is active.

    #### 1.3 Update .env File

    **For Local Development** (`.env`):
    ```env
    # Google OAuth (LOCAL)
    GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
    GOOGLE_CLIENT_SECRET=your_client_secret_here
    GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
    SESSION_SECRET=your_random_session_secret_here_min_32_chars

    # Authorized Admin Emails (comma-separated)
    AUTHORIZED_ADMIN_EMAILS=hussein@yourdomain.com,businessowner@gmail.com

    # Frontend URL (for redirects)
    FRONTEND_URL=http://localhost:3000
    ```

    **For Production** (`.env.production` or update `.env` on server):
    ```env
    # Google OAuth (PRODUCTION)
    GOOGLE_CLIENT_ID=same_client_id_as_local.apps.googleusercontent.com
    GOOGLE_CLIENT_SECRET=same_client_secret_as_local
    GOOGLE_CALLBACK_URL=https://yourdomain.com/auth/google/callback
    SESSION_SECRET=same_or_different_secret_32_chars_min

    # Authorized Admin Emails
    AUTHORIZED_ADMIN_EMAILS=hussein@yourdomain.com,businessowner@gmail.com

    # Frontend URL (for redirects)
    FRONTEND_URL=https://yourdomain.com
    ```

    **Key Points**:
    - Same Client ID & Secret for both environments
    - Different callback URLs
    - Google Cloud Console has both URLs registered
            },
            async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value;
                
                if (!email) {
                return done(null, false, { message: 'No email found in Google profile' });
                }

                // Check if email is authorized for admin access
                const authorizedEmails = process.env.AUTHORIZED_ADMIN_EMAILS?.split(',') || [];
                
                if (!authorizedEmails.includes(email)) {
                return done(null, false, { message: 'Email not authorized for admin access' });
                }

                // Check if user exists
                let userResult = await query(
                'SELECT * FROM users WHERE email = $1',
                [email]
                );

                let user;

                if (userResult.rows.length === 0) {
                // Create new admin user
                const insertResult = await query(
                    `INSERT INTO users (email, full_name, role, status, auth_provider, google_id, created_at, updated_at)
                    VALUES ($1, $2, 'ADMIN', 'ACTIVE', 'GOOGLE', $3, NOW(), NOW())
                    RETURNING *`,
                    [email, profile.displayName || email.split('@')[0], profile.id]
                );
                user = insertResult.rows[0];
                } else {
                // Update existing user with Google ID if not set
                if (!userResult.rows[0].google_id) {
                    await query(
                    'UPDATE users SET google_id = $1, auth_provider = $2, updated_at = NOW() WHERE id = $3',
                    [profile.id, 'GOOGLE', userResult.rows[0].id]
                    );
                }
                
                // Update last login
                await query(
                    'UPDATE users SET last_login = NOW() WHERE id = $1',
                    [userResult.rows[0].id]
                );
                
                user = userResult.rows[0];
                }

                // Check if user is ADMIN
                if (user.role !== 'ADMIN') {
                return done(null, false, { message: 'Only admins can use Google sign-in' });
                }

                return done(null, user);
            } catch (error) {
                return done(error);
            }
            }
        )
        );

        passport.serializeUser((user: any, done) => {
        done(null, user.id);
        });

        passport.deserializeUser(async (id: number, done) => {
        try {
            const result = await query('SELECT * FROM users WHERE id = $1', [id]);
            done(null, result.rows[0]);
        } catch (error) {
            done(error);
        }
        });

        export default passport;
        ```

        #### 1.5 Create Auth Routes

        **File:** `backend/src/routes/google-auth.routes.ts`

        ```typescript
        import { Router } from 'express';
        import passport from '../config/passport';
        import jwt from 'jsonwebtoken';

        const router = Router();

        // Initiate Google OAuth
        router.get('/google',
        passport.authenticate('google', { 
            scope: ['profile', 'email'],
            session: false 
        })
        );

        // Google OAuth callback
        router.get('/google/callback',
        passport.authenticate('google', { 
            failureRedirect: '/login?error=google_auth_failed',
            session: false 
        }),
        (req, res) => {
            const user = req.user as any;
            
            // Generate JWT token
            const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email, 
                role: user.role 
            },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
            );

            // Redirect to frontend with token
            res.redirect(`http://localhost:5173/auth/google/success?token=${token}`);
        }
        );

        export default router;
        ```

        #### 1.6 Update Database Schema

        ```sql
        -- Add new columns to users table
        ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(20) DEFAULT 'LOCAL';
        ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);
        ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT FALSE;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS temp_password_expires_at TIMESTAMP;

        -- Update existing users
        UPDATE users SET auth_provider = 'LOCAL' WHERE auth_provider IS NULL;

        -- Create index for faster lookups
        CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
        CREATE INDEX IF NOT EXISTS idx_users_auth_provider ON users(auth_provider);
        ```

        #### 1.7 Update server.ts

        ```typescript
        import express from 'express';
        import session from 'express-session';
        import passport from './config/passport';
        import googleAuthRoutes from './routes/google-auth.routes';

        const app = express();

        // Session configuration (required for passport)
        app.use(session({
        secret: process.env.SESSION_SECRET!,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }
        }));

        // Initialize Passport
        app.use(passport.initialize());
        app.use(passport.session());

        // Google OAuth routes
        app.use('/auth', googleAuthRoutes);

        // ... rest of your server setup
        ```

        ---

        ### Phase 2: Frontend Implementation

        #### 2.1 Create Google Sign-In Button

        **File:** `frontend/src/pages/Login.tsx`

        ```tsx
        import { Button } from '@/components/ui/button';
        import { FcGoogle } from 'react-icons/fc';

        const Login = () => {
        const handleGoogleSignIn = () => {
            // Redirect to backend Google OAuth endpoint
            window.location.href = 'http://localhost:5000/auth/google';
        };

        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <Card className="w-full max-w-md p-8">
                <CardHeader>
                <CardTitle className="text-2xl text-center">
                    🧺 Lush Laundry ERP
                </CardTitle>
                <CardDescription className="text-center">
                    Sign in to continue
                </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                {/* Google Sign-In for Admins */}
                <div>
                    <Button
                    variant="outline"
                    className="w-full h-12 text-base"
                    onClick={handleGoogleSignIn}
                    >
                    <FcGoogle className="mr-2 h-5 w-5" />
                    Sign in with Google (Admin)
                    </Button>
                    <p className="text-xs text-muted-foreground text-center mt-2">
                    For administrators only
                    </p>
                </div>

                {/* Divider */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        Or continue with email
                    </span>
                    </div>
                </div>

                {/* Regular Email/Password Login for Cashiers */}
                <form onSubmit={handleEmailLogin}>
                    <div className="space-y-4">
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                        id="email"
                        type="email"
                        placeholder="cashier@lushlaundry.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        />
                    </div>
                    <div>
                        <Label htmlFor="password">Password</Label>
                        <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        />
                    </div>
                    <Button type="submit" className="w-full">
                        Sign in
                    </Button>
                    </div>
                </form>
                </CardContent>
            </Card>
            </div>
        );
        };
        ```

        #### 2.2 Handle Google OAuth Callback

        **File:** `frontend/src/pages/GoogleAuthCallback.tsx`

        ```tsx
        import { useEffect } from 'react';
        import { useNavigate, useSearchParams } from 'react-router-dom';
        import { useAuth } from '@/contexts/AuthContext';

        const GoogleAuthCallback = () => {
        const [searchParams] = useSearchParams();
        const navigate = useNavigate();
        const { login } = useAuth();

        useEffect(() => {
            const token = searchParams.get('token');
            
            if (token) {
            // Save token and redirect to dashboard
            login(token);
            navigate('/dashboard');
            } else {
            // Failed authentication
            navigate('/login?error=authentication_failed');
            }
        }, [searchParams, navigate, login]);

        return (
            <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Completing sign-in...</p>
            </div>
            </div>
        );
        };

        export default GoogleAuthCallback;
        ```

        #### 2.3 Add Route

        **File:** `frontend/src/App.tsx`

        ```tsx
        import GoogleAuthCallback from './pages/GoogleAuthCallback';

        <Route path="/auth/google/success" element={<GoogleAuthCallback />} />
        ```

        ---

        ### Phase 3: Desktop Agent Management

        #### 3.1 Update User Creation (Admin Creates Cashiers)

        **File:** `backend/src/controllers/userManagement.controller.ts`

        ```typescript
        // Generate random temporary password
        function generateTempPassword(): string {
        return Math.random().toString(36).slice(-8).toUpperCase();
        }

        export const createUser = async (req: AuthRequest, res: Response) => {
        const { email, full_name, phone, role } = req.body;
        
        // Generate temporary password
        const tempPassword = generateTempPassword();
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        
        // Set expiration to 7 days from now
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        
        const result = await query(
            `INSERT INTO users (email, password, full_name, phone, role, status, 
                                auth_provider, must_change_password, temp_password_expires_at)
            VALUES ($1, $2, $3, $4, $5, 'ACTIVE', 'LOCAL', TRUE, $6)
            RETURNING id, email, full_name, role`,
            [email, hashedPassword, full_name, phone, role, expiresAt]
        );
        
        // TODO: Send email with temporary password
        
        res.status(201).json({
            message: 'User created successfully',
            user: result.rows[0],
            temporaryPassword: tempPassword // Return in response for admin to share
        });
        };
        ```

        #### 3.2 Force Password Change on First Login

        **File:** `backend/src/controllers/auth.controller.ts`

        ```typescript
        export const login = async (req: Request, res: Response) => {
        const { email, password } = req.body;
        
        const userResult = await query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        
        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const user = userResult.rows[0];
        
        // Check if temp password expired
        if (user.must_change_password && user.temp_password_expires_at) {
            if (new Date() > new Date(user.temp_password_expires_at)) {
            return res.status(401).json({ 
                error: 'Temporary password expired. Contact admin for new password.' 
            });
            }
        }
        
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        );
        
        res.json({
            token,
            user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role
            },
            mustChangePassword: user.must_change_password // Flag for frontend
        });
        };

        // New endpoint: Change password
        export const changePassword = async (req: AuthRequest, res: Response) => {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user!.id;
        
        // Verify current password
        const userResult = await query('SELECT * FROM users WHERE id = $1', [userId]);
        const user = userResult.rows[0];
        
        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            return res.status(400).json({ error: 'Current password incorrect' });
        }
        
        // Update password and clear temp flags
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        await query(
            `UPDATE users 
            SET password = $1, 
                must_change_password = FALSE, 
                temp_password_expires_at = NULL,
                updated_at = NOW()
            WHERE id = $2`,
            [hashedPassword, userId]
        );
        
        res.json({ message: 'Password changed successfully' });
        };
        ```

        ---

    ## Troubleshooting

    ### Issue: "Redirect URI Mismatch" Error

    **Cause**: Google callback URL in code doesn't match Google Cloud Console

    **Solution**:
    1. Check `.env` file: `GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback`
    2. Open [Google Cloud Console](https://console.cloud.google.com/)
    3. Go to: Credentials → OAuth 2.0 Client IDs → Your app
    4. Verify **Authorized redirect URIs** contains exact URL from `.env`
    5. If not, click **Edit** → Add URI → Save
    6. Restart backend: `npm run dev`

    ### Issue: Works locally but not in production

    **Cause**: Different callback URLs for local vs production

    **Solution**:
    1. Add BOTH URLs to Google Cloud Console:
    - `http://localhost:5000/auth/google/callback`
    - `https://yourdomain.com/auth/google/callback`
    2. Update production `.env`:
    ```env
    GOOGLE_CALLBACK_URL=https://yourdomain.com/auth/google/callback
    FRONTEND_URL=https://yourdomain.com
    ```
    3. Restart production server: `pm2 restart lush-laundry-api`

    ### Issue: "Email not authorized"

    **Cause**: Gmail not in whitelist

    **Solution**:
    ```env
    # Add your Gmail to whitelist
    AUTHORIZED_ADMIN_EMAILS=youremail@gmail.com,anotheradmin@gmail.com
    ```

    ### Environment Detection (Automatic)

    Your backend can auto-detect environment:

    ```typescript
    // backend/src/server.ts
    const GOOGLE_CALLBACK_URL = process.env.NODE_ENV === 'production'
    ? 'https://yourdomain.com/auth/google/callback'
    : 'http://localhost:5000/auth/google/callback';

    const FRONTEND_URL = process.env.NODE_ENV === 'production'
    ? 'https://yourdomain.com'
    : 'http://localhost:3000';
    ```

    Then run:
    - **Local**: `npm run dev` (uses localhost URLs)
    - **Production**: `NODE_ENV=production npm start` (uses production URLs)

    ---

    ## Summary

    ### ✅ **Local Development (RIGHT NOW)**
    - Use `http://localhost:5000/auth/google/callback`
    - Add your Gmail to `AUTHORIZED_ADMIN_EMAILS`
    - Test Google login before deployment
    - Same Client ID/Secret as production

    ### ✅ **Production Deployment**
    - Use `https://yourdomain.com/auth/google/callback`
    - Same Gmail whitelist works
    - Google automatically detects which URL to use
    - No code changes needed - just `.env` update
        - Run `clear_test_data.sql` before deployment
        - All test orders, customers, payments deleted
        - ID sequences reset to 1
        - Price items and inventory preserved
        - No foreign key issues - completely safe

        ### 🔐 **Authentication Flow**

        **Admins:**
        1. Click "Sign in with Google"
        2. Google OAuth popup
        3. Authorize with Gmail
        4. Auto-created as ADMIN if email in whitelist
        5. Redirected to dashboard

        **Desktop Agents (Cashiers):**
        1. Admin creates user in User Management
        2. System generates temporary password (e.g., "AB12CD34")
        3. Admin shares password with cashier
        4. Cashier logs in with email + temp password
        5. **Forced to change password** on first login
        6. Password expires in 7 days if not changed

        ### 📋 **Next Steps**

        1. **Install packages** (Phase 1.1)
        2. **Get Google OAuth credentials** (Phase 1.2)
        3. **Run database migration** (Phase 1.6)
        4. **Implement backend** (Phase 1.3-1.7)
        5. **Update frontend** (Phase 2)
        6. **Test locally** with authorized email
        7. **Deploy** with production Google OAuth callback URL

        Would you like me to implement any specific part of this first?
