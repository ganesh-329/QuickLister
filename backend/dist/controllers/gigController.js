import { Gig } from '../models/index.js';
import { config } from '../config/env.js';
// Create a new gig
export const createGig = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }
        const gigData = {
            ...req.body,
            posterId: userId,
            status: 'posted',
            postedAt: new Date(),
        };
        // Basic validation
        if (!gigData.title || !gigData.description || !gigData.location || !gigData.payment) {
            res.status(400).json({
                success: false,
                message: 'Title, description, location, and payment information are required',
            });
            return;
        }
        const gig = new Gig(gigData);
        await gig.save();
        res.status(201).json({
            success: true,
            message: 'Gig created successfully',
            data: { gig },
        });
    }
    catch (error) {
        console.error('Create gig error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create gig',
            error: config.NODE_ENV === 'development' ? error.message : 'Internal server error',
        });
    }
};
// Get all gigs with optional filters
export const getGigs = async (req, res) => {
    try {
        const { page = 1, limit = 20, category, skills, minRate, maxRate, urgency, paymentType, search, lat, lng, radius = 15 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        // Build query
        let query = {
            status: 'posted',
            expiresAt: { $gte: new Date() }
        };
        // Category filter
        if (category) {
            query.category = category;
        }
        // Skills filter
        if (skills) {
            const skillsArray = Array.isArray(skills) ? skills : [skills];
            query['skills.name'] = { $in: skillsArray };
        }
        // Price range filter
        if (minRate || maxRate) {
            query['payment.rate'] = {};
            if (minRate)
                query['payment.rate'].$gte = parseFloat(minRate);
            if (maxRate)
                query['payment.rate'].$lte = parseFloat(maxRate);
        }
        // Urgency filter
        if (urgency) {
            query.urgency = urgency;
        }
        // Payment type filter
        if (paymentType) {
            query['payment.paymentType'] = paymentType;
        }
        // Text search
        if (search) {
            query.$text = { $search: search };
        }
        let gigsQuery;
        // Geospatial search if coordinates provided
        if (lat && lng) {
            const coordinates = [parseFloat(lng), parseFloat(lat)];
            const radiusInMeters = parseFloat(radius) * 1000;
            gigsQuery = Gig.find({
                ...query,
                'location.coordinates': {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: coordinates
                        },
                        $maxDistance: radiusInMeters
                    }
                }
            });
        }
        else {
            gigsQuery = Gig.find(query);
        }
        const gigs = await gigsQuery
            .populate('posterId', 'name email phone')
            .sort({ urgency: -1, postedAt: -1 })
            .skip(skip)
            .limit(limitNum);
        const total = await Gig.countDocuments(query);
        res.json({
            success: true,
            message: 'Gigs retrieved successfully',
            data: {
                gigs,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    pages: Math.ceil(total / limitNum)
                }
            },
        });
    }
    catch (error) {
        console.error('Get gigs error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve gigs',
            error: config.NODE_ENV === 'development' ? error.message : 'Internal server error',
        });
    }
};
// Get gig by ID
export const getGigById = async (req, res) => {
    try {
        const { id } = req.params;
        const gig = await Gig.findById(id)
            .populate('posterId', 'name email phone')
            .populate('applications.applicantId', 'name email phone');
        if (!gig) {
            res.status(404).json({
                success: false,
                message: 'Gig not found',
            });
            return;
        }
        // Increment view count
        gig.views += 1;
        await gig.save();
        res.json({
            success: true,
            message: 'Gig retrieved successfully',
            data: { gig },
        });
    }
    catch (error) {
        console.error('Get gig by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve gig',
            error: config.NODE_ENV === 'development' ? error.message : 'Internal server error',
        });
    }
};
// Update gig
export const updateGig = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }
        const gig = await Gig.findById(id);
        if (!gig) {
            res.status(404).json({
                success: false,
                message: 'Gig not found',
            });
            return;
        }
        // Check if user owns the gig
        if (gig.posterId.toString() !== userId) {
            res.status(403).json({
                success: false,
                message: 'Not authorized to update this gig',
            });
            return;
        }
        // Update gig
        Object.assign(gig, req.body);
        await gig.save();
        res.json({
            success: true,
            message: 'Gig updated successfully',
            data: { gig },
        });
    }
    catch (error) {
        console.error('Update gig error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update gig',
            error: config.NODE_ENV === 'development' ? error.message : 'Internal server error',
        });
    }
};
// Delete gig
export const deleteGig = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }
        const gig = await Gig.findById(id);
        if (!gig) {
            res.status(404).json({
                success: false,
                message: 'Gig not found',
            });
            return;
        }
        // Check if user owns the gig
        if (gig.posterId.toString() !== userId) {
            res.status(403).json({
                success: false,
                message: 'Not authorized to delete this gig',
            });
            return;
        }
        await Gig.findByIdAndDelete(id);
        res.json({
            success: true,
            message: 'Gig deleted successfully',
        });
    }
    catch (error) {
        console.error('Delete gig error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete gig',
            error: config.NODE_ENV === 'development' ? error.message : 'Internal server error',
        });
    }
};
// Apply to a gig
export const applyToGig = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }
        const gig = await Gig.findById(id);
        if (!gig) {
            res.status(404).json({
                success: false,
                message: 'Gig not found',
            });
            return;
        }
        // Check if gig is still available
        if (gig.status !== 'posted') {
            res.status(400).json({
                success: false,
                message: 'This gig is no longer available for applications',
            });
            return;
        }
        // Check if user is the gig poster
        if (gig.posterId.toString() === userId) {
            res.status(400).json({
                success: false,
                message: 'You cannot apply to your own gig',
            });
            return;
        }
        // Add application
        const applicationData = {
            applicantId: userId,
            appliedAt: new Date(),
            status: 'pending',
            ...req.body // Include any additional data like message, proposed rate, etc.
        };
        // Check if user already applied
        const existingApplication = gig.applications.find((app) => app.applicantId.toString() === userId);
        if (existingApplication) {
            res.status(400).json({
                success: false,
                message: 'You have already applied to this gig',
            });
            return;
        }
        // Add application
        gig.applications.push(applicationData);
        gig.applicationsCount = gig.applications.length;
        await gig.save();
        res.json({
            success: true,
            message: 'Application submitted successfully',
            data: { gig },
        });
    }
    catch (error) {
        console.error('Apply to gig error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit application',
            error: config.NODE_ENV === 'development' ? error.message : 'Internal server error',
        });
    }
};
// Accept application
export const acceptApplication = async (req, res) => {
    try {
        const { gigId, applicationId } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }
        const gig = await Gig.findById(gigId);
        if (!gig) {
            res.status(404).json({
                success: false,
                message: 'Gig not found',
            });
            return;
        }
        // Check if user owns the gig
        if (gig.posterId.toString() !== userId) {
            res.status(403).json({
                success: false,
                message: 'Not authorized to manage applications for this gig',
            });
            return;
        }
        const application = gig.applications.find((app) => app._id.toString() === applicationId);
        if (!application) {
            res.status(404).json({
                success: false,
                message: 'Application not found',
            });
            return;
        }
        // Update application status
        application.status = 'accepted';
        // Assign the gig
        gig.assignedTo = application.applicantId;
        gig.status = 'assigned';
        // Reject all other applications
        gig.applications.forEach((app) => {
            if (app._id.toString() !== applicationId && app.status === 'pending') {
                app.status = 'rejected';
            }
        });
        await gig.save();
        res.json({
            success: true,
            message: 'Application accepted successfully',
            data: { gig },
        });
    }
    catch (error) {
        console.error('Accept application error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to accept application',
            error: config.NODE_ENV === 'development' ? error.message : 'Internal server error',
        });
    }
};
// Get user's posted gigs
export const getUserPostedGigs = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }
        const { page = 1, limit = 10, status } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        let query = { posterId: userId };
        if (status) {
            query.status = status;
        }
        const gigs = await Gig.find(query)
            .populate('assignedTo', 'name email phone')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);
        const total = await Gig.countDocuments(query);
        res.json({
            success: true,
            message: 'Posted gigs retrieved successfully',
            data: {
                gigs,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    pages: Math.ceil(total / limitNum)
                }
            },
        });
    }
    catch (error) {
        console.error('Get user posted gigs error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve posted gigs',
            error: config.NODE_ENV === 'development' ? error.message : 'Internal server error',
        });
    }
};
// Get user's applications
export const getUserApplications = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }
        const { page = 1, limit = 10, status } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        let matchQuery = {
            'applications.applicantId': userId
        };
        if (status) {
            matchQuery['applications.status'] = status;
        }
        const applications = await Gig.aggregate([
            { $match: matchQuery },
            { $unwind: '$applications' },
            { $match: { 'applications.applicantId': userId } },
            ...(status ? [{ $match: { 'applications.status': status } }] : []),
            { $sort: { 'applications.appliedAt': -1 } },
            { $skip: skip },
            { $limit: limitNum },
            {
                $lookup: {
                    from: 'users',
                    localField: 'posterId',
                    foreignField: '_id',
                    as: 'poster'
                }
            },
            { $unwind: '$poster' },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    description: 1,
                    category: 1,
                    location: 1,
                    payment: 1,
                    status: 1,
                    application: '$applications',
                    poster: {
                        name: '$poster.name',
                        email: '$poster.email',
                        phone: '$poster.phone'
                    }
                }
            }
        ]);
        res.json({
            success: true,
            message: 'Applications retrieved successfully',
            data: { applications },
        });
    }
    catch (error) {
        console.error('Get user applications error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve applications',
            error: config.NODE_ENV === 'development' ? error.message : 'Internal server error',
        });
    }
};
//# sourceMappingURL=gigController.js.map