import { useState, useEffect } from 'react';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing authentication
    const checkAuth = () => {
      const sessionToken = sessionStorage.getItem('audiogram_session');
      const persistentToken = localStorage.getItem('audiogram_auth');
      
      // Require both session and persistent tokens for security
      if (sessionToken && persistentToken && sessionToken === persistentToken) {
        setIsAuthenticated(true);
      } else {
        // Clear any invalid tokens
        sessionStorage.removeItem('audiogram_session');
        localStorage.removeItem('audiogram_auth');
        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
    };

    checkAuth();

    // Listen for storage changes (e.g., logout in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'audiogram_auth' || e.key === 'audiogram_session') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = () => {
    setIsAuthenticated(true);
  };

  const logout = () => {
    sessionStorage.removeItem('audiogram_session');
    localStorage.removeItem('audiogram_auth');
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    logout
  };
}