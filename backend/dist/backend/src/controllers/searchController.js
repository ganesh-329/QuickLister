import { Gig, User } from '../models/index.js';
import { config } from '../config/env.js';
// Search gigs with comprehensive filtering and sorting
export const searchGigs = async (req, res) => {
    try {
        const { q, category, skills, minRate, maxRate, paymentType, urgency, experienceLevel, lat, lng, radius = '15', sort = 'relevance', page = '1', limit = '20', location } = req.query;
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;
        const radiusInMeters = parseFloat(radius) * 1000;
        // Build aggregation pipeline for complex search
        const pipeline = [];
        // Match stage - basic filters
        const matchStage = {
            status: 'posted',
            expiresAt: { $gte: new Date() }
        };
        // Category filter
        if (category && category !== 'all') {
            matchStage.category = category;
        }
        // Skills filter
        if (skills) {
            const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
            if (skillsArray.length > 0) {
                matchStage['skills.name'] = { $in: skillsArray.map(skill => new RegExp(skill, 'i')) };
            }
        }
        // Price range filter
        if (minRate || maxRate) {
            matchStage['payment.rate'] = {};
            if (minRate)
                matchStage['payment.rate'].$gte = parseFloat(minRate);
            if (maxRate)
                matchStage['payment.rate'].$lte = parseFloat(maxRate);
        }
        // Payment type filter
        if (paymentType && paymentType !== 'all') {
            matchStage['payment.paymentType'] = paymentType;
        }
        // Urgency filter
        if (urgency && urgency !== 'all') {
            matchStage.urgency = urgency;
        }
        // Experience level filter
        if (experienceLevel && experienceLevel !== 'all') {
            matchStage.experienceLevel = experienceLevel;
        }
        // Location-based search
        if (lat && lng) {
            const coordinates = [parseFloat(lng), parseFloat(lat)];
            // Use $geoNear for distance-based search
            if (q) {
                // For text + geo search, we need to combine approaches
                // First do text search, then geo filter
                matchStage.$text = { $search: q };
                matchStage['location.coordinates'] = {
                    $near: {
                        $geometry: { type: 'Point', coordinates },
                        $maxDistance: radiusInMeters
                    }
                };
            }
            else {
                // Pure geo search - use $geoNear for better performance
                pipeline.push({
                    $geoNear: {
                        near: { type: 'Point', coordinates },
                        distanceField: 'distance',
                        maxDistance: radiusInMeters,
                        spherical: true,
                        query: matchStage
                    }
                });
                // Skip the match stage since $geoNear handles it
                pipeline.push({ $match: {} });
            }
        }
        else if (location) {
            // Text-based location search
            matchStage.$or = [
                { 'location.address': new RegExp(location, 'i') },
                { 'location.city': new RegExp(location, 'i') },
                { 'location.state': new RegExp(location, 'i') }
            ];
        }
        // Add text search if no geo search was applied
        if (q && (!lat || !lng)) {
            matchStage.$text = { $search: q };
            // Add text score for relevance sorting
            pipeline.push({ $match: matchStage });
            pipeline.push({ $addFields: { score: { $meta: 'textScore' } } });
        }
        else if (lat && lng && !pipeline.length) {
            // Regular match for geo + text search
            pipeline.push({ $match: matchStage });
        }
        // If no pipeline started yet, add match stage
        if (!pipeline.length) {
            pipeline.push({ $match: matchStage });
        }
        // Add lookup for poster information
        pipeline.push({
            $lookup: {
                from: 'users',
                localField: 'posterId',
                foreignField: '_id',
                as: 'poster',
                pipeline: [{ $project: { name: 1, email: 1, phone: 1, location: 1, avatar: 1 } }]
            }
        });
        pipeline.push({
            $unwind: { path: '$poster', preserveNullAndEmptyArrays: true }
        });
        // Add computed fields for sorting and display
        pipeline.push({
            $addFields: {
                applicationsCount: { $size: '$applications' },
                urgencyScore: {
                    $switch: {
                        branches: [
                            { case: { $eq: ['$urgency', 'urgent'] }, then: 4 },
                            { case: { $eq: ['$urgency', 'high'] }, then: 3 },
                            { case: { $eq: ['$urgency', 'medium'] }, then: 2 },
                            { case: { $eq: ['$urgency', 'low'] }, then: 1 }
                        ],
                        default: 2
                    }
                },
                timeScore: {
                    $divide: [
                        { $subtract: [new Date(), '$postedAt'] },
                        1000 * 60 * 60 * 24 // Convert to days
                    ]
                }
            }
        });
        // Sorting logic
        let sortStage = {};
        switch (sort) {
            case 'date':
                sortStage = { postedAt: -1 };
                break;
            case 'rate_high':
                sortStage = { 'payment.rate': -1, postedAt: -1 };
                break;
            case 'rate_low':
                sortStage = { 'payment.rate': 1, postedAt: -1 };
                break;
            case 'urgency':
                sortStage = { urgencyScore: -1, postedAt: -1 };
                break;
            case 'distance':
                if (lat && lng) {
                    sortStage = { distance: 1, urgencyScore: -1 };
                }
                else {
                    sortStage = { urgencyScore: -1, postedAt: -1 };
                }
                break;
            case 'relevance':
            default:
                if (q) {
                    sortStage = { score: { $meta: 'textScore' }, urgencyScore: -1, postedAt: -1 };
                }
                else {
                    sortStage = { urgencyScore: -1, postedAt: -1 };
                }
                break;
        }
        pipeline.push({ $sort: sortStage });
        // Add pagination
        pipeline.push({ $skip: skip });
        pipeline.push({ $limit: limitNum });
        // Project final result
        pipeline.push({
            $project: {
                _id: 1,
                title: 1,
                description: 1,
                category: 1,
                subCategory: 1,
                urgency: 1,
                location: 1,
                skills: 1,
                payment: 1,
                timeline: 1,
                status: 1,
                poster: 1,
                applications: 1,
                applicationsCount: 1,
                views: 1,
                postedAt: 1,
                expiresAt: 1,
                experienceLevel: 1,
                toolsRequired: 1,
                images: 1,
                distance: 1,
                score: 1
            }
        });
        // Execute search
        const [results, totalCountResult] = await Promise.all([
            Gig.aggregate(pipeline),
            Gig.aggregate([
                ...pipeline.slice(0, -3), // Remove skip, limit, and project
                { $count: 'total' }
            ])
        ]);
        const total = totalCountResult[0]?.total || 0;
        const totalPages = Math.ceil(total / limitNum);
        // Format results
        const gigs = results.map(gig => ({
            ...gig,
            distance: gig.distance ? Math.round(gig.distance / 1000 * 100) / 100 : undefined // Convert to km, round to 2 decimals
        }));
        res.json({
            success: true,
            message: 'Gigs search completed successfully',
            data: {
                gigs,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    pages: totalPages,
                    hasMore: pageNum < totalPages
                },
                searchMeta: {
                    query: q,
                    filters: {
                        category,
                        skills: skills?.split(',').filter(Boolean),
                        priceRange: { min: minRate, max: maxRate },
                        paymentType,
                        urgency,
                        experienceLevel,
                        location: location || (lat && lng ? `${lat},${lng}` : undefined),
                        radius: parseFloat(radius)
                    },
                    sort,
                    resultsFound: total > 0
                }
            }
        });
    }
    catch (error) {
        console.error('Search gigs error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search gigs',
            error: config.NODE_ENV === 'development' ? error.message : 'Internal server error',
        });
    }
};
// Search users/freelancers
export const searchUsers = async (req, res) => {
    try {
        const { q, skills, location, lat, lng, radius = '50', sort = 'relevance', page = '1', limit = '20' } = req.query;
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;
        // Build query for users
        let query = {};
        // Text search on name, bio, location
        if (q) {
            query.$or = [
                { name: new RegExp(q, 'i') },
                { bio: new RegExp(q, 'i') },
                { location: new RegExp(q, 'i') }
            ];
        }
        // Location-based search
        if (location && !lat && !lng) {
            query.location = new RegExp(location, 'i');
        }
        // Execute user search
        let userQuery = User.find(query)
            .select('name email phone location bio avatar createdAt')
            .skip(skip)
            .limit(limitNum);
        // Sorting
        switch (sort) {
            case 'name':
                userQuery = userQuery.sort({ name: 1 });
                break;
            case 'recent':
                userQuery = userQuery.sort({ createdAt: -1 });
                break;
            case 'relevance':
            default:
                if (q) {
                    // Sort by name match first, then recent
                    userQuery = userQuery.sort({ name: 1, createdAt: -1 });
                }
                else {
                    userQuery = userQuery.sort({ createdAt: -1 });
                }
                break;
        }
        const [users, total] = await Promise.all([
            userQuery.exec(),
            User.countDocuments(query)
        ]);
        const totalPages = Math.ceil(total / limitNum);
        res.json({
            success: true,
            message: 'Users search completed successfully',
            data: {
                users,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    pages: totalPages,
                    hasMore: pageNum < totalPages
                },
                searchMeta: {
                    query: q,
                    filters: {
                        skills: skills?.split(',').filter(Boolean),
                        location,
                        radius: parseFloat(radius)
                    },
                    sort,
                    resultsFound: total > 0
                }
            }
        });
    }
    catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search users',
            error: config.NODE_ENV === 'development' ? error.message : 'Internal server error',
        });
    }
};
// Get search suggestions for autocomplete
export const getSearchSuggestions = async (req, res) => {
    try {
        const { q, type = 'all', limit = '10' } = req.query;
        const limitNum = Math.min(20, Math.max(1, parseInt(limit)));
        const suggestions = [];
        if (!q || q.length < 2) {
            // Return popular/default suggestions
            const popularSuggestions = [
                { id: '1', text: 'Web Development', type: 'skill', category: 'tech_services' },
                { id: '2', text: 'Graphic Design', type: 'skill', category: 'creative' },
                { id: '3', text: 'Home Cleaning', type: 'service', category: 'home_services' },
                { id: '4', text: 'Tutoring', type: 'service', category: 'tutoring' },
                { id: '5', text: 'Photography', type: 'service', category: 'photography' },
                { id: '6', text: 'Plumbing', type: 'service', category: 'plumbing' },
                { id: '7', text: 'Electrical Work', type: 'service', category: 'electrical' },
                { id: '8', text: 'Content Writing', type: 'skill', category: 'writing' },
                { id: '9', text: 'Pet Sitting', type: 'service', category: 'pet_services' },
                { id: '10', text: 'Moving Services', type: 'service', category: 'moving' }
            ];
            res.json({
                success: true,
                data: { suggestions: popularSuggestions.slice(0, limitNum) }
            });
            return;
        }
        const searchQuery = q;
        const regex = new RegExp(searchQuery, 'i');
        // Get suggestions from different sources
        if (type === 'all' || type === 'gigs') {
            // Gig titles and categories
            const gigSuggestions = await Gig.aggregate([
                {
                    $match: {
                        status: 'posted',
                        $or: [
                            { title: regex },
                            { category: regex },
                            { 'skills.name': regex }
                        ]
                    }
                },
                {
                    $group: {
                        _id: null,
                        titles: { $addToSet: '$title' },
                        categories: { $addToSet: '$category' },
                        skills: { $addToSet: '$skills.name' }
                    }
                },
                {
                    $project: {
                        suggestions: {
                            $concatArrays: [
                                { $slice: ['$titles', 5] },
                                { $slice: ['$categories', 3] },
                                { $slice: [{ $reduce: { input: '$skills', initialValue: [], in: { $concatArrays: ['$$value', '$$this'] } } }, 5] }
                            ]
                        }
                    }
                }
            ]);
            if (gigSuggestions[0]) {
                const gigResults = gigSuggestions[0].suggestions
                    .filter((s) => s && s.toLowerCase().includes(searchQuery.toLowerCase()))
                    .slice(0, 5)
                    .map((text, index) => ({
                    id: `gig_${index}`,
                    text,
                    type: 'gig',
                    category: 'gig'
                }));
                suggestions.push(...gigResults);
            }
        }
        if (type === 'all' || type === 'users') {
            // User skills and locations (from bio or location field)
            const userSuggestions = await User.aggregate([
                {
                    $match: {
                        $or: [
                            { name: regex },
                            { location: regex },
                            { bio: regex }
                        ]
                    }
                },
                {
                    $group: {
                        _id: null,
                        names: { $addToSet: '$name' },
                        locations: { $addToSet: '$location' }
                    }
                },
                {
                    $project: {
                        suggestions: {
                            $concatArrays: [
                                { $slice: ['$names', 3] },
                                { $slice: ['$locations', 3] }
                            ]
                        }
                    }
                }
            ]);
            if (userSuggestions[0]) {
                const userResults = userSuggestions[0].suggestions
                    .filter((s) => s && s.toLowerCase().includes(searchQuery.toLowerCase()))
                    .slice(0, 3)
                    .map((text, index) => ({
                    id: `user_${index}`,
                    text,
                    type: 'user',
                    category: 'user'
                }));
                suggestions.push(...userResults);
            }
        }
        // Remove duplicates and limit results
        const uniqueSuggestions = suggestions
            .filter((suggestion, index, self) => index === self.findIndex(s => s.text.toLowerCase() === suggestion.text.toLowerCase()))
            .slice(0, limitNum);
        res.json({
            success: true,
            data: { suggestions: uniqueSuggestions }
        });
    }
    catch (error) {
        console.error('Get suggestions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get suggestions',
            error: config.NODE_ENV === 'development' ? error.message : 'Internal server error',
        });
    }
};
// Get popular searches
export const getPopularSearches = async (req, res) => {
    try {
        // This could be enhanced to track actual search analytics
        // For now, return static popular searches based on categories
        const popularSearches = [
            { text: 'Web Development', count: 1250, trend: 'up' },
            { text: 'Home Cleaning', count: 890, trend: 'stable' },
            { text: 'Graphic Design', count: 750, trend: 'up' },
            { text: 'Tutoring', count: 650, trend: 'up' },
            { text: 'Plumbing', count: 520, trend: 'stable' },
            { text: 'Photography', count: 480, trend: 'down' },
            { text: 'Content Writing', count: 420, trend: 'up' },
            { text: 'Electrical Work', count: 380, trend: 'stable' },
            { text: 'Pet Care', count: 320, trend: 'up' },
            { text: 'Moving Services', count: 280, trend: 'stable' }
        ];
        res.json({
            success: true,
            data: { popularSearches }
        });
    }
    catch (error) {
        console.error('Get popular searches error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get popular searches',
            error: config.NODE_ENV === 'development' ? error.message : 'Internal server error',
        });
    }
};
// Save search analytics (for future enhancement)
export const saveSearchAnalytics = async (req, res) => {
    try {
        const { query, resultCount, filters, userId } = req.body;
        // This would typically save to a search analytics collection
        // For now, just acknowledge the request
        console.log('Search analytics:', { query, resultCount, filters, userId, timestamp: new Date() });
        res.json({
            success: true,
            message: 'Search analytics saved successfully'
        });
    }
    catch (error) {
        console.error('Save search analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save search analytics',
            error: config.NODE_ENV === 'development' ? error.message : 'Internal server error',
        });
    }
};
//# sourceMappingURL=searchController.js.map