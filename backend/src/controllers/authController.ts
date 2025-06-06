import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { config } from '../config/env.js';
import { validateData, registerSchema, loginSchema } from '../utils/validation.js';

// Generate JWT tokens
const generateTokens = (userId: string): { accessToken: string; refreshToken: string } => {
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    config.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    config.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// User Registration - SIMPLE
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, password } = req.body;

    // Basic validation
    if (!name || !email || !phone || !password) {
      res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { phone }] 
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: existingUser.email === email ? 'Email already registered' : 'Phone number already registered',
      });
      return;
    }

    // Create user (password will be hashed automatically by pre-save hook)
    const user = new User({
      name,
      email,
      phone,
      password
    });

    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id.toString());

    // Return user data (excluding password)
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          createdAt: user.createdAt,
        },
        accessToken,
        refreshToken,
      },
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: config.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// User Login - SIMPLE
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
      return;
    }

    // Find user by email and include password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id.toString());

    // Return user data
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          createdAt: user.createdAt,
        },
        accessToken,
        refreshToken,
      },
    });

  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: config.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// User Logout - SIMPLE
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
    });
  }
};

// Refresh Token - SIMPLE
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
      return;
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET) as { userId: string; type: string };

    if (decoded.type !== 'refresh') {
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
      return;
    }

    // Generate new tokens
    const tokens = generateTokens(decoded.userId);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: tokens,
    });
  } catch (error: any) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
    });
  }
};

// Get User Profile - SIMPLE
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        }
      },
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
    });
  }
};
