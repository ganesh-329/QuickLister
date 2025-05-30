import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, VerificationLog } from '../models/index.js';
import { config } from '../config/env.js';
import { 
  validateData, 
  registerSchema, 
  loginSchema, 
  phoneVerificationSchema,
  otpRequestSchema 
} from '../utils/validation.js';
import { 
  generateOTP, 
  storeOTP, 
  verifyOTP, 
  sendOTP, 
  canSendSMS 
} from '../utils/sms.js';

// Generate JWT tokens with proper types
const generateTokens = (userId: string): { accessToken: string; refreshToken: string } => {
  // Use environment variables directly to avoid type issues
  const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';
  
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    jwtSecret,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    jwtRefreshSecret,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// User Registration
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate input data
    const validation = validateData(registerSchema, req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
      });
      return;
    }

    const userData = validation.data!;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: userData.email },
        { phone: userData.phone }
      ]
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: existingUser.email === userData.email 
          ? 'Email already registered' 
          : 'Phone number already registered',
      });
      return;
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    // Create user with the actual User model structure
    const user = new User({
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      password: hashedPassword,
      dateOfBirth: userData.dateOfBirth,
      gender: userData.gender,
      location: userData.location || {
        type: 'Point',
        coordinates: [0, 0], // Default coordinates, user can update later
      },
      skills: userData.skills || [],
      // Set verification status
      isPhoneVerified: false,
      isEmailVerified: false,
      isIdentityVerified: false,
    });

    await user.save();

    // Log registration
    await VerificationLog.create({
      userId: user._id,
      type: 'registration',
      status: 'completed',
      details: {
        registrationMethod: 'email_phone',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      },
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id.toString());

    // Return user data (excluding sensitive information)
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      profileCompletion: user.profileCompletionPercentage,
    };

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: userResponse,
        accessToken,
        refreshToken,
      },
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: config.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// User Login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate input data
    const validation = validateData(loginSchema, req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
      });
      return;
    }

    const { email, password, rememberMe } = validation.data!;

    // Find user by email and include password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    // Check if account is active
    if (user.accountStatus !== 'active') {
      res.status(403).json({
        success: false,
        message: 'Account is suspended. Please contact support.',
      });
      return;
    }

    // Verify password - check if password field exists
    if (!user.password) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Log failed login attempt
      await VerificationLog.create({
        userId: user._id,
        type: 'login',
        status: 'failed',
        details: {
          reason: 'invalid_password',
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
        },
      });

      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id.toString());

    // Update last login
    user.lastActiveAt = new Date();
    await user.save();

    // Log successful login
    await VerificationLog.create({
      userId: user._id,
      type: 'login',
      status: 'completed',
      details: {
        rememberMe,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      },
    });

    // Return user data
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      profileCompletion: user.profileCompletionPercentage,
    };

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        accessToken,
        refreshToken,
      },
    });

  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: config.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// User Logout
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
      error: config.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Refresh Token
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(401).json({
        success: false,
        message: 'Refresh token required',
      });
      return;
    }

    // Verify refresh token
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';
    const decoded = jwt.verify(refreshToken, jwtRefreshSecret) as any;
    
    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
      return;
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id.toString());

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    });

  } catch (error: any) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Token refresh failed',
      error: config.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Request OTP for phone verification
export const requestOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate input
    const validation = validateData(otpRequestSchema, req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
      });
      return;
    }

    const { phone } = validation.data!;

    // Check rate limiting
    const rateLimitCheck = canSendSMS(phone);
    if (!rateLimitCheck.canSend) {
      res.status(429).json({
        success: false,
        message: rateLimitCheck.message,
        retryAfter: rateLimitCheck.retryAfter,
      });
      return;
    }

    // Generate and store OTP
    const otp = generateOTP();
    storeOTP(phone, otp);

    // Send OTP via SMS
    const smsResult = await sendOTP(phone, otp);
    
    if (!smsResult.success) {
      res.status(500).json({
        success: false,
        message: smsResult.message,
      });
      return;
    }

    // Log OTP request
    const user = await User.findOne({ phone });
    if (user) {
      await VerificationLog.create({
        userId: user._id,
        type: 'phone_verification',
        status: 'pending',
        details: {
          action: 'otp_requested',
          messageId: smsResult.messageId,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
        },
      });
    }

    res.json({
      success: true,
      message: 'OTP sent successfully',
      data: {
        expiresIn: 300, // 5 minutes
        messageId: smsResult.messageId,
      },
    });

  } catch (error: any) {
    console.error('OTP request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP',
      error: config.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Verify phone with OTP
export const verifyPhone = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate input
    const validation = validateData(phoneVerificationSchema, req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
      });
      return;
    }

    const { phone, otp } = validation.data!;

    // Verify OTP
    const otpResult = verifyOTP(phone, otp);
    
    if (!otpResult.success) {
      res.status(400).json({
        success: false,
        message: otpResult.message,
        attemptsLeft: otpResult.attemptsLeft,
      });
      return;
    }

    // Find and update user
    const user = await User.findOne({ phone });
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Update phone verification status
    user.isPhoneVerified = true;
    user.verificationDate = new Date();
    await user.save();

    // Log successful verification
    await VerificationLog.create({
      userId: user._id,
      type: 'phone_verification',
      status: 'completed',
      details: {
        action: 'otp_verified',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      },
    });

    res.json({
      success: true,
      message: 'Phone number verified successfully',
      data: {
        isPhoneVerified: true,
        profileCompletion: user.profileCompletionPercentage,
      },
    });

  } catch (error: any) {
    console.error('Phone verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Phone verification failed',
      error: config.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get current user profile
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    // User is already attached by auth middleware
    const user = (req as any).user;

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      bio: user.bio,
      location: user.location,
      skills: user.skills,
      availability: user.availability,
      notificationSettings: user.notificationSettings,
      privacySettings: user.privacySettings,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      isIdentityVerified: user.isIdentityVerified,
      profileCompletion: user.profileCompletionPercentage,
      trustScore: user.calculateTrustScore(),
      createdAt: user.createdAt,
      lastActiveAt: user.lastActiveAt,
    };

    res.json({
      success: true,
      data: { user: userResponse },
    });

  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: config.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
