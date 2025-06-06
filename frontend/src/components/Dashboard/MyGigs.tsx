import React, { useState, useEffect } from 'react';
import GigService, { Gig } from '../../services/gigService';
import LoadingSpinner from '../UI/LoadingSpinner';
import GigApplications from './GigApplications';

export const MyGigs: React.FC = () => {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGigId, setSelectedGigId] = useState<string | null>(null);

  useEffect(() => {
    fetchMyGigs();
  }, []);

  const fetchMyGigs = async () => {
    try {
      setLoading(true);
      // Get user's posted gigs
      const response = await GigService.getUserPostedGigs();
      setGigs(response.gigs);
    } catch (err) {
      setError('Failed to load your gigs');
      console.error('Error fetching my gigs:', err);
      // For now, set empty array if API fails
      setGigs([]);
    } finally {
      setLoading(false);
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // If a gig is selected, show the applications view
  if (selectedGigId) {
    return (
      <GigApplications
        gigId={selectedGigId}
        onBack={() => setSelectedGigId(null)}
      />
    );
  }

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
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900">My Gigs</h1>
            <p className="text-gray-600 mt-1">Manage your posted gigs and track applications</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

        {gigs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No gigs posted yet</h3>
            <p className="text-gray-600 mb-4">Start by posting your first gig to connect with potential clients</p>
            <button 
              onClick={() => window.history.back()}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Post Your First Gig
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {gigs.map((gig) => (
              <div key={gig._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{gig.title}</h3>
                    <p className="text-gray-600 mb-3 line-clamp-2">{gig.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {gig.location.address}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {gig.category}
                      </span>
                      <span>Posted {formatDate(gig.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(gig.status)}`}>
                      {gig.status.charAt(0).toUpperCase() + gig.status.slice(1)}
                    </span>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">₹{gig.payment.rate}</div>
                      <div className="text-sm text-gray-500">
                        {gig.applicationsCount || 0} applications
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => setSelectedGigId(gig._id)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    View Applications
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};
