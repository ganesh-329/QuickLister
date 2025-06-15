import { Request, Response } from 'express';
import { Gig } from '../models/index.js';
import { config } from '../config/env.js';
import mongoose from 'mongoose';

// Use the global Express Request interface that already includes user
interface AuthRequest extends Request {}

// Create a new gig
export const createGig = async (req: AuthRequest, res: Response): Promise<void> => {
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
  } catch (error: any) {
    console.error('Create gig error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create gig',
      error: config.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// Get all gigs with optional filters
export const getGigs = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      skills,
      minRate,
      maxRate,
      urgency,
      paymentType,
      search,
      lat,
      lng,
      radius = 15
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    let query: any = {
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
      if (minRate) query['payment.rate'].$gte = parseFloat(minRate as string);
      if (maxRate) query['payment.rate'].$lte = parseFloat(maxRate as string);
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
      query.$text = { $search: search as string };
    }

    let gigsQuery;

    // Geospatial search if coordinates provided
    if (lat && lng) {
      const coordinates: [number, number] = [parseFloat(lng as string), parseFloat(lat as string)];
      const radiusInMeters = parseFloat(radius as string) * 1000;

      // Note: MongoDB has limitations combining $text and $near in a single query
      // We'll need to handle this by either:
      // 1. Doing geospatial search first, then text filtering
      // 2. Or removing $text from the query when using $near
      
      // Remove $text from query if present, since $near and $text can't be combined
      const geoQuery = { ...query };
      delete geoQuery.$text;

      gigsQuery = Gig.find({
        ...geoQuery,
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
    } else {
      gigsQuery = Gig.find(query);
    }

    let gigs = await gigsQuery
      .populate('posterId', 'name email phone')
      .sort({ urgency: -1, postedAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // If we have both search text and coordinates, do client-side text filtering
    if (search && lat && lng) {
      const searchLower = (search as string).toLowerCase();
      gigs = gigs.filter(gig => 
        gig.title.toLowerCase().includes(searchLower) ||
        gig.description.toLowerCase().includes(searchLower) ||
        gig.category.toLowerCase().includes(searchLower) ||
        gig.skills.some(skill => skill.name.toLowerCase().includes(searchLower))
      );
    }

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
  } catch (error: any) {
    console.error('Get gigs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve gigs',
      error: config.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// Get gig by ID
export const getGigById = async (req: Request, res: Response): Promise<void> => {
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
  } catch (error: any) {
    console.error('Get gig by ID error:', error);
    res.status(500).json({
      success: false,
      error: config.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// Update gig
export const updateGig = async (req: AuthRequest, res: Response): Promise<void> => {
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
  } catch (error: any) {
    console.error('Update gig error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update gig',
      error: config.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// Delete gig
export const deleteGig = async (req: AuthRequest, res: Response): Promise<void> => {
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
  } catch (error: any) {
    console.error('Delete gig error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete gig',
      error: config.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// Apply to a gig
export const applyToGig = async (req: AuthRequest, res: Response): Promise<void> => {
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
    const existingApplication = gig.applications.find(
      (app: any) => app.applicantId.toString() === userId
    );

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
  } catch (error: any) {
    console.error('Apply to gig error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit application',
      error: config.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// Accept application
export const acceptApplication = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const gig = await Gig.findById(gigId).populate('applications.applicantId', 'name email');
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

    const application = gig.applications.find(
      (app: any) => app._id.toString() === applicationId
    );
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

    // Get rejected applications for notifications
    const rejectedApplications = gig.applications.filter(
      (app: any) => app._id.toString() !== applicationId && app.status === 'pending'
    );

    // Reject all other applications
    gig.applications.forEach((app: any) => {
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
  } catch (error: any) {
    console.error('Accept application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept application',
      error: config.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// Reject application
export const rejectApplication = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const application = gig.applications.find(
      (app: any) => app._id.toString() === applicationId
    );
    if (!application) {
      res.status(404).json({
        success: false,
        message: 'Application not found',
      });
      return;
    }

    // Update application status
    application.status = 'rejected';
    await gig.save();

    res.json({
      success: true,
      message: 'Application rejected successfully',
      data: { gig },
    });
  } catch (error: any) {
    console.error('Reject application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject application',
      error: config.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// Get user's posted gigs
export const getUserPostedGigs = async (req: AuthRequest, res: Response): Promise<void> => {
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
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    let query: any = { posterId: userId };
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
  } catch (error: any) {
    console.error('Get user posted gigs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve posted gigs',
      error: config.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

// Get user's applications
export const getUserApplications = async (req: AuthRequest, res: Response): Promise<void> => {
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
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Convert userId to ObjectId for comparison
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // First get total count for pagination
    const total = await Gig.countDocuments({
      'applications.applicantId': userObjectId
    });

    // Build match query
    let matchQuery: any = {
      'applications.applicantId': userObjectId
    };

    if (status) {
      matchQuery['applications.status'] = status;
    }

    const applications = await Gig.aggregate([
      { $match: matchQuery },
      { $unwind: '$applications' },
      { $match: { 'applications.applicantId': userObjectId } },
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
          application: {
            _id: '$applications._id',
            status: '$applications.status',
            appliedAt: '$applications.appliedAt',
            message: '$applications.message',
            proposedRate: '$applications.proposedRate'
          },
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
  } catch (error: any) {
    console.error('Get user applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve applications',
      error: config.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};
