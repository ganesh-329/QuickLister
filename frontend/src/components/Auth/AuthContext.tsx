import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import AuthService, { User, RegisterData } from '../../services/authService';

// Export User interface from AuthService
export type { User } from '../../services/authService';
export type { RegisterData as SignupData } from '../../services/authService';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  verifyOTP: (otp: string) => Promise<void>;
  refreshAuth: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  verifyOTP: async () => {},
  refreshAuth: async () => {},
  isLoading: false,
  error: null,
  isInitialized: false,
});

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State management
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    accessToken: AuthService.getToken(),
    refreshToken: localStorage.getItem('refresh_token'),
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle API errors
  const handleError = (error: any) => {
    const message = error.message || 'An error occurred';
    setError(message);
    setTimeout(() => setError(null), 5000); // Clear error after 5 seconds
  };

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await AuthService.login({ email, password });
      
      localStorage.setItem('user', JSON.stringify(response.user));

      setAuthState({
        isAuthenticated: true,
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
    } catch (error: any) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Signup function
  const signup = useCallback(async (userData: RegisterData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await AuthService.register(userData);
      
      localStorage.setItem('user', JSON.stringify(response.user));

      setAuthState({
        isAuthenticated: true,
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
    } catch (error: any) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.warn('Logout API call failed, but continuing with local cleanup');
    } finally {
      localStorage.removeItem('user');
      setAuthState({
        isAuthenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null,
      });
    }
  }, []);

  // OTP verification (simplified - no longer functional)
  const verifyOTP = useCallback(async (_otp: string) => {
    // OTP verification removed - just return success
    console.log('OTP verification disabled');
  }, []);

  // Token refresh function
  const refreshAuth = useCallback(async () => {
    try {
      const response = await AuthService.refreshToken();
      
      setAuthState(prev => ({
        ...prev,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      }));

    } catch (error: any) {
      handleError(error);
      await logout(); // Logout on refresh failure
    }
  }, [logout]);

  // Initialize auth state from localStorage on app load
  useEffect(() => {
    const initializeAuth = () => {
      const storedAccessToken = AuthService.getToken();
      const storedRefreshToken = localStorage.getItem('refresh_token');
      const storedUser = localStorage.getItem('user');
      let user = null;
      if (storedUser) {
        try {
          user = JSON.parse(storedUser);
        } catch {
          user = null;
        }
      }
      // Check if we have valid authentication data
      if (storedAccessToken && user) {
        setAuthState({
          isAuthenticated: true,
          user: user,
          accessToken: storedAccessToken,
          refreshToken: storedRefreshToken,
        });
      } else {
        // Clear any partial auth state
        setAuthState({
          isAuthenticated: false,
          user: null,
          accessToken: null,
          refreshToken: null,
        });
      }
      setIsInitialized(true);
    };
    initializeAuth();
  }, []);

  // Auto refresh token before expiry
  useEffect(() => {
    if (authState.accessToken && isInitialized) {
      const refreshInterval = setInterval(() => {
        refreshAuth();
      }, 14 * 60 * 1000); // Refresh every 14 minutes (token expires in 15)

      return () => clearInterval(refreshInterval);
    }
  }, [authState.accessToken, refreshAuth, isInitialized]);

  // Listen for auth:logout events from API interceptor
  useEffect(() => {
    const handleAuthLogout = () => {
      logout();
    };

    window.addEventListener('auth:logout', handleAuthLogout);
    return () => window.removeEventListener('auth:logout', handleAuthLogout);
  }, [logout]);

  // Error notification portal
  const ErrorNotification = error ? createPortal(
    <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50">
      {error}
    </div>,
    document.body
  ) : null;

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        signup,
        logout,
        verifyOTP,
        refreshAuth,
        isLoading,
        error,
        isInitialized,
      }}
    >
      {children}
      {ErrorNotification}
    </AuthContext.Provider>
  );
};

export { AuthContext };
export default AuthProvider;
