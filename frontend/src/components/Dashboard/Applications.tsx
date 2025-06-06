import React, { useState, useEffect } from 'react';
import { FileTextIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';
import GigService from '../../services/gigService';
import LoadingSpinner from '../UI/LoadingSpinner';

interface Application {
  application: {
    _id: string;
    status: 'pending' | 'accepted' | 'rejected';
    appliedAt: string;
    message?: string;
    proposedRate?: number;
  };
  gig: {
    _id: string;
    title: string;
    description: string;
    location: {
      address: string;
      city?: string;
      state?: string;
      country?: string;
    };
    payment: {
      rate: number;
      currency: string;
    };
    poster: {
      name: string;
      email: string;
    };
  };
}

const statusConfig = {
  pending: {
    icon: ClockIcon,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    label: 'Pending'
  },
  accepted: {
    icon: CheckCircleIcon,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    label: 'Accepted'
  },
  rejected: {
    icon: XCircleIcon,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    label: 'Rejected'
  }
};

export const Applications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      console.log('Fetching applications...');
      
      const response = await GigService.getUserApplications();
      // console.log('Full API Response:', JSON.stringify(response, null, 2));
      
      if (!response) {
        throw new Error('No response from server');
      }
      
      if (!response.success) {
        const errorMsg = response.message || 'Failed to load applications';
        console.error('API Error:', errorMsg);
        throw new Error(errorMsg);
      }

      // Extract applications from the response
      const applicationsData = response.data?.applications || [];
      // console.log('Raw applications data:', JSON.stringify(applicationsData, null, 2));
      
      if (!Array.isArray(applicationsData)) {
        console.error('Invalid applications data format:', applicationsData);
        throw new Error('Invalid applications data format');
      }
      
      if (applicationsData.length === 0) {
        console.log('No applications found');
        setApplications([]);
        return;
      }

      // Map the data to match our Application interface
      const mappedApplications = applicationsData
        .map((item: any) => {
          try {
            let appData: Application | null = null;
            
            // Check if the item is already in the expected format
            if (item.application && item._id) {
              appData = {
                application: {
                  _id: item.application._id || '',
                  status: (item.application.status || 'pending') as 'pending' | 'accepted' | 'rejected',
                  appliedAt: item.application.appliedAt || new Date().toISOString(),
                  message: item.application.message || '',
                  proposedRate: item.application.proposedRate || 0
                },
                gig: {
                  _id: item._id,
                  title: item.title || 'Untitled Gig',
                  description: item.description || '',
                  location: {
                    address: item.location?.address || 'No address provided',
                    city: item.location?.city || '',
                    state: item.location?.state || '',
                    country: item.location?.country || ''
                  },
                  payment: {
                    rate: item.payment?.rate || 0,
                    currency: item.payment?.currency || 'USD'
                  },
                  poster: {
                    name: item.poster?.name || 'Unknown',
                    email: item.poster?.email || ''
                  }
                }
              };
            } 
            // If the item is just the application object itself
            else if (item._id && item.status) {
              appData = {
                application: {
                  _id: item._id,
                  status: (item.status || 'pending') as 'pending' | 'accepted' | 'rejected',
                  appliedAt: item.appliedAt || new Date().toISOString(),
                  message: item.message || '',
                  proposedRate: item.proposedRate || 0
                },
                gig: {
                  _id: item.gigId || '',
                  title: item.gigTitle || 'Untitled Gig',
                  description: item.gigDescription || '',
                  location: {
                    address: item.location?.address || 'No address provided',
                    city: item.location?.city || '',
                    state: item.location?.state || '',
                    country: item.location?.country || ''
                  },
                  payment: {
                    rate: item.payment?.rate || 0,
                    currency: item.payment?.currency || 'USD'
                  },
                  poster: {
                    name: item.poster?.name || 'Unknown',
                    email: item.poster?.email || ''
                  }
                }
              };
            }
            
            if (!appData) {
              console.warn('Unexpected application format:', item);
              return null;
            }
            
            return appData;
          } catch (mapError) {
            console.error('Error mapping application:', mapError, item);
            return null;
          }
        })
        .filter((app): app is Application => {
          if (!app) return false;
          // Additional validation to ensure the app matches the Application interface
          return !!(app.application && app.gig);
        });

      console.log('Mapped applications:', mappedApplications);
      
      if (mappedApplications.length === 0) {
        console.log('No valid applications after mapping');
        setApplications([]);
        return;
      }
      
      setApplications(mappedApplications);
    } catch (err) {
      setError('Failed to load applications');
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
        <div className="max-w-6xl mx-auto p-4">
          <div className="flex items-center mb-4">
            <FileTextIcon className="w-6 h-6 text-blue-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {applications.length === 0 ? (
            <div className="text-center py-12">
              <FileTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
              <p className="text-gray-500 mb-6">You haven't applied to any gigs yet.</p>
              <button
                onClick={() => window.location.href = '/main'}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Jobs
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => {
                const config = statusConfig[application.application.status];
                const StatusIcon = config.icon;

                return (
                  <div
                    key={application.application._id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 mr-3">
                            {application.gig.title}
                          </h3>
                          <div
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bgColor} ${config.color} ${config.borderColor}`}
                          >
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {config.label}
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mb-2">{application.gig.poster.name}</p>
                        <p className="text-sm text-gray-500 mb-2">{application.gig.location.address}</p>
                        
                        <div className="flex items-center text-sm text-gray-500">
                          <ClockIcon className="w-4 h-4 mr-1" />
                          Applied on {formatDate(application.application.appliedAt)}
                        </div>

                        {application.application.proposedRate && (
                          <div className="mt-2 text-sm text-gray-600">
                            Proposed Rate: {application.gig.payment.currency} {application.application.proposedRate}
                          </div>
                        )}
                      </div>
                    </div>

                    {application.application.message && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-600">{application.application.message}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Applications;
