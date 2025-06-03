import { Request, Response } from 'express';
import User from '../models/User.js';
import { z } from 'zod';

// Profile update validation schema
const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().regex(/^[+]?[1-9]?[0-9]{7,15}$/).optional().or(z.literal('')),
  location: z.string().max(100).optional(),
  bio: z.string().max(500).optional()
});

// Get current user profile
export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        bio: user.bio,
        avatar: user.avatar,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
};

// Update user profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validationResult = updateProfileSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: validationResult.error.errors
      });
    }

    const { name, phone, location, bio } = validationResult.data;
    
    // Find user and update
    const user = await User.findById(req.user?.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update only provided fields
    if (name !== undefined) user.name = name;
    if (phone !== undefined) {
      user.set('phone', phone === '' ? undefined : phone);
    }
    if (location !== undefined) {
      user.set('location', location === '' ? undefined : location);
    }
    if (bio !== undefined) {
      user.set('bio', bio === '' ? undefined : bio);
    }

    // Save the updated user
    await user.save();

    // Return updated user data without password
    const updatedUser = await User.findById(user._id).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: updatedUser!._id,
        name: updatedUser!.name,
        email: updatedUser!.email,
        phone: updatedUser!.phone,
        location: updatedUser!.location,
        bio: updatedUser!.bio,
        avatar: updatedUser!.avatar,
        createdAt: updatedUser!.createdAt,
        updatedAt: updatedUser!.updatedAt
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    
    // Handle specific validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
};

// Update avatar (placeholder for future implementation)
export const updateAvatar = async (req: Request, res: Response) => {
  try {
    // This is a placeholder for file upload functionality
    // Will be implemented when we add file upload capabilities
    res.status(501).json({
      success: false,
      message: 'Avatar upload functionality not yet implemented'
    });
  } catch (error) {
    console.error('Update avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating avatar'
    });
  }
};
