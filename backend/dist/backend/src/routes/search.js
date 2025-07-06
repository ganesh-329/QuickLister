import express from 'express';
import { searchGigs, searchUsers, getSearchSuggestions, getPopularSearches, saveSearchAnalytics } from '../controllers/searchController.js';
import { authenticate } from '../middleware/auth.js';
const router = express.Router();
// Public search routes
router.get('/gigs', searchGigs); // GET /api/search/gigs - Search gigs with filters
router.get('/users', searchUsers); // GET /api/search/users - Search users/freelancers
router.get('/suggestions', getSearchSuggestions); // GET /api/search/suggestions - Get search suggestions
router.get('/popular', getPopularSearches); // GET /api/search/popular - Get popular searches
// Protected routes
router.post('/analytics', authenticate, saveSearchAnalytics); // POST /api/search/analytics - Save search analytics
export default router;
//# sourceMappingURL=search.js.map