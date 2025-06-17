// Base user interface that works for both frontend and backend
export interface BaseUser {
  _id: string; // Always string for consistency
  name: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  avatar?: string;
  role?: 'user' | 'admin';
  status?: 'active' | 'disabled';
}

// Backend user interface (will be extended with Document in backend)
export interface IUserData {
  _id: any; // ObjectId for backend
  name: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  avatar?: string;
  password: string;
  role: 'user' | 'admin';
  status: 'active' | 'disabled';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Frontend user interface (for API responses)
export interface User extends BaseUser {
  id: string; // Frontend uses 'id' instead of '_id'
  createdAt: string; // Frontend receives dates as strings
  updatedAt?: string;
}

// Profile-specific interfaces
export interface UserProfile extends BaseUser {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  location?: string;
  bio?: string;
}

// Auth-related interfaces
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

// Admin-specific interfaces
export interface AdminUser extends User {
  role: 'admin';
}

export interface AdminStats {
  totalUsers: number;
  totalGigs: number;
  totalApplications: number;
  recentActivity: RecentActivity[];
}

export interface RecentActivity {
  _id: string;
  type: 'user_registered' | 'gig_posted' | 'application_submitted';
  description: string;
  timestamp: string;
  userId?: string;
  userName?: string;
}

export interface AdminUsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} 