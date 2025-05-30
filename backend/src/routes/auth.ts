import { Router } from 'express';
import { 
  register, 
  login, 
  logout, 
  refreshToken, 
  requestOTP, 
  verifyPhone, 
  getProfile 
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Public routes (no authentication required)
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.post('/request-otp', requestOTP);
router.post('/verify-phone', verifyPhone);

// Protected routes (authentication required)
router.get('/profile', requireAuth, getProfile);

export default router;
