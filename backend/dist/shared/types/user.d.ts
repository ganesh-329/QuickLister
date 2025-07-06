export interface BaseUser {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    location?: string;
    bio?: string;
    avatar?: string;
    role?: 'user' | 'admin';
    status?: 'active' | 'disabled';
}
export interface IUserData {
    _id: any;
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
export interface User extends BaseUser {
    id: string;
    createdAt: string;
    updatedAt?: string;
}
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
//# sourceMappingURL=user.d.ts.map