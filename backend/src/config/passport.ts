import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { query } from './database';

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0]);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const googleId = profile.id;
        const fullName = profile.displayName;
        const profilePicture = profile.photos?.[0]?.value; // Google profile picture

        console.log('🔍 Google OAuth Profile Data:', {
          email,
          googleId,
          fullName,
          profilePicture: profilePicture || 'NO PHOTO',
          hasPhotos: !!profile.photos,
          photosLength: profile.photos?.length
        });

        if (!email) {
          return done(null, false, { message: 'No email found in Google profile' });
        }

        // Check if email is authorized (Google OAuth is ADMIN-ONLY)
        const authorizedEmails = process.env.AUTHORIZED_ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
        if (!authorizedEmails.includes(email)) {
          return done(null, false, { message: 'Email not authorized for admin access' });
        }

        // Check if user already exists
        const existingUser = await query(
          'SELECT * FROM users WHERE email = $1 OR google_id = $2',
          [email, googleId]
        );

        if (existingUser.rows.length > 0) {
          // Update Google ID and role, but ONLY update profile_picture if user hasn't uploaded a custom one
          const user = existingUser.rows[0];
          
          // Check if user has a custom uploaded picture (starts with /uploads/)
          const hasCustomPicture = user.profile_picture && user.profile_picture.startsWith('/uploads/');
          
          // Only use Google photo if user doesn't have a custom picture
          const pictureToUse = hasCustomPicture ? user.profile_picture : (profilePicture || null);
          
          // Preserve DUAL auth if user has added a password, otherwise set to GOOGLE
          const authProvider = (user.auth_provider === 'DUAL' || (user.password && user.auth_provider === 'GOOGLE')) 
            ? 'DUAL' 
            : 'GOOGLE';
          
          // Update user and fetch complete data with timestamps
          const updatedUser = await query(
            `UPDATE users SET google_id = $1, auth_provider = $2, role = $3, profile_picture = $4, last_login = NOW(), updated_at = CURRENT_TIMESTAMP 
             WHERE id = $5
             RETURNING id, email, full_name, phone, role, status, profile_picture, 
                       auth_provider, google_id, created_at, updated_at, last_login`,
            [googleId, authProvider, 'ADMIN', pictureToUse, user.id]
          );
          
          console.log('✅ Updated existing user. Custom picture:', hasCustomPicture, 'Using:', pictureToUse);
          return done(null, updatedUser.rows[0]);
        }

        // Create new ADMIN user (Google OAuth = ADMIN only, CASHIER uses email/password)
        const newUser = await query(
          `INSERT INTO users (full_name, email, role, status, auth_provider, google_id, profile_picture, created_at, updated_at)
           VALUES ($1, $2, 'ADMIN', 'ACTIVE', 'GOOGLE', $3, $4, NOW(), NOW())
           RETURNING *`,
          [fullName, email, googleId, profilePicture]
        );

        return done(null, newUser.rows[0]);
      } catch (error) {
        console.error('Google OAuth error:', error);
        return done(error as Error, false);
      }
    }
  )
);

export default passport;
