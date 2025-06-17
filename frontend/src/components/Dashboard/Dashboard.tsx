import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BriefcaseIcon,
  FileTextIcon,
  UserIcon,
  DollarSignIcon,
  AlertCircleIcon,
  TrendingUpIcon,
  MapPinIcon,
  CalendarIcon,
  RefreshCwIcon,
} from 'lucide-react';
import { useDashboardStore } from '../../stores/dashboardStore';
import LoadingSpinner from '../UI/LoadingSpinner';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { 
    dashboardData, 
    loading, 
    error, 
    fetchDashboardData, 
    refreshDashboard, 
    clearError 
  } = useDashboardStore();

  useEffect(() => {
    // Fetch dashboard data on component mount
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRefresh = async () => {
    await refreshDashboard();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'posted':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
      case 'assigned':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getApplicationStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'withdrawn':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && !dashboardData) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const stats = dashboardData?.stats;
  const recentGigs = dashboardData?.recentGigs || [];
  const recentApplications = dashboardData?.recentApplications || [];

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your gigs.</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCwIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <p className="text-red-800">{error}</p>
                <button
                  onClick={clearError}
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BriefcaseIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Gigs</p>
                  <p className="text-xl font-bold text-gray-900">{stats?.totalGigs || 0}</p>
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
                  <p className="text-xl font-bold text-gray-900">{stats?.activeGigs || 0}</p>
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
                  <p className="text-xl font-bold text-gray-900">{stats?.totalApplications || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <DollarSignIcon className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(stats?.totalEarnings || 0)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{stats?.completedGigs || 0}</p>
                <p className="text-sm text-gray-600">Completed Gigs</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{stats?.pendingApplications || 0}</p>
                <p className="text-sm text-gray-600">Pending Applications</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{stats?.totalViews || 0}</p>
                <p className="text-sm text-gray-600">Total Views</p>
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
                                  {gig.status.charAt(0).toUpperCase() + gig.status.slice(1).replace('_', ' ')}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {gig.applicationsCount || 0} applications
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-900">{formatCurrency(gig.payment.rate)}</div>
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

              {/* Recent Applications */}
              {recentApplications.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Applications</h2>
                  <div className="space-y-3">
                    {recentApplications.slice(0, 3).map((application) => (
                      <div key={application._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getApplicationStatusColor(application.status)}`}>
                              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(application.appliedAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {formatCurrency(application.proposedRate || application.gigPayment.rate)}
                          </p>
                          <p className="text-xs text-gray-500">{application.gigPayment.paymentType}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => navigate('/applications')}
                    className="w-full mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View All Applications →
                  </button>
                </div>
              )}

              {/* Pending Actions */}
              {stats && stats.pendingApplications > 0 && (
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

              {/* Earnings Summary */}
              {stats && (stats.totalEarnings > 0 || stats.pendingEarnings > 0) && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Earnings Summary</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Earned:</span>
                      <span className="font-semibold text-green-600">{formatCurrency(stats.totalEarnings)}</span>
                    </div>
                    {stats.pendingEarnings > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pending:</span>
                        <span className="font-semibold text-yellow-600">{formatCurrency(stats.pendingEarnings)}</span>
                      </div>
                    )}
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
