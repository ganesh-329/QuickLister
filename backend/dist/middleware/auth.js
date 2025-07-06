import jwt from 'jsonwebtoken';
import { User } from '../models';
// Simple authentication middleware
export const authenticate = async (req, res, next) => {
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
        // Verify token
        const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key-for-development-only';
        const decoded = jwt.verify(token, jwtSecret);
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
        // Attach user to request
        req.user = {
            id: user._id.toString(),
            email: user.email,
            phone: user.phone,
        };
        next();
    }
    catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid token',
        });
    }
};
//# sourceMappingURL=auth.js.map