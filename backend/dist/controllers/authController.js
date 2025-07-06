import jwt from 'jsonwebtoken';
import { User } from '../models/index';
import { config } from '../config/env';
// Generate JWT tokens
const generateTokens = (userId) => {
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';
    const accessToken = jwt.sign({ userId, type: 'access' }, jwtSecret, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId, type: 'refresh' }, jwtRefreshSecret, { expiresIn: '7d' });
    return { accessToken, refreshToken };
};
// User Registration - SIMPLE
export const register = async (req, res) => {
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
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: config.NODE_ENV === 'development' ? error.message : 'Internal server error',
        });
    }
};
// User Login - SIMPLE
export const login = async (req, res) => {
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
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: config.NODE_ENV === 'development' ? error.message : 'Internal server error',
        });
    }
};
// User Logout - SIMPLE
export const logout = async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Logout successful',
        });
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Logout failed',
        });
    }
};
// Refresh Token - SIMPLE
export const refreshToken = async (req, res) => {
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
        const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET);
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
    }
    catch (error) {
        console.error('Token refresh error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid refresh token',
        });
    }
};
// Get User Profile - SIMPLE
export const getProfile = async (req, res) => {
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
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get profile',
        });
    }
};
//# sourceMappingURL=authController.js.map