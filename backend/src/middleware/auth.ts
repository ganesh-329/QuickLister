import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { User } from '../models/index.js';
import { config } from '../config/env.js';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        phone: string;
        role: 'user' | 'admin';
        status: 'active' | 'disabled';
      };
    }
  }
}

// Simple authentication middleware
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'No token provided',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Invalid token format',
      });
      return;
    }

    // Verify token
    const jwtSecret = config.JWT_SECRET;
    
    const decoded = jwt.verify(token, jwtSecret) as unknown as { userId: string; type: string };

    if (decoded.type !== 'access') {
      res.status(401).json({
        success: false,
        message: 'Invalid token type',
      });
      return;
    }

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Check if user account is active
    if (user.status === 'disabled') {
      res.status(401).json({
        success: false,
        message: 'Account has been disabled',
      });
      return;
    }

    // Attach user to request
    req.user = {
      id: user._id.toString(),
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      status: user.status,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }
};

// Admin authentication middleware
export const authenticateAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // First run standard authentication
    await authenticate(req, res, () => {});

    // Check if user has admin role
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    res.status(403).json({
      success: false,
      message: 'Admin access denied',
    });
  }
};
