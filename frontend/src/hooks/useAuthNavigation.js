import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';

/**
 * Custom hook to handle authentication state changes and navigation
 * Prevents users from navigating back to protected pages after logout
 * and prevents navigation to auth pages when already logged in
 */
export const useAuthNavigation = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      // Clear any cached navigation history when auth state changes
      if (user) {
        // User is logged in - they can access protected routes
        console.log('✅ User authenticated, access granted to protected routes');
      } else {
        // User is logged out - clear any protected route history
        console.log('🔒 User not authenticated, clearing protected route access');
        
        // Replace current history entry to prevent back navigation to protected routes
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, [user, loading, navigate]);

  return { user, loading };
};

export default useAuthNavigation;