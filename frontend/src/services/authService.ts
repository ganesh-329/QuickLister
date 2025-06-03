import api, { apiCall, setAuthToken } from './api';

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Authentication Service
export class AuthService {
  // Login user
  static async login(data: LoginData): Promise<AuthResponse> {
    const response = await apiCall<AuthResponse>(
      () => api.post('/auth/login', data)
    );
    
    // Set auth token for future requests
    setAuthToken(response.accessToken);
    
    // Store refresh token
    localStorage.setItem('refresh_token', response.refreshToken);
    
    return response;
  }

  // Register user
  static async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiCall<AuthResponse>(
      () => api.post('/auth/register', data)
    );
    
    // Set auth token for future requests
    setAuthToken(response.accessToken);
    
    // Store refresh token
    localStorage.setItem('refresh_token', response.refreshToken);
    
    return response;
  }

  // Get current user profile
  static async getProfile(): Promise<{ user: User }> {
    return await apiCall<{ user: User }>(
      () => api.get('/auth/me')
    );
  }

  // Refresh token
  static async refreshToken(): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiCall<{ accessToken: string; refreshToken: string }>(
      () => api.post('/auth/refresh', { refreshToken })
    );
    
    // Update tokens
    setAuthToken(response.accessToken);
    localStorage.setItem('refresh_token', response.refreshToken);
    
    return response;
  }

  // Logout user
  static async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.warn('Logout API call failed, but continuing with local cleanup');
    } finally {
      // Clear tokens regardless of API call success
      setAuthToken(null);
      localStorage.removeItem('refresh_token');
    }
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token');
    return !!token;
  }

  // Get stored token
  static getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  // Clear all auth data
  static clearAuthData(): void {
    setAuthToken(null);
    localStorage.removeItem('refresh_token');
  }
}

export default AuthService;
