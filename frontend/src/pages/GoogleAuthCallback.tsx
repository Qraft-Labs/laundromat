import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function GoogleAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      // Handle error
      console.error('Google OAuth error:', error);
      navigate('/login?error=' + error);
      return;
    }

    if (token) {
      // Save token and user info (MUST match keys in AuthContext.tsx)
      localStorage.setItem('lush_token', token);
      
      // Decode token to get user info
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        const user = {
          id: payload.id,  // Changed from userId to id
          email: payload.email,
          full_name: payload.full_name || payload.email.split('@')[0], // Fallback to email prefix
          role: payload.role,
          profile_picture: payload.profile_picture,
          session_timeout_minutes: payload.session_timeout_minutes || 15, // Include session timeout from JWT
          status: 'ACTIVE' // Google OAuth users are always active
        };
        
        localStorage.setItem('lush_user', JSON.stringify(user));
        
        // Use navigate instead of window.location.href to avoid full page reload
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 500); // Small delay to ensure localStorage is written
      } catch (err) {
        console.error('Token decode error:', err);
        navigate('/login?error=invalid_token');
      }
    } else {
      navigate('/login?error=no_token');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Signing you in...</h2>
        <p className="text-muted-foreground">Please wait while we complete your Google sign-in</p>
      </div>
    </div>
  );
}
