import React, { useState, useEffect } from 'react';
import { 
  BriefcaseIcon, 
  FileTextIcon, 
  UserIcon, 
  TrendingUpIcon,
  CalendarIcon,
  MapPinIcon,
  DollarSignIcon,
  AlertCircleIcon,
  CheckCircleIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GigService, { Gig } from '../../services/gigService';
import LoadingSpinner from '../UI/LoadingSpinner';

interface DashboardStats {
  totalGigs: number;
  activeGigs: number;
  totalApplications: number;
  pendingApplications: number;
  totalEarnings: number;
  thisMonthEarnings: number;
}

interface RecentActivity {
  id: string;
  type: 'gig_posted' | 'application_received' | 'gig_completed' | 'payment_received';
  title: string;
  description: string;
  date: string;
  amount?: number;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalGigs: 0,
    activeGigs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    totalEarnings: 0,
    thisMonthEarnings: 0
  });
  const [recentGigs, setRecentGigs] = useState<Gig[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch user's posted gigs
      const gigsResponse = await GigService.getUserPostedGigs({ limit: 5 });
      setRecentGigs(gigsResponse.gigs);

      // Calculate stats from gigs
      const totalGigs = gigsResponse.pagination.total;
      const activeGigs = gigsResponse.gigs.filter(gig => gig.status === 'active').length;
      
      // Calculate total applications across all gigs
      const totalApplications = gigsResponse.gigs.reduce((sum, gig) => sum + (gig.applicationsCount || 0), 0);
      const pendingApplications = gigsResponse.gigs.reduce((sum, gig) => 
        sum + gig.applications.filter(app => app.status === 'pending').length, 0
      );

      // Mock earnings calculation (in real app, this would come from backend)
      const totalEarnings = gigsResponse.gigs
        .filter(gig => gig.status === 'completed')
        .reduce((sum, gig) => sum + gig.payment.rate, 0);

      setStats({
        totalGigs,
        activeGigs,
        totalApplications,
        pendingApplications,
        totalEarnings,
        thisMonthEarnings: totalEarnings * 0.3 // Mock this month's earnings
      });

      // Mock recent activity
      setRecentActivity([
        {
          id: '1',
          type: 'application_received',
          title: 'New Application',
          description: 'Someone applied to your Web Developer gig',
          date: new Date().toISOString()
        },
        {
          id: '2',
          type: 'gig_posted',
          title: 'Gig Posted',
          description: 'Your Graphic Designer gig is now live',
          date: new Date(Date.now() - 86400000).toISOString()
        }
      ]);

    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'gig_posted':
        return <BriefcaseIcon className="w-4 h-4 text-blue-600" />;
      case 'application_received':
        return <FileTextIcon className="w-4 h-4 text-green-600" />;
      case 'gig_completed':
        return <CheckCircleIcon className="w-4 h-4 text-green-600" />;
      case 'payment_received':
        return <DollarSignIcon className="w-4 h-4 text-green-600" />;
      default:
        return <AlertCircleIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4">
          {/* Header */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your gigs.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BriefcaseIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Gigs</p>
                  <p className="text-xl font-bold text-gray-900">{stats.totalGigs}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUpIcon className="w-5 h-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Active Gigs</p>
                  <p className="text-xl font-bold text-gray-900">{stats.activeGigs}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileTextIcon className="w-5 h-5 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Applications</p>
                  <p className="text-xl font-bold text-gray-900">{stats.totalApplications}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <DollarSignIcon className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-xl font-bold text-gray-900">₹{stats.totalEarnings.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Gigs */}
            <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Gigs</h2>
                  <button
                    onClick={() => navigate('/my-gigs')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View All
                  </button>
                </div>
              </div>
              <div className="p-6">
                {recentGigs.length === 0 ? (
                  <div className="text-center py-8">
                    <BriefcaseIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No gigs yet</h3>
                    <p className="text-gray-500 mb-4">Start by posting your first gig</p>
                    <button
                      onClick={() => navigate('/main')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Post a Gig
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentGigs.map((gig) => (
                      <div key={gig._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 mb-1">{gig.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                              <span className="flex items-center gap-1">
                                <MapPinIcon className="w-4 h-4" />
                                {gig.location.address}
                              </span>
                              <span className="flex items-center gap-1">
                                <CalendarIcon className="w-4 h-4" />
                                {formatDate(gig.createdAt)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(gig.status)}`}>
                                {gig.status.charAt(0).toUpperCase() + gig.status.slice(1)}
                              </span>
                              <span className="text-sm text-gray-500">
                                {gig.applicationsCount || 0} applications
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">₹{gig.payment.rate}</div>
                            <div className="text-sm text-gray-500">{gig.payment.paymentType}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Quick Actions & Recent Activity */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/main')}
                  className="w-full flex items-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <BriefcaseIcon className="w-5 h-5 mr-3" />
                  Post New Gig
                </button>
                <button
                  onClick={() => navigate('/applications')}
                  className="w-full flex items-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FileTextIcon className="w-5 h-5 mr-3" />
                  View Applications
                </button>
                <button
                  onClick={() => navigate('/profile')}
                  className="w-full flex items-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <UserIcon className="w-5 h-5 mr-3" />
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Pending Actions */}
            {stats.pendingApplications > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircleIcon className="w-5 h-5 text-yellow-600 mr-2" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">Action Required</h3>
                    <p className="text-sm text-yellow-700">
                      You have {stats.pendingApplications} pending application{stats.pendingApplications > 1 ? 's' : ''} to review
                    </p>
                    <button
                      onClick={() => navigate('/my-gigs')}
                      className="text-sm text-yellow-800 font-medium hover:underline mt-1"
                    >
                      Review now →
                    </button>
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
