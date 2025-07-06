import { Gig } from '../models/index.js';
import { config } from '../config/env.js';
// Get application by ID
export const getApplicationById = async (req, res) => {
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
        // Find gig containing the application
        const gig = await Gig.findOne({
            'applications._id': id
        }).populate('posterId', 'name email phone')
            .populate('applications.applicantId', 'name email phone');
        if (!gig) {
            res.status(404).json({
                success: false,
                message: 'Application not found',
            });
            return;
        }
        // Extract the specific application
        const application = gig.applications.find((app) => app._id.toString() === id);
        if (!application) {
            res.status(404).json({
                success: false,
                message: 'Application not found',
            });
            return;
        }
        // Check authorization - user must be either the poster or applicant
        const isOwner = gig.posterId._id.toString() === userId;
        const isApplicant = application.applicantId._id.toString() === userId;
        if (!isOwner && !isApplicant) {
            res.status(403).json({
                success: false,
                message: 'Not authorized to view this application',
            });
            return;
        }
        res.json({
            success: true,
            message: 'Application retrieved successfully',
            data: {
                application,
                gig: {
                    _id: gig._id,
                    title: gig.title,
                    description: gig.description,
                    category: gig.category,
                    location: gig.location,
                    payment: gig.payment,
                    posterId: gig.posterId
                }
            },
        });
    }
    catch (error) {
        console.error('Get application by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve application',
            error: config.NODE_ENV === 'development' ? error.message : 'Internal server error',
        });
    }
};
// Update application
export const updateApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const { message, proposedRate } = req.body;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }
        // Find gig containing the application
        const gig = await Gig.findOne({
            'applications._id': id
        });
        if (!gig) {
            res.status(404).json({
                success: false,
                message: 'Application not found',
            });
            return;
        }
        // Find the specific application
        const application = gig.applications.find((app) => app._id.toString() === id);
        if (!application) {
            res.status(404).json({
                success: false,
                message: 'Application not found',
            });
            return;
        }
        // Check if user is the applicant
        if (application.applicantId.toString() !== userId) {
            res.status(403).json({
                success: false,
                message: 'Not authorized to update this application',
            });
            return;
        }
        // Check if application is still pending
        if (application.status !== 'pending') {
            res.status(400).json({
                success: false,
                message: 'Cannot update application that is not pending',
            });
            return;
        }
        // Update application fields
        if (message !== undefined)
            application.message = message;
        if (proposedRate !== undefined)
            application.proposedRate = proposedRate;
        await gig.save();
        res.json({
            success: true,
            message: 'Application updated successfully',
            data: { application },
        });
    }
    catch (error) {
        console.error('Update application error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update application',
            error: config.NODE_ENV === 'development' ? error.message : 'Internal server error',
        });
    }
};
// Delete/Withdraw application
export const deleteApplication = async (req, res) => {
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
        // Find gig containing the application
        const gig = await Gig.findOne({
            'applications._id': id
        });
        if (!gig) {
            res.status(404).json({
                success: false,
                message: 'Application not found',
            });
            return;
        }
        // Find the specific application
        const applicationIndex = gig.applications.findIndex((app) => app._id.toString() === id);
        if (applicationIndex === -1) {
            res.status(404).json({
                success: false,
                message: 'Application not found',
            });
            return;
        }
        const application = gig.applications[applicationIndex];
        if (!application) {
            res.status(404).json({
                success: false,
                message: 'Application not found',
            });
            return;
        }
        // Check if user is the applicant
        if (application.applicantId.toString() !== userId) {
            res.status(403).json({
                success: false,
                message: 'Not authorized to delete this application',
            });
            return;
        }
        // Check if application is still pending
        if (application.status !== 'pending') {
            res.status(400).json({
                success: false,
                message: 'Cannot withdraw application that is not pending',
            });
            return;
        }
        // Remove the application
        gig.applications.splice(applicationIndex, 1);
        gig.applicationsCount = gig.applications.length;
        await gig.save();
        res.json({
            success: true,
            message: 'Application withdrawn successfully',
        });
    }
    catch (error) {
        console.error('Delete application error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to withdraw application',
            error: config.NODE_ENV === 'development' ? error.message : 'Internal server error',
        });
    }
};
// Get applications by gig
export const getApplicationsByGig = async (req, res) => {
    try {
        const { gigId } = req.params;
        const userId = req.user?.id;
        const { page = 1, limit = 10, status } = req.query;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        // Find the gig
        const gig = await Gig.findById(gigId)
            .populate('applications.applicantId', 'name email phone avatar')
            .populate('posterId', 'name');
        if (!gig) {
            res.status(404).json({
                success: false,
                message: 'Gig not found',
            });
            return;
        }
        // Check if user owns the gig
        if (gig.posterId._id.toString() !== userId) {
            res.status(403).json({
                success: false,
                message: 'Not authorized to view applications for this gig',
            });
            return;
        }
        // Filter applications by status if provided
        let applications = gig.applications;
        if (status) {
            applications = applications.filter((app) => app.status === status);
        }
        // Implement pagination
        const total = applications.length;
        const paginatedApplications = applications.slice(skip, skip + limitNum);
        res.json({
            success: true,
            message: 'Applications retrieved successfully',
            data: {
                applications: paginatedApplications,
                gig: {
                    _id: gig._id,
                    title: gig.title,
                    status: gig.status
                },
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
        console.error('Get applications by gig error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve applications',
            error: config.NODE_ENV === 'development' ? error.message : 'Internal server error',
        });
    }
};
// Get applications by user
export const getApplicationsByUser = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { page = 1, limit = 10, status } = req.query;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        // Build match query
        let matchQuery = {
            'applications.applicantId': userId
        };
        if (status) {
            matchQuery['applications.status'] = status;
        }
        // Aggregate to get user's applications
        const result = await Gig.aggregate([
            { $match: matchQuery },
            { $unwind: '$applications' },
            { $match: { 'applications.applicantId': userId } },
            ...(status ? [{ $match: { 'applications.status': status } }] : []),
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
                $facet: {
                    applications: [
                        { $sort: { 'applications.appliedAt': -1 } },
                        { $skip: skip },
                        { $limit: limitNum },
                        {
                            $project: {
                                application: '$applications',
                                gig: {
                                    _id: '$_id',
                                    title: '$title',
                                    description: '$description',
                                    category: '$category',
                                    location: '$location',
                                    payment: '$payment',
                                    status: '$status',
                                    urgency: '$urgency',
                                    poster: {
                                        _id: '$poster._id',
                                        name: '$poster.name',
                                        email: '$poster.email'
                                    }
                                }
                            }
                        }
                    ],
                    totalCount: [
                        { $count: 'count' }
                    ]
                }
            }
        ]);
        const applications = result[0]?.applications || [];
        const total = result[0]?.totalCount[0]?.count || 0;
        res.json({
            success: true,
            message: 'Applications retrieved successfully',
            data: {
                applications,
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
        console.error('Get applications by user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve applications',
            error: config.NODE_ENV === 'development' ? error.message : 'Internal server error',
        });
    }
};
//# sourceMappingURL=applicationController.js.map