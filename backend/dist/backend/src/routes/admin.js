import { Router } from 'express';
import { authenticateAdmin } from '../middleware/auth.js';
import { adminLogin, getDashboardStats, getUsers, updateUserStatus, deleteUser, getGigs, updateGigStatus, deleteGig } from '../controllers/admin.js';
const router = Router();
// Public admin routes (no authentication required)
router.post('/login', adminLogin);
// Protected admin routes (authentication required)
router.use(authenticateAdmin);
// Dashboard routes
router.get('/dashboard/stats', getDashboardStats);
// User management routes
router.get('/users', getUsers);
router.patch('/users/:userId/status', updateUserStatus);
router.delete('/users/:userId', deleteUser);
// Gig management routes
router.get('/gigs', getGigs);
router.patch('/gigs/:gigId/status', updateGigStatus);
router.delete('/gigs/:gigId', deleteGig);
export default router;
//# sourceMappingURL=admin.js.map