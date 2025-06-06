import { Router } from 'express';
import { getProfile, updateProfile, updateAvatar, getAvatarSuggestions } from '../controllers/profileController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All profile routes require authentication
router.use(authenticate);

// GET /api/profile - Get current user profile
router.get('/', getProfile);

// PUT /api/profile - Update user profile
router.put('/', updateProfile);

// POST /api/profile/avatar - Update profile avatar
router.post('/avatar', updateAvatar);

// GET /api/profile/avatar/suggestions - Get avatar suggestions
router.get('/avatar/suggestions', getAvatarSuggestions);

export default router;
