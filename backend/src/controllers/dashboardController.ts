import { Request, Response } from 'express';
import Gig from '../models/Gig.js';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    // Parallel queries for performance
    const [
      userPostedGigs,
      userApplicationsData,
      allUserGigs
    ] = await Promise.all([
      // Get user's posted gigs
      Gig.find({ posterId: userId }).lean(),
      
      // Get gigs where user has applied
      Gig.find({ 
        'applications.applicantId': userId 
      }).select('applications payment').lean(),
      
      // Get all gigs for comprehensive stats
      Gig.find({
        $or: [
          { posterId: userId },
          { 'applications.applicantId': userId }
        ]
      }).lean()
    ]);

    // Calculate statistics
    const stats = {
      // Posted gigs statistics
      totalGigs: userPostedGigs.length,
      activeGigs: userPostedGigs.filter(gig => 
        ['posted', 'active', 'assigned', 'in_progress'].includes(gig.status)
      ).length,
      completedGigs: userPostedGigs.filter(gig => 
        gig.status === 'completed'
      ).length,
      draftGigs: userPostedGigs.filter(gig => 
        gig.status === 'draft'
      ).length,

      // Application statistics
      totalApplications: 0,
      pendingApplications: 0,
      acceptedApplications: 0,
      rejectedApplications: 0,

      // Financial statistics
      totalEarnings: 0,
      pendingEarnings: 0,

      // Engagement statistics
      totalViews: userPostedGigs.reduce((sum, gig) => sum + (gig.views || 0), 0),
      totalApplicationsReceived: userPostedGigs.reduce((sum, gig) => 
        sum + (gig.applicationsCount || 0), 0
      ),
    };

    // Calculate user's application statistics
    let userApplications: any[] = [];
    userApplicationsData.forEach(gig => {
      const userApps = gig.applications.filter((app: any) => 
        app.applicantId.toString() === userId.toString()
      );
      userApplications.push(...userApps.map((app: any) => ({
        ...app,
        gigPayment: gig.payment
      })));
    });

    stats.totalApplications = userApplications.length;
    stats.pendingApplications = userApplications.filter(app => 
      app.status === 'pending'
    ).length;
    stats.acceptedApplications = userApplications.filter(app => 
      app.status === 'accepted'
    ).length;
    stats.rejectedApplications = userApplications.filter(app => 
      app.status === 'rejected'
    ).length;

    // Calculate earnings from completed gigs where user was assigned
    const completedAsWorker = userApplicationsData.filter(gig => {
      const userApp = gig.applications.find((app: any) => 
        app.applicantId.toString() === userId.toString() && 
        app.status === 'accepted'
      );
      return userApp && gig.status === 'completed';
    });

    stats.totalEarnings = completedAsWorker.reduce((sum, gig) => {
      const userApp = gig.applications.find((app: any) => 
        app.applicantId.toString() === userId.toString()
      );
      return sum + (userApp?.proposedRate || gig.payment.rate || 0);
    }, 0);

    // Calculate pending earnings from accepted but not completed gigs
    const pendingAsWorker = userApplicationsData.filter(gig => {
      const userApp = gig.applications.find((app: any) => 
        app.applicantId.toString() === userId.toString() && 
        app.status === 'accepted'
      );
      return userApp && ['assigned', 'in_progress'].includes(gig.status);
    });

    stats.pendingEarnings = pendingAsWorker.reduce((sum, gig) => {
      const userApp = gig.applications.find((app: any) => 
        app.applicantId.toString() === userId.toString()
      );
      return sum + (userApp?.proposedRate || gig.payment.rate || 0);
    }, 0);

    // Recent activity - last 5 gigs
    const recentGigs = userPostedGigs
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    // Recent applications - last 5 applications
    const recentApplications = userApplications
      .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
      .slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        stats,
        recentGigs,
        recentApplications
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 