import api, { apiCall, setAuthToken } from './api';
import {
  User,
  LoginData,
  RegisterData,
  AuthResponse
} from '../../../shared/types';

// Re-export types for backward compatibility
export type { User, LoginData, RegisterData, AuthResponse };

// All interfaces are now imported from shared types

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

  // Refresh access token
  static async refreshToken(): Promise<AuthResponse> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiCall<AuthResponse>(
      () => api.post('/auth/refresh', { refreshToken })
    );
    
    // Update auth token
    setAuthToken(response.accessToken);
    
    // Update refresh token
    localStorage.setItem('refresh_token', response.refreshToken);
    
    return response;
  }

  // Logout user
  static async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    
    try {
      if (refreshToken) {
        await apiCall<void>(
          () => api.post('/auth/logout', { refreshToken })
        );
      }
    } catch (error) {
      console.warn('Logout error:', error);
    } finally {
      // Clear local storage regardless of API call success
      localStorage.removeItem('refresh_token');
      setAuthToken(null);
    }
  }

  // Get stored token
  static getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Simple JWT expiry check (assuming standard JWT structure)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
}

export default AuthService;
