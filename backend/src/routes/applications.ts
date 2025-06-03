import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getApplicationById,
  updateApplication,
  deleteApplication,
  getApplicationsByGig,
  getApplicationsByUser
} from '../controllers/applicationController.js';

const router = express.Router();

// Protected routes (authentication required)
router.get('/:id', authenticate, getApplicationById);                // GET /api/applications/:id - Get application by ID
router.put('/:id', authenticate, updateApplication);                 // PUT /api/applications/:id - Update application
router.delete('/:id', authenticate, deleteApplication);              // DELETE /api/applications/:id - Delete application

// Get applications by gig or user
router.get('/gig/:gigId', authenticate, getApplicationsByGig);      // GET /api/applications/gig/:gigId - Get all applications for a gig
router.get('/user', authenticate, getApplicationsByUser);           // GET /api/applications/user - Get all applications by the current user

export default router; 