import api from './api';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  location?: string;
  bio?: string;
}

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
  async updateUserProfile(data: UpdateProfileData): Promise<UserProfile> {
    try {
      // Validate data locally first
      if (data.name !== undefined && data.name.trim().length < 2) {
        throw new Error('Name must be at least 2 characters long');
      }
      
      if (data.phone !== undefined && data.phone !== '' && !/^[+]?[1-9]?[0-9]{7,15}$/.test(data.phone)) {
        throw new Error('Please enter a valid phone number');
      }
      
      if (data.location !== undefined && data.location.length > 100) {
        throw new Error('Location cannot exceed 100 characters');
      }
      
      if (data.bio !== undefined && data.bio.length > 500) {
        throw new Error('Bio cannot exceed 500 characters');
      }

      const response = await api.put('/profile', data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update profile');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('Update profile error:', error);
      
      // Handle validation errors from server
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors
          .map((err: any) => err.message)
          .join(', ');
        throw new Error(validationErrors);
      }
      
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to update profile'
      );
    }
  }

  // Upload profile avatar (placeholder for future implementation)
  async uploadAvatar(file: File): Promise<string> {
    try {
      // This will be implemented when we add file upload capabilities
      throw new Error('Avatar upload functionality not yet implemented');
    } catch (error: any) {
      console.error('Upload avatar error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to upload avatar'
      );
    }
  }

  // Validate profile data before submission
  validateProfileData(data: UpdateProfileData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (data.name !== undefined) {
      if (data.name.trim().length < 2) {
        errors.push('Name must be at least 2 characters long');
      }
      if (data.name.length > 100) {
        errors.push('Name cannot exceed 100 characters');
      }
    }

    if (data.phone !== undefined && data.phone !== '') {
      if (!/^[+]?[1-9]?[0-9]{7,15}$/.test(data.phone)) {
        errors.push('Please enter a valid phone number');
      }
    }

    if (data.location !== undefined && data.location.length > 100) {
      errors.push('Location cannot exceed 100 characters');
    }

    if (data.bio !== undefined && data.bio.length > 500) {
      errors.push('Bio cannot exceed 500 characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const profileService = new ProfileService();
export default profileService;
