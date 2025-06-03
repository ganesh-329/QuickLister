import express from 'express';
import {
  createGig,
  getGigs,

  getGigById,
  updateGig,
  deleteGig,
  applyToGig,
  acceptApplication,
  getUserPostedGigs,
  getUserApplications
} from '../controllers/gigController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/', getGigs);                     // GET /api/gigs - Get all gigs with filters

router.get('/:id', getGigById);               // GET /api/gigs/:id - Get gig by ID

// Protected routes (authentication required)
router.post('/', authenticate, createGig);                           // POST /api/gigs - Create a new gig
router.put('/:id', authenticate, updateGig);                         // PUT /api/gigs/:id - Update gig
router.delete('/:id', authenticate, deleteGig);                      // DELETE /api/gigs/:id - Delete gig

// Application routes
router.post('/:id/apply', authenticate, applyToGig);                 // POST /api/gigs/:id/apply - Apply to a gig
router.put('/:gigId/applications/:applicationId/accept', authenticate, acceptApplication); // PUT /api/gigs/:gigId/applications/:applicationId/accept - Accept application

// User-specific routes
router.get('/user/posted', authenticate, getUserPostedGigs);         // GET /api/gigs/user/posted - Get user's posted gigs
router.get('/user/applications', authenticate, getUserApplications); // GET /api/gigs/user/applications - Get user's applications

export default router;
