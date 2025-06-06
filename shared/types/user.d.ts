import { Document } from 'mongoose';
export interface BaseUser {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    location?: string;
    bio?: string;
    avatar?: string;
}
export interface IUser extends Document {
    _id: any;
    name: string;
    email: string;
    phone?: string;
    location?: string;
    bio?: string;
    avatar?: string;
    password: string;
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
//# sourceMappingURL=user.d.ts.map