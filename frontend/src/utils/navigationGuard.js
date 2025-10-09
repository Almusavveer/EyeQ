/**
 * Navigation Guard Utility
 * Prevents unauthorized access through browser navigation (back/forward buttons)
 */

// Add event listener to handle browser navigation events
export const setupNavigationGuard = (user) => {
  const handlePopState = (event) => {
    const currentPath = window.location.pathname;
    const protectedPaths = ['/home', '/exambuilder', '/students', '/review', '/results'];
    const authPaths = ['/login', '/register'];
    
    if (!user && protectedPaths.some(path => currentPath.includes(path))) {
      // User not logged in but trying to access protected route
      console.log('🔒 Unauthorized access attempt via browser navigation');
      window.history.replaceState(null, '', '/login');
      window.location.replace('/login');
    } else if (user && authPaths.includes(currentPath)) {
      // User logged in but trying to access auth pages
      console.log('✅ Redirecting authenticated user away from auth pages');
      window.history.replaceState(null, '', '/home');
      window.location.replace('/home');
    }
  };

  // Remove existing listener if any
  window.removeEventListener('popstate', handlePopState);
  
  // Add new listener
  window.addEventListener('popstate', handlePopState);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('popstate', handlePopState);
  };
};

// Clear navigation history to prevent unauthorized back navigation
export const clearNavigationHistory = () => {
  // Replace the current history entry
  window.history.replaceState(null, '', window.location.pathname);
  
  // Clear forward navigation
  const currentState = window.history.state;
  window.history.pushState(currentState, '', window.location.pathname);
};