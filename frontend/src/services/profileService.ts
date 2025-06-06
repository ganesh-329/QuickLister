import api from './api';
import {
  UserProfile,
  UpdateProfileData
} from '../../../shared/types';

// Re-export types for backward compatibility
export type { UserProfile, UpdateProfileData };

// All interfaces are now imported from shared types

class ProfileService {
  // Get current user profile
  async getUserProfile(): Promise<UserProfile> {
    try {
      const response = await api.get('/profile');
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch profile');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('Get profile error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch profile'
      );
    }
  }

  // Update user profile
  async updateProfile(data: UpdateProfileData): Promise<UserProfile> {
    try {
      const response = await api.put('/profile', data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update profile');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to update profile'
      );
    }
  }

  // Upload avatar
  async uploadAvatar(file: File): Promise<{ avatar: string }> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await api.post('/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to upload avatar');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('Upload avatar error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to upload avatar'
      );
    }
  }
}

export default new ProfileService();
