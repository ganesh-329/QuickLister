import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, UserIcon, MessageCircleIcon, CheckCircleIcon, XCircleIcon, ClockIcon, MapPinIcon, DollarSignIcon } from 'lucide-react';
import GigService from '../../services/gigService';
import LoadingSpinner from '../UI/LoadingSpinner';

interface GigApplicationsProps {
  gigId: string;
  onBack: () => void;
}

interface ApplicationData {
  _id: string;
  applicantId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  message: string;
  proposedRate?: number;
  status: 'pending' | 'accepted' | 'rejected';
  appliedAt: string;
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

export const GigApplications: React.FC<GigApplicationsProps> = ({ gigId, onBack }) => {
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [gig, setGig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingApplicationId, setProcessingApplicationId] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, [gigId]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await GigService.getGigApplications(gigId);
      setApplications(response.applications);
      setGig(response.gig);
    } catch (err) {
      setError('Failed to load applications');
      console.error('Error fetching gig applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptApplication = async (applicationId: string) => {
    try {
      setProcessingApplicationId(applicationId);
      await GigService.acceptApplication(gigId, applicationId);
      // Refresh applications
      await fetchApplications();
    } catch (err) {
      console.error('Error accepting application:', err);
      setError('Failed to accept application');
    } finally {
      setProcessingApplicationId(null);
    }
  };

  const handleRejectApplication = async (applicationId: string) => {
    try {
      setProcessingApplicationId(applicationId);
      await GigService.rejectApplication(gigId, applicationId);
      // Refresh applications
      await fetchApplications();
    } catch (err) {
      console.error('Error rejecting application:', err);
      setError('Failed to reject application');
    } finally {
      setProcessingApplicationId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={onBack}
              className="flex items-center text-blue-600 hover:text-blue-800 mb-4 font-medium"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to My Gigs
            </button>


            <h2 className="text-xl font-semibold text-gray-900">
              Applications ({applications.length})
            </h2>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {applications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <UserIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
              <p className="text-gray-600">
                Your gig hasn't received any applications yet. Make sure your gig details are clear and attractive to get more applications.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => {
                const config = statusConfig[application.status] || statusConfig.pending;
                const StatusIcon = config.icon;
                const isProcessing = processingApplicationId === application._id;

                return (
                  <div
                    key={application._id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          {application.applicantId.avatar ? (
                            <img
                              src={application.applicantId.avatar}
                              alt={application.applicantId.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <UserIcon className="w-6 h-6 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {application.applicantId.name}
                          </h3>
                          <p className="text-gray-600 text-sm mb-2">
                            {application.applicantId.email}
                          </p>
                          {application.applicantId.phone && (
                            <p className="text-gray-600 text-sm mb-2">
                              {application.applicantId.phone}
                            </p>
                          )}
                          <p className="text-sm text-gray-500">
                            Applied on {formatDate(application.appliedAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bgColor} ${config.color} ${config.borderColor}`}
                        >
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {config.label}
                        </div>
                      </div>
                    </div>

                    {application.proposedRate && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Proposed Rate:</span> ₹{application.proposedRate}
                        </p>
                      </div>
                    )}

                    {application.message && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageCircleIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">Application Message</span>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {application.message}
                          </p>
                        </div>
                      </div>
                    )}

                    {application.status === 'pending' && (
                      <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => handleAcceptApplication(application._id)}
                          disabled={isProcessing}
                          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isProcessing ? (
                            <LoadingSpinner />
                          ) : (
                            <>
                              <CheckCircleIcon className="w-4 h-4" />
                              Accept
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleRejectApplication(application._id)}
                          disabled={isProcessing}
                          className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isProcessing ? (
                            <LoadingSpinner />
                          ) : (
                            <>
                              <XCircleIcon className="w-4 h-4" />
                              Reject
                            </>
                          )}
                        </button>
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

export default GigApplications;
