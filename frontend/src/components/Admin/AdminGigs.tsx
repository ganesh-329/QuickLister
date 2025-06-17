import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { Card, CardHeader, CardContent } from '../UI/Card';
import { Briefcase, Trash2, AlertTriangle, DollarSign, Calendar } from 'lucide-react';

interface AdminGig {
  _id: string;
  title: string;
  category: string;
  status: string;
  payment: {
    rate: number;
    paymentType: string;
  };
  createdAt: string;
  posterName: string;
  applicationCount: number;
}

interface AdminGigsResponse {
  gigs: AdminGig[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const AdminGigs: React.FC = () => {
  const [gigsData, setGigsData] = useState<AdminGigsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchGigs();
  }, [currentPage]);

  const fetchGigs = async () => {
    try {
      setLoading(true);
      const data = await adminService.getGigs(currentPage, 20);
      setGigsData(data);
    } catch (err) {
      setError('Failed to fetch gigs');
      console.error('Gigs fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (gigId: string, newStatus: string) => {
    try {
      setActionLoading(gigId);
      await adminService.updateGigStatus(gigId, newStatus);
      await fetchGigs();
    } catch (err) {
      console.error('Status update error:', err);
      alert('Failed to update gig status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteGig = async (gigId: string) => {
    try {
      setActionLoading(gigId);
      await adminService.deleteGig(gigId);
      await fetchGigs();
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Delete gig error:', err);
      alert('Failed to delete gig');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      posted: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      assigned: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-purple-100 text-purple-800',
      completed: 'bg-emerald-100 text-emerald-800',
      cancelled: 'bg-red-100 text-red-800',
      expired: 'bg-orange-100 text-orange-800',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        statusColors[status] || 'bg-gray-100 text-gray-800'
      }`}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </span>
    );
  };

  const statusOptions = [
    'draft', 'posted', 'active', 'assigned', 'in_progress', 'completed', 'cancelled', 'expired'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600 text-center">
          <p className="mb-2">{error}</p>
          <button
            onClick={fetchGigs}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Briefcase className="h-8 w-8 text-gray-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Gig Management</h1>
        </div>
        <button
          onClick={fetchGigs}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              All Gigs ({gigsData?.total || 0})
            </h2>
            <div className="text-sm text-gray-600">
              Page {gigsData?.page} of {gigsData?.totalPages}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Title</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Posted By</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Payment</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Applications</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Posted</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {gigsData?.gigs.map((gig) => (
                  <tr key={gig._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900 max-w-xs truncate">
                        {gig.title}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {gig.category.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{gig.posterName}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="w-3 h-3 mr-1" />
                        ₹{gig.payment.rate}/{gig.payment.paymentType}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{gig.applicationCount}</td>
                    <td className="py-3 px-4">{getStatusBadge(gig.status)}</td>
                    <td className="py-3 px-4 text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(gig.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <select
                          value={gig.status}
                          onChange={(e) => handleStatusUpdate(gig._id, e.target.value)}
                          disabled={actionLoading === gig._id}
                          className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {statusOptions.map(status => (
                            <option key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => setShowDeleteConfirm(gig._id)}
                          disabled={actionLoading === gig._id}
                          className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {gigsData && gigsData.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {gigsData.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(gigsData.totalPages, prev + 1))}
                disabled={currentPage === gigsData.totalPages}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Confirm Delete</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this gig? This action cannot be undone and will also remove all applications for this gig.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteGig(showDeleteConfirm)}
                disabled={actionLoading === showDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading === showDeleteConfirm ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGigs; 