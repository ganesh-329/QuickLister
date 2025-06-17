import api, { apiCall, handleApiError } from './api';
import {
  Gig,
  GigLocation,
  RequiredSkill,
  PaymentInfo,
  Timeline,
  Application,
  CreateGigData,
  GetGigsParams,
  GetGigsResponse,
  ApplyToGigData
} from '../../../shared/types';

// Re-export types for backward compatibility
export type {
  Gig,
  GigLocation,
  RequiredSkill,
  PaymentInfo,
  Timeline,
  Application,
  CreateGigData,
  GetGigsParams,
  GetGigsResponse,
  ApplyToGigData
};

// All interfaces are now imported from shared types

export class GigService {
  // Get all gigs with filters
  static async getGigs(params: GetGigsParams = {}): Promise<GetGigsResponse> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, v.toString()));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });

    return await apiCall<GetGigsResponse>(
      () => api.get(`/gigs?${queryParams.toString()}`)
    );
  }

  // Get gig by ID
  static async getGigById(id: string): Promise<{ gig: Gig }> {
    return await apiCall<{ gig: Gig }>(
      () => api.get(`/gigs/${id}`)
    );
  }

  // Create a new gig
  static async createGig(data: CreateGigData): Promise<{ gig: Gig }> {
    return await apiCall<{ gig: Gig }>(
      () => api.post('/gigs', data)
    );
  }

  // Update a gig
  static async updateGig(id: string, data: Partial<CreateGigData>): Promise<{ gig: Gig }> {
    return await apiCall<{ gig: Gig }>(
      () => api.put(`/gigs/${id}`, data)
    );
  }

  // Delete a gig
  static async deleteGig(id: string): Promise<void> {
    return await apiCall<void>(
      () => api.delete(`/gigs/${id}`)
    );
  }

  // Search gigs
  static async searchGigs(query: string, lat?: number, lng?: number): Promise<GetGigsResponse> {
    const params = new URLSearchParams({ search: query });
    if (lat !== undefined && lng !== undefined) {
      params.append('lat', lat.toString());
      params.append('lng', lng.toString());
    }

    return await apiCall<GetGigsResponse>(
      () => api.get(`/gigs?${params.toString()}`)
    );
  }

  // Apply to a gig
  static async applyToGig(gigId: string, data: ApplyToGigData): Promise<{ gig: Gig }> {
    return await apiCall<{ gig: Gig }>(
      () => api.post(`/gigs/${gigId}/apply`, data)
    );
  }

  // Accept an application
  static async acceptApplication(gigId: string, applicationId: string): Promise<{ gig: Gig }> {
    return await apiCall<{ gig: Gig }>(
      () => api.put(`/gigs/${gigId}/applications/${applicationId}/accept`)
    );
  }

  // Get user's posted gigs
  static async getUserPostedGigs(params: { page?: number; limit?: number; status?: string } = {}): Promise<GetGigsResponse> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    return await apiCall<GetGigsResponse>(
      () => api.get(`/gigs/user/posted?${queryParams.toString()}`)
    );
  }

  // Get user's applications
  static async getUserApplications(params: { page?: number; limit?: number; status?: string } = {}): Promise<{ success: boolean; data?: { applications: any[] }; message?: string }> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    try {
      const response = await api.get(`/gigs/user/applications?${queryParams.toString()}`);
      return response.data;
    } catch (error: any) {
      const apiError = handleApiError(error);
      throw new Error(apiError.code || 'Failed to fetch user applications');
    }
  }

  // Get applications for a specific gig (for gig posters)
  static async getGigApplications(gigId: string, params: { page?: number; limit?: number; status?: string } = {}): Promise<{ applications: any[]; gig: any; pagination: any }> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    return await apiCall<{ applications: any[]; gig: any; pagination: any }>(
      () => api.get(`/applications/gig/${gigId}?${queryParams.toString()}`)
    );
  }

  // Reject an application
  static async rejectApplication(gigId: string, applicationId: string): Promise<{ gig: Gig }> {
    return await apiCall<{ gig: Gig }>(
      () => api.put(`/gigs/${gigId}/applications/${applicationId}/reject`)
    );
  }
}

export default GigService;
