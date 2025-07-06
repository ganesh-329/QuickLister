import express from 'express';
import { register, login, logout, refreshToken, getProfile } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
const router = express.Router();
// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
// Protected routes
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getProfile);
export default router;
//# sourceMappingURL=auth.js.map