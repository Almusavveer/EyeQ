import { createContext, useContext, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { setupNavigationGuard } from '../utils/navigationGuard';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, loading, error] = useAuthState(auth);

  // Handle authentication state changes and navigation security
  useEffect(() => {
    if (!loading) {
      // Setup navigation guard based on auth state
      const cleanup = setupNavigationGuard(user);
      
      // Return cleanup function
      return cleanup;
    }
  }, [user, loading]);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
