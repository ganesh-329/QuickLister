import jwt from 'jsonwebtoken';
import { User, Gig } from '../models/index.js';
import { config } from '../config/env.js';
// Generate JWT tokens
const generateTokens = (userId) => {
    const accessToken = jwt.sign({ userId, type: 'access' }, config.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId, type: 'refresh' }, config.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
};
// Admin Login - Dedicated endpoint for admin authentication
export const adminLogin = async (req, res) => {
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
                message: 'Invalid admin credentials',
            });
            return;
        }
        // Check if user has admin role
        if (user.role !== 'admin') {
            res.status(403).json({
                success: false,
                message: 'Admin access required. You do not have administrator privileges.',
            });
            return;
        }
        // Check if admin account is active
        if (user.status !== 'active') {
            res.status(403).json({
                success: false,
                message: 'Admin account is disabled',
            });
            return;
        }
        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: 'Invalid admin credentials',
            });
            return;
        }
        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user._id.toString());
        // Return admin user data
        res.json({
            success: true,
            message: 'Admin login successful',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    status: user.status,
                    createdAt: user.createdAt,
                },
                accessToken,
                refreshToken,
            },
        });
    }
    catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            message: 'Admin login failed',
            error: config.NODE_ENV === 'development' ? error.message : 'Internal server error',
        });
    }
};
// Get admin dashboard stats
export const getDashboardStats = async (req, res) => {
    try {
        // Get basic counts - count all users except admins for totalUsers
        const [totalUsers, totalGigs, totalApplications] = await Promise.all([
            User.countDocuments({ role: { $ne: 'admin' } }),
            Gig.countDocuments(),
            Gig.aggregate([
                { $unwind: '$applications' },
                { $count: 'totalApplications' }
            ]).then(result => result[0]?.totalApplications || 0)
        ]);
        // Get recent activity
        const recentUsers = await User.find({ role: { $ne: 'admin' } })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name createdAt');
        const recentGigs = await Gig.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('posterId', 'name')
            .select('title createdAt posterId');
        const recentActivity = [
            ...recentUsers.map(user => ({
                _id: user._id.toString(),
                type: 'user_registered',
                description: `${user.name} joined the platform`,
                timestamp: user.createdAt.toISOString(),
                userId: user._id.toString(),
                userName: user.name
            })),
            ...recentGigs.map(gig => ({
                _id: gig._id.toString(),
                type: 'gig_posted',
                description: `New gig posted: ${gig.title}`,
                timestamp: gig.createdAt.toISOString(),
                userId: gig.posterId?._id?.toString(),
                userName: gig.posterId?.name
            }))
        ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 10);
        const stats = {
            totalUsers,
            totalGigs,
            totalApplications,
            recentActivity
        };
        res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard stats'
        });
    }
};
// Get all users with pagination
export const getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            User.find({ role: { $ne: 'admin' } })
                .select('-password')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            User.countDocuments({ role: { $ne: 'admin' } })
        ]);
        const formattedUsers = users.map(user => ({
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            status: user.status,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString()
        }));
        res.json({
            success: true,
            data: {
                users: formattedUsers,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users'
        });
    }
};
// Update user status (enable/disable)
export const updateUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { status } = req.body;
        if (!['active', 'disabled'].includes(status)) {
            res.status(400).json({
                success: false,
                message: 'Invalid status. Must be "active" or "disabled"'
            });
            return;
        }
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
        if (user.role === 'admin') {
            res.status(400).json({
                success: false,
                message: 'Cannot modify admin user status'
            });
            return;
        }
        user.status = status;
        await user.save();
        res.json({
            success: true,
            message: `User ${status === 'active' ? 'enabled' : 'disabled'} successfully`
        });
    }
    catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user status'
        });
    }
};
// Delete user
export const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
        if (user.role === 'admin') {
            res.status(400).json({
                success: false,
                message: 'Cannot delete admin user'
            });
            return;
        }
        // Also delete user's gigs
        await Gig.deleteMany({ posterId: userId });
        // Remove user from gig applications
        await Gig.updateMany({ 'applications.applicantId': userId }, { $pull: { applications: { applicantId: userId } } });
        await User.findByIdAndDelete(userId);
        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete user'
        });
    }
};
// Get all gigs with pagination
export const getGigs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const [gigs, total] = await Promise.all([
            Gig.find()
                .populate('posterId', 'name email')
                .select('title category payment.rate payment.paymentType status createdAt posterId applications')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Gig.countDocuments()
        ]);
        const formattedGigs = gigs.map(gig => ({
            _id: gig._id.toString(),
            title: gig.title,
            category: gig.category,
            status: gig.status,
            payment: {
                rate: gig.payment.rate,
                paymentType: gig.payment.paymentType
            },
            createdAt: gig.createdAt.toISOString(),
            applicationCount: gig.applications?.length || 0,
            posterName: gig.posterId?.name || 'Deleted User'
        }));
        res.json({
            success: true,
            data: {
                gigs: formattedGigs,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        console.error('Get gigs error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch gigs'
        });
    }
};
// Update gig status
export const updateGigStatus = async (req, res) => {
    try {
        const { gigId } = req.params;
        const { status } = req.body;
        const validStatuses = ['draft', 'posted', 'active', 'assigned', 'in_progress', 'completed', 'cancelled', 'expired'];
        if (!validStatuses.includes(status)) {
            res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
            return;
        }
        const gig = await Gig.findById(gigId);
        if (!gig) {
            res.status(404).json({
                success: false,
                message: 'Gig not found'
            });
            return;
        }
        gig.status = status;
        await gig.save();
        res.json({
            success: true,
            message: `Gig status updated to ${status}`
        });
    }
    catch (error) {
        console.error('Update gig status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update gig status'
        });
    }
};
// Delete gig
export const deleteGig = async (req, res) => {
    try {
        const { gigId } = req.params;
        const gig = await Gig.findByIdAndDelete(gigId);
        if (!gig) {
            res.status(404).json({
                success: false,
                message: 'Gig not found'
            });
            return;
        }
        res.json({
            success: true,
            message: 'Gig deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete gig error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete gig'
        });
    }
};
//# sourceMappingURL=admin.js.map