import { Request, Response } from 'express';
import User from '../models/User.js';
import { z } from 'zod';

// Helper function to generate initials from name
const generateInitials = (name: string): string => {
  if (!name) return 'U';
  
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0]?.charAt(0).toUpperCase() || 'U';
  }
  
  // Take first letter of first and last word
  const firstInitial = words[0]?.charAt(0).toUpperCase() || 'U';
  const lastInitial = words[words.length - 1]?.charAt(0).toUpperCase() || 'U';
  return firstInitial + lastInitial;
};

// Helper function to get random color from palette
const getRandomColor = (): string => {
  const colors = [
    '#4F46E5', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', 
    '#06B6D4', '#EC4899', '#84CC16', '#6B7280'
  ] as const;
  return colors[Math.floor(Math.random() * colors.length)] as string;
};

// Profile update validation schema
const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().regex(/^[+]?[1-9]?[0-9]{7,15}$/).optional().or(z.literal('')),
  location: z.string().max(100).optional(),
  bio: z.string().max(500).optional()
});

// Get current user profile
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Parse avatar data if it exists
    let avatarData = null;
    if (user.avatar) {
      try {
        avatarData = JSON.parse(user.avatar);
      } catch (error) {
        // If parsing fails, generate default initials avatar
        avatarData = {
          type: 'initials',
          value: generateInitials(user.name),
          bg: getRandomColor(),
          color: '#FFFFFF'
        };
      }
    } else {
      // Generate default initials avatar if no avatar exists
      avatarData = {
        type: 'initials',
        value: generateInitials(user.name),
        bg: getRandomColor(),
        color: '#FFFFFF'
      };
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
        avatar: avatarData,
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
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const validationResult = updateProfileSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: validationResult.error.errors
      });
      return;
    }

    const { name, phone, location, bio } = validationResult.data;
    
    // Find user and update
    const user = await User.findById(req.user?.id);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
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
      res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
};

// Update avatar - Complete implementation with initials, job icons, and emoji options
export const updateAvatar = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { type, value, bg, color } = req.body;

    // Validate avatar data
    if (!type || !value) {
      res.status(400).json({
        success: false,
        message: 'Avatar type and value are required'
      });
      return;
    }

    // Validate avatar type
    const validTypes = ['initials', 'category', 'emoji'];
    if (!validTypes.includes(type)) {
      res.status(400).json({
        success: false,
        message: 'Invalid avatar type. Must be: initials, category, or emoji'
      });
      return;
    }

    // Predefined color palette
    const validColors = [
      '#4F46E5', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', 
      '#06B6D4', '#EC4899', '#84CC16', '#6B7280'
    ];

    // Validate colors
    const backgroundColor = bg && validColors.includes(bg) ? bg : '#4F46E5';
    const textColor = color && ['#FFFFFF', '#000000'].includes(color) ? color : '#FFFFFF';

    // Validate value based on type
    if (type === 'initials') {
      if (!value || value.length < 1 || value.length > 3) {
        res.status(400).json({
          success: false,
          message: 'Initials must be 1-3 characters long'
        });
        return;
      }
    } else if (type === 'category') {
      const validCategories = [
        '🔧', '🍳', '🚚', '💻', '🧹', '🎨', '📚', '🚗', '⚡', '🔨'
      ];
      if (!validCategories.includes(value)) {
        res.status(400).json({
          success: false,
          message: 'Invalid job category icon'
        });
        return;
      }
    } else if (type === 'emoji') {
      const validEmojis = [
        '😊', '😎', '🤝', '💪', '⭐', '🎯', '💼', '🔥', '✨', '🚀'
      ];
      if (!validEmojis.includes(value)) {
        res.status(400).json({
          success: false,
          message: 'Invalid emoji option'
        });
        return;
      }
    }

    // Create avatar data object
    const avatarData = {
      type,
      value: value.toUpperCase(), // Ensure initials are uppercase
      bg: backgroundColor,
      color: textColor
    };

    // Find user and update avatar
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Store avatar as JSON string
    user.avatar = JSON.stringify(avatarData);
    await user.save();

    res.json({
      success: true,
      message: 'Avatar updated successfully',
      data: {
        avatar: avatarData
      }
    });
  } catch (error) {
    console.error('Update avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating avatar'
    });
  }
};

// Get avatar suggestions for user
export const getAvatarSuggestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const user = await User.findById(userId).select('name');
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const initials = generateInitials(user.name);
    const colors = [
      { name: 'Blue', value: '#4F46E5' },
      { name: 'Red', value: '#EF4444' },
      { name: 'Green', value: '#10B981' },
      { name: 'Yellow', value: '#F59E0B' },
      { name: 'Purple', value: '#8B5CF6' },
      { name: 'Cyan', value: '#06B6D4' },
      { name: 'Pink', value: '#EC4899' },
      { name: 'Lime', value: '#84CC16' },
      { name: 'Gray', value: '#6B7280' }
    ];

    // Job/profession related emojis
    const jobEmojis = [
      '👨‍💼', '👩‍💼', '👨‍💻', '👩‍💻', '👨‍🔧', '👩‍🔧',
      '👨‍🎨', '👩‍🎨', '👨‍🏫', '👩‍🏫', '👨‍⚕️', '👩‍⚕️',
      '👨‍🚀', '👩‍🚀', '👨‍🔬', '👩‍🔬', '🧑‍💼', '🧑‍💻',
      '🧑‍🔧', '🧑‍🎨', '🧑‍🏫', '🧑‍⚕️', '🧑‍🚀', '🧑‍🔬'
    ];

    // Generate suggestions
    const suggestions = {
      initials: colors.map(color => ({
        type: 'initials',
        value: initials,
        bg: color.value,
        color: '#FFFFFF',
        label: `${initials} on ${color.name}`,
        description: `Your initials on ${getColorName(color.value)} background`
      })),
      emojis: jobEmojis.map(emoji => ({
        type: 'emoji',
        value: emoji,
        bg: '#F3F4F6',
        color: '#1F2937',
        label: `${emoji} Emoji`,
        description: `Use ${emoji} as your avatar`
      }))
    };

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('Get avatar suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching avatar suggestions'
    });
  }
};

// Delete user account
export const deleteAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    // Find the user first
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Import models for cleanup (using dynamic imports to avoid circular dependencies)
    const { Gig } = await import('../models/index.js');
    const { Chat } = await import('../models/index.js');
    const { Message } = await import('../models/index.js');

    // Clean up related data
    // 1. Delete all gigs created by the user
    await Gig.deleteMany({ postedBy: userId });

    // 2. Remove user from applications in other gigs
    await Gig.updateMany(
      { 'applications.user': userId },
      { $pull: { applications: { user: userId } } }
    );

    // 3. Delete all chats where the user is a participant
    const userChats = await Chat.find({ participants: userId });
    const chatIds = userChats.map(chat => chat._id);
    
    // Delete all messages in those chats
    await Message.deleteMany({ chat: { $in: chatIds } });
    
    // Delete the chats
    await Chat.deleteMany({ participants: userId });

    // 4. Finally delete the user account
    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: 'Account and all related data deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting account'
    });
  }
};

// Helper function to get color name
const getColorName = (color: string): string => {
  const colorNames: { [key: string]: string } = {
    '#4F46E5': 'Indigo',
    '#EF4444': 'Red',
    '#10B981': 'Emerald',
    '#F59E0B': 'Amber',
    '#8B5CF6': 'Violet',
    '#06B6D4': 'Cyan',
    '#EC4899': 'Pink',
    '#84CC16': 'Lime',
    '#6B7280': 'Gray'
  };
  return colorNames[color] || 'Blue';
};
