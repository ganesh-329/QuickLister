import api from './api';

export interface DashboardStats {
  // Posted gigs statistics
  totalGigs: number;
  activeGigs: number;
  completedGigs: number;
  draftGigs: number;

  // Application statistics
  totalApplications: number;
  pendingApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;

  // Financial statistics
  totalEarnings: number;
  pendingEarnings: number;

  // Engagement statistics
  totalViews: number;
  totalApplicationsReceived: number;
}

export interface RecentGig {
  _id: string;
  title: string;
  status: string;
  createdAt: string;
  payment: {
    rate: number;
    paymentType: string;
  };
  location: {
    address: string;
  };
  applicationsCount: number;
}

export interface RecentApplication {
  _id: string;
  status: string;
  appliedAt: string;
  proposedRate?: number;
  gigPayment: {
    rate: number;
    paymentType: string;
  };
}

export interface DashboardData {
  stats: DashboardStats;
  recentGigs: RecentGig[];
  recentApplications: RecentApplication[];
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
}

class DashboardService {
  async getDashboardStats(): Promise<DashboardData> {
    try {
      const response = await api.get<DashboardResponse>('/dashboard/stats');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }
}

export default new DashboardService(); 