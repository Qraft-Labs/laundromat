import { Router, Request, Response } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { authValidation as newAuthValidation } from '../middleware/validation.middleware';
import { loginLimiter } from '../middleware/security.middleware';
import passport from '../config/passport';
import jwt, { SignOptions } from 'jsonwebtoken';
import { upload } from '../config/multer';

const router = Router();

// Public routes with validation (rate limiter temporarily disabled for development)
router.post('/register', newAuthValidation.register, authController.register as any);
router.post('/login', newAuthValidation.login, authController.login as any);
router.post('/forgot-password', newAuthValidation.forgotPassword, authController.forgotPassword as any);

// Protected routes
router.get('/me', authenticate as any, authController.getMe as any);
router.put('/profile', authenticate as any, authController.updateProfile as any);
router.post('/profile-picture', authenticate as any, upload.single('profilePicture'), authController.uploadProfilePicture as any);
router.post('/session-timeout', authenticate as any, authController.updateSessionTimeout as any);
router.post('/change-password', authenticate as any, authController.changePassword as any);

// Google OAuth routes
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed`,
    session: false
  }),
  (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      
      if (!user) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_user`);
      }

      // Check if account is pending approval
      if (user.status === 'PENDING') {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=account_pending`);
      }

      // Check if account is suspended
      if (user.status === 'SUSPENDED') {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=account_suspended`);
      }

      // Check if account is not active
      if (user.status !== 'ACTIVE') {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=account_inactive`);
      }

      // Generate JWT token (MUST match fields expected by auth middleware)
      const token = jwt.sign(
        { 
          id: user.id,  // Changed from userId to id to match auth middleware
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          profile_picture: user.profile_picture
        },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      // Redirect to frontend with token
      res.redirect(`${process.env.FRONTEND_URL}/auth/google/success?token=${token}`);
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=token_generation_failed`);
    }
  }
);

export default router;
