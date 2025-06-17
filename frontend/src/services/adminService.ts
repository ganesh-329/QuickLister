import api from './api';
import { AdminStats, AdminUsersResponse } from '../types';

export const adminService = {
  // Dashboard stats
  getDashboardStats: async (): Promise<AdminStats> => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data.data;
  },

  // User management
  getUsers: async (page: number = 1, limit: number = 20): Promise<AdminUsersResponse> => {
    const response = await api.get(`/admin/users?page=${page}&limit=${limit}`);
    return response.data.data;
  },

  updateUserStatus: async (userId: string, status: 'active' | 'disabled'): Promise<void> => {
    await api.patch(`/admin/users/${userId}/status`, { status });
  },

  deleteUser: async (userId: string): Promise<void> => {
    await api.delete(`/admin/users/${userId}`);
  },

  // Gig management
  getGigs: async (page: number = 1, limit: number = 20) => {
    const response = await api.get(`/admin/gigs?page=${page}&limit=${limit}`);
    return response.data.data;
  },

  updateGigStatus: async (gigId: string, status: string): Promise<void> => {
    await api.patch(`/admin/gigs/${gigId}/status`, { status });
  },

  deleteGig: async (gigId: string): Promise<void> => {
    await api.delete(`/admin/gigs/${gigId}`);
  },
}; 