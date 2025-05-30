import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { User, type IUser } from '../models';
import { config } from '../config/env';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        phone: string;
        isPhoneVerified: boolean;
        isIdentityVerified: boolean;
        trustScore: number;
        accountStatus: 'active' | 'suspended' | 'deactivated';
      };
      accessToken?: string;
    }
  }
}

// JWT payload interface
interface IJWTPayload {
  userId: string;
  email: string;
  phone: string;
  tokenType: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

// Token generation functions
export const generateTokens = (user: {
  _id: Types.ObjectId;
  email: string;
  phone: string;
}): { accessToken: string; refreshToken: string } => {
  const payload = {
    userId: user._id.toString(),
    email: user.email,
    phone: user.phone
  };

  // Access token (15 minutes)
  const accessToken = jwt.sign(
    { ...payload, tokenType: 'access' },
    config.JWT_SECRET,
    { expiresIn: '15m' }
  );

  // Refresh token (7 days)
  const refreshToken = jwt.sign(
    { ...payload, tokenType: 'refresh' },
    config.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// Verify JWT token
export const verifyToken = (token: string, type: 'access' | 'refresh' = 'access'): IJWTPayload => {
  const secret = type === 'access' ? config.JWT_SECRET : config.JWT_REFRESH_SECRET;
  
  try {
    const decoded = jwt.verify(token, secret) as IJWTPayload;
    
    if (decoded.tokenType !== type) {
      throw new Error(`Invalid token type. Expected ${type}, got ${decoded.tokenType}`);
    }
    
    return decoded;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    } else if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    } else if (error instanceof jwt.NotBeforeError) {
      throw new Error('Token not active');
    } else {
      throw error;
    }
  }
};

// Refresh token rotation
export const refreshTokens = async (refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
  user: Express.Request['user'];
}> => {
  try {
    const decoded = verifyToken(refreshToken, 'refresh');
    
    const user = await User.findById(decoded.userId).select(
      'email phone isPhoneVerified isIdentityVerified trustScore accountStatus'
    ) as IUser;
    
    if (!user) {
      throw new Error('User not found');
    }
    
    if (user.accountStatus !== 'active') {
      throw new Error('Account is not active');
    }
    
    const tokens = generateTokens({
      _id: user._id,
      email: user.email,
      phone: user.phone
    });
    
    return {
      ...tokens,
      user: {
        id: user._id.toString(),
        email: user.email,
        phone: user.phone,
        isPhoneVerified: user.isPhoneVerified,
        isIdentityVerified: user.isIdentityVerified,
        trustScore: user.trustScore,
        accountStatus: user.accountStatus
      }
    };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Token refresh failed');
  }
};

// Authentication middleware
export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Authorization token required',
        code: 'MISSING_TOKEN'
      });
      return;
    }
    
    const token = authHeader.substring(7);
    const decoded = verifyToken(token, 'access');
    
    const user = await User.findById(decoded.userId).select(
      'email phone isPhoneVerified isIdentityVerified trustScore accountStatus lastActiveAt'
    ) as IUser;
    
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
      return;
    }
    
    if (user.accountStatus !== 'active') {
      res.status(403).json({
        success: false,
        error: 'Account is not active',
        code: 'ACCOUNT_INACTIVE'
      });
      return;
    }
    
    await User.findByIdAndUpdate(user._id, { lastActiveAt: new Date() });
    
    req.user = {
      id: user._id.toString(),
      email: user.email,
      phone: user.phone,
      isPhoneVerified: user.isPhoneVerified,
      isIdentityVerified: user.isIdentityVerified,
      trustScore: user.trustScore,
      accountStatus: user.accountStatus
    };
    
    req.accessToken = token;
    
    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Token expired') {
        res.status(401).json({
          success: false,
          error: 'Token expired',
          code: 'TOKEN_EXPIRED'
        });
      } else if (error.message === 'Invalid token') {
        res.status(401).json({
          success: false,
          error: 'Invalid token',
          code: 'INVALID_TOKEN'
        });
      } else {
        res.status(401).json({
          success: false,
          error: 'Authentication failed',
          code: 'AUTH_FAILED'
        });
      }
    } else {
      res.status(500).json({
        success: false,
        error: 'Authentication error',
        code: 'AUTH_ERROR'
      });
    }
  }
};

// Optional authentication 
export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      next();
      return;
    }
    
    const token = authHeader.substring(7);
    const decoded = verifyToken(token, 'access');
    
    const user = await User.findById(decoded.userId).select(
      'email phone isPhoneVerified isIdentityVerified trustScore accountStatus'
    ) as IUser | null;
    
    if (user?.accountStatus === 'active') {
      req.user = {
        id: user._id.toString(),
        email: user.email,
        phone: user.phone,
        isPhoneVerified: user.isPhoneVerified,
        isIdentityVerified: user.isIdentityVerified,
        trustScore: user.trustScore,
        accountStatus: user.accountStatus
      };
      req.accessToken = token;
    }
    
    next();
  } catch (error) {
    next();
  }
};

// Verification requirement middlewares
export const requirePhoneVerified = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
    return;
  }
  
  if (!req.user.isPhoneVerified) {
    res.status(403).json({
      success: false,
      error: 'Phone verification required',
      code: 'PHONE_VERIFICATION_REQUIRED'
    });
    return;
  }
  
  next();
};

export const requireIdentityVerified = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
    return;
  }
  
  if (!req.user.isIdentityVerified) {
    res.status(403).json({
      success: false,
      error: 'Identity verification required',
      code: 'IDENTITY_VERIFICATION_REQUIRED'
    });
    return;
  }
  
  next();
};

// Trust score requirement
export const requireMinTrustScore = (minScore: number) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
      return;
    }
    
    if (req.user.trustScore < minScore) {
      res.status(403).json({
        success: false,
        error: `Minimum trust score of ${minScore} required`,
        code: 'INSUFFICIENT_TRUST_SCORE',
        data: {
          currentTrustScore: req.user.trustScore,
          requiredTrustScore: minScore
        }
      });
      return;
    }
    
    next();
  };
};

// Admin/role-based access
export const requireRole = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
      return;
    }
    
    const user = await User.findById(req.user.id).select('email') as IUser | null;
    
    if (!user?.email) {
      res.status(401).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
      return;
    }
    
    const isAdmin = user.email.endsWith('@mjob.admin') || roles.includes('user');
    
    if (!isAdmin) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
      return;
    }
    
    next();
  };
};

// Audit logging middleware
export const auditAuth = (action: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const originalSend = res.send;
    
    res.send = function(data) {
      console.log(`[AUTH AUDIT] ${action}:`, {
        userId: req.user?.id,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString(),
        success: res.statusCode < 400
      });
      
      return originalSend.call(this, data);
    };
    
    next();
  };
};

// Rate limiting
export const authRateLimit = (maxAttempts: number = 5, windowMinutes: number = 15) => {
  const attempts = new Map<string, { count: number; resetTime: number }>();
  
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip;
    const now = Date.now();
    const windowMs = windowMinutes * 60 * 1000;
    
    const userAttempts = attempts.get(key);
    
    if (!userAttempts || now > userAttempts.resetTime) {
      attempts.set(key, { count: 1, resetTime: now + windowMs });
      next();
      return;
    }
    
    if (userAttempts.count >= maxAttempts) {
      res.status(429).json({
        success: false,
        error: 'Too many authentication attempts',
        code: 'RATE_LIMIT_EXCEEDED',
        data: {
          retryAfter: Math.ceil((userAttempts.resetTime - now) / 1000)
        }
      });
      return;
    }
    
    userAttempts.count++;
    next();
  };
};

export default {
  generateTokens,
  verifyToken,
  refreshTokens,
  requireAuth,
  optionalAuth,
  requirePhoneVerified,
  requireIdentityVerified,
  requireMinTrustScore,
  requireRole,
  auditAuth,
  authRateLimit
};
