import axios, { AxiosInstance, AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    api.defaults.headers.authorization = `Bearer ${token}`;
    localStorage.setItem('access_token', token);
  } else {
    delete api.defaults.headers.authorization;
    localStorage.removeItem('access_token');
  }
};

// Initialize token from localStorage
const savedToken = localStorage.getItem('access_token');
if (savedToken) {
  setAuthToken(savedToken);
}

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    if (authToken) {
      config.headers.authorization = `Bearer ${authToken}`;
    }
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error);
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      setAuthToken(null);
      // Redirect to login or trigger auth context update
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('❌ Network Error - Server might be down');
    }
    
    return Promise.reject(error);
  }
);

// Generic API response type
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Generic API error type
export interface ApiError {
  // message: string;
  status?: number;
  code?: string;
}

// Helper function to handle API errors
export const handleApiError = (error: any): ApiError => {
  if (error.response) {
    // Server responded with error status
    return {
      status: error.response.status,
      code: error.response.data?.code,
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
    //  message: 'Network error - Please check your connection',
      status: 0,
    };
  } else {
    // Something else happened
    return {
     // message: error.message || 'An unexpected error occurred',
    };
  }
};

// Helper function for making API calls with error handling
export const apiCall = async <T>(
  apiFunction: () => Promise<AxiosResponse<ApiResponse<T>>>
): Promise<T> => {
  try {
    const response = await apiFunction();
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'API call failed');
    }
    
    return response.data.data as T;
  } catch (error) {
    const apiError = handleApiError(error);
    throw new Error(apiError.code);
  }
};

export default api;
