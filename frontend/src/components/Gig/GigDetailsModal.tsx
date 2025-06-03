import React, { useState } from 'react';
import { DollarSignIcon, MapPinIcon, ClockIcon, StarIcon, UserIcon, CalendarIcon, TagIcon } from 'lucide-react';
import { Gig } from '../../services/gigService';
import { useGigStore } from '../../stores/gigStore';
import { useAuth } from '../Auth/AuthContext';

interface GigDetailsModalProps {
  gig: Gig;
  onApply?: () => void;
  onClose?: () => void;
}

const GigDetailsModal: React.FC<GigDetailsModalProps> = ({
  gig,
  onApply,
  onClose
}) => {
  const { applyToGig, loading } = useGigStore();
  const { user, isAuthenticated } = useAuth();
  const [applicationData, setApplicationData] = useState({
    message: '',
    proposedRate: gig.payment.rate,
    estimatedDuration: gig.timeline.duration || 1
  });
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Check if user has already applied
  const hasApplied = gig.applications.some(app => {
    const applicantId = typeof app.applicantId === 'string' ? app.applicantId : app.applicantId._id;
    return applicantId === user?.id;
  });

  // Check if this is user's own gig
  const posterId = typeof gig.posterId === 'string' ? gig.posterId : gig.posterId._id;
  const isOwnGig = posterId === user?.id;

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      setError('Please login to apply for this gig');
      return;
    }
    if (isOwnGig) {
      setError('You cannot apply to your own gig');
      return;
    }
    if (hasApplied) {
      setError('You have already applied to this gig');
      return;
    }
    setShowApplicationForm(true);
  };

  const handleSubmitApplication = async () => {
    setError(null);
    try {
      await applyToGig(gig._id, {
        message: applicationData.message,
        proposedRate: applicationData.proposedRate,
        estimatedDuration: applicationData.estimatedDuration
      });
      setSuccess(true);
      setShowApplicationForm(false);
      onApply?.();
    } catch (err: any) {
      setError(err.message || 'Failed to apply to gig');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: gig.payment.currency || 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="text-green-600 text-6xl mb-4">✓</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Application Submitted!</h3>
        <p className="text-gray-600 mb-4">
          Your application has been sent to the gig poster. They will review it and get back to you.
        </p>
        <button
          onClick={onClose}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex items-start justify-between mb-3">
          <h2 className="text-2xl font-bold text-gray-900 flex-1">{gig.title}</h2>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(gig.urgency)}`}>
            {gig.urgency.charAt(0).toUpperCase() + gig.urgency.slice(1)}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center">
            <DollarSignIcon size={16} className="mr-1 text-green-600" />
            <span className="font-semibold text-green-700">
              {formatCurrency(gig.payment.rate)}
              {gig.payment.paymentType === 'hourly' && '/hr'}
            </span>
          </div>
          
          <div className="flex items-center">
            <MapPinIcon size={16} className="mr-1" />
            <span>{gig.location.address}</span>
          </div>
          
          {gig.timeline.duration && (
            <div className="flex items-center">
              <ClockIcon size={16} className="mr-1" />
              <span>{gig.timeline.duration} hours</span>
            </div>
          )}
          
          <div className="flex items-center">
            <CalendarIcon size={16} className="mr-1" />
            <span>Posted {formatDate(gig.postedAt)}</span>
          </div>
        </div>
      </div>

      {/* Poster Information */}
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
        <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
          <UserIcon size={24} className="text-blue-600" />
        </div>
        <div>
          <div className="font-medium text-gray-900">
            Posted by {gig.posterId.name || 'Anonymous'}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <StarIcon size={16} className="mr-1 text-yellow-400 fill-current" />
            <span>4.8 (124 reviews)</span>
          </div>
        </div>
        <div className="ml-auto text-sm text-gray-500">
          {gig.applicationsCount} applications
        </div>
      </div>

      {/* Description */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
        <p className="text-gray-700 leading-relaxed">{gig.description}</p>
      </div>

      {/* Skills */}
      {gig.skills.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
            <TagIcon size={16} className="mr-1" />
            Required Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {gig.skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
              >
                {skill.name}
                {skill.isRequired && <span className="ml-1 text-blue-600">*</span>}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Additional Details */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium text-gray-700">Experience Level:</span>
          <span className="ml-2 text-gray-600 capitalize">{gig.experienceLevel}</span>
        </div>
        <div>
          <span className="font-medium text-gray-700">Payment Method:</span>
          <span className="ml-2 text-gray-600 capitalize">{gig.payment.paymentMethod.replace('_', ' ')}</span>
        </div>
        <div>
          <span className="font-medium text-gray-700">Timeline:</span>
          <span className="ml-2 text-gray-600">{gig.timeline.isFlexible ? 'Flexible' : 'Fixed'}</span>
        </div>
        <div>
          <span className="font-medium text-gray-700">Remote Work:</span>
          <span className="ml-2 text-gray-600">{gig.allowsRemote ? 'Allowed' : 'On-site only'}</span>
        </div>
      </div>

      {/* Application Form */}
      {showApplicationForm && (
        <div className="border-t pt-6">
          <h3 className="font-semibold text-gray-900 mb-4">Apply for this Gig</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cover Message
              </label>
              <textarea
                value={applicationData.message}
                onChange={(e) => setApplicationData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Why are you the right person for this job?"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Rate ({gig.payment.currency})
                </label>
                <input
                  type="number"
                  value={applicationData.proposedRate}
                  onChange={(e) => setApplicationData(prev => ({ ...prev, proposedRate: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Duration (hours)
                </label>
                <input
                  type="number"
                  value={applicationData.estimatedDuration}
                  onChange={(e) => setApplicationData(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
                  min="1"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowApplicationForm(false)}
                className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitApplication}
                disabled={loading}
                className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {!showApplicationForm && (
        <div className="border-t pt-6">
          {isOwnGig ? (
            <div className="text-center text-gray-600">
              <p>This is your gig. You cannot apply to your own posting.</p>
            </div>
          ) : hasApplied ? (
            <div className="text-center">
              <div className="text-green-600 mb-2">✓ Application Submitted</div>
              <p className="text-gray-600">You have already applied to this gig.</p>
            </div>
          ) : (
            <button
              onClick={handleApplyClick}
              className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors"
            >
              {isAuthenticated ? 'Apply Now' : 'Login to Apply'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default GigDetailsModal;
