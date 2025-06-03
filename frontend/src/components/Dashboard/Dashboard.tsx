import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useGigStore } from '../../stores/gigStore';
import { useAuth } from '../Auth/AuthContext';
import { BriefcaseIcon, FileTextIcon, EyeIcon, TrendingUpIcon } from 'lucide-react';
import { MyGigs } from './MyGigs';
import FloatingActionButton from '../UI/FloatingActionButton';

// Applications Component
const Applications: React.FC = () => {
  const { userApplications, fetchUserApplications, loading } = useGigStore();

  useEffect(() => {
    fetchUserApplications();
  }, [fetchUserApplications]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
          <p className="mt-2 text-gray-600">
            Track all your job applications and their status.
          </p>
        </div>

        {userApplications.length > 0 ? (
          <div className="grid gap-6">
            {userApplications.map((application: any) => (
              <div key={application._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{application.title}</h3>
                    <p className="text-gray-600 mt-1">{application.description}</p>
                    <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                      <span>Applied: {new Date(application.application.appliedAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>Budget: ₹{application.budget}</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                      application.application.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800'
                        : application.application.status === 'accepted'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {application.application.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-500">Start applying to gigs to see them here!</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Dashboard Overview Component
const DashboardOverview: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { userPostedGigs, userApplications, fetchUserPostedGigs, fetchUserApplications, loading } = useGigStore();

  useEffect(() => {
    fetchUserPostedGigs();
    fetchUserApplications();
  }, [fetchUserPostedGigs, fetchUserApplications]);

  // Calculate stats
  const totalGigsPosted = userPostedGigs.length;
  const totalApplications = userApplications.length;
  const activeGigs = userPostedGigs.filter(gig => gig.status === 'posted').length;
  const totalViews = userPostedGigs.reduce((sum, gig) => sum + gig.views, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="mt-2 text-gray-600">
            Here's what's happening with your gigs and applications.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Gigs Posted</p>
                <p className="text-3xl font-bold text-gray-900">{totalGigsPosted}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <BriefcaseIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              {activeGigs} currently active
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Applications Sent</p>
                <p className="text-3xl font-bold text-gray-900">{totalApplications}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FileTextIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Across all gigs
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-3xl font-bold text-gray-900">{totalViews}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <EyeIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              On your gigs
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalGigsPosted > 0 ? Math.round((activeGigs / totalGigsPosted) * 100) : 0}%
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <TrendingUpIcon className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Gig completion rate
            </p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Gigs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Gigs</h2>
                <button
                  onClick={() => navigate('/dashboard/my-gigs')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all →
                </button>
              </div>
            </div>
            <div className="p-6">
              {userPostedGigs.length > 0 ? (
                <div className="space-y-4">
                  {userPostedGigs.slice(0, 3).map((gig) => (
                    <div key={gig._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 truncate">{gig.title}</h3>
                        <p className="text-sm text-gray-500">
                          {gig.applicationsCount} applications • {gig.views} views
                        </p>
                      </div>
                      <div className="ml-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          gig.status === 'posted' 
                            ? 'bg-green-100 text-green-800'
                            : gig.status === 'assigned'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {gig.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BriefcaseIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No gigs posted yet</p>
                  <p className="text-sm text-gray-400 mt-1">Create your first gig to get started!</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Applications */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
                <button
                  onClick={() => navigate('/dashboard/applications')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all →
                </button>
              </div>
            </div>
            <div className="p-6">
              {userApplications.length > 0 ? (
                <div className="space-y-4">
                  {userApplications.slice(0, 3).map((application: any) => (
                    <div key={application._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 truncate">{application.title}</h3>
                        <p className="text-sm text-gray-500">
                          Applied {new Date(application.application.appliedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="ml-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          application.application.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : application.application.status === 'accepted'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {application.application.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileTextIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No applications yet</p>
                  <p className="text-sm text-gray-400 mt-1">Start applying to gigs to see them here!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <>
      <Routes>
        <Route path="/" element={<DashboardOverview />} />
        <Route path="/my-gigs" element={<MyGigs />} />
        <Route path="/applications" element={<Applications />} />
      </Routes>
      
      {/* Floating Action Button for creating new gigs */}
      <FloatingActionButton 
        isAuthenticated={!!user}
      />
    </>
  );
};

export default Dashboard;
