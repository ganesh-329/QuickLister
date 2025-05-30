import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';

// Define types for authentication state
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  profileImage?: string;
  isPhoneVerified: boolean;
  isIdentityVerified: boolean;
  trustScore: number;
  accountStatus: 'active' | 'suspended' | 'deactivated';
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  logout: () => void;
  verifyOTP: (otp: string) => Promise<void>;
  refreshAuth: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

interface SignupData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  verifyOTP: async () => {},
  refreshAuth: async () => {},
  isLoading: false,
  error: null,
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
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle API errors
  const handleError = (error: any) => {
    const message = error.response?.data?.error || error.message || 'An error occurred';
    setError(message);
    setTimeout(() => setError(null), 5000); // Clear error after 5 seconds
  };

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);

      setAuthState({
        isAuthenticated: true,
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
    } catch (error: any) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Signup function
  const signup = useCallback(async (userData: SignupData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Signup failed');
      }

      const data = await response.json();
      
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);

      setAuthState({
        isAuthenticated: true,
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
    } catch (error: any) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setAuthState({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
    });
  }, []);

  // OTP verification
  const verifyOTP = useCallback(async (otp: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.accessToken}`,
        },
        body: JSON.stringify({ otp }),
      });

      if (!response.ok) {
        throw new Error('OTP verification failed');
      }

      const data = await response.json();
      setAuthState(prev => ({
        ...prev,
        user: {
          ...prev.user!,
          isPhoneVerified: true,
        },
      }));
    } catch (error: any) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [authState.accessToken]);

  // Token refresh function
  const refreshAuth = useCallback(async () => {
    try {
      if (!authState.refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: authState.refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);

      setAuthState(prev => ({
        ...prev,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user,
      }));
    } catch (error: any) {
      handleError(error);
      logout(); // Logout on refresh failure
    }
  }, [authState.refreshToken, logout]);

  // Auto refresh token before expiry
  useEffect(() => {
    if (authState.accessToken) {
      const refreshInterval = setInterval(() => {
        refreshAuth();
      }, 14 * 60 * 1000); // Refresh every 14 minutes (token expires in 15)

      return () => clearInterval(refreshInterval);
    }
  }, [authState.accessToken, refreshAuth]);

  // Error notification portal
  const ErrorNotification = error ? createPortal(
    <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg">
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
      }}
    >
      {children}
      {ErrorNotification}
    </AuthContext.Provider>
  );
};

export default AuthContext;
