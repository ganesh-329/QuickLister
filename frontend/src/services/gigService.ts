import api, { apiCall } from './api';

// Types
export interface GigLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
  address: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  landmark?: string;
}

export interface RequiredSkill {
  name: string;
  category: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  isRequired: boolean;
}

export interface PaymentInfo {
  rate: number;
  currency: string;
  paymentType: 'hourly' | 'fixed' | 'daily' | 'weekly';
  totalBudget?: number;
  advancePayment?: number;
  paymentMethod: 'cash' | 'upi' | 'bank_transfer' | 'razorpay';
}

export interface Timeline {
  startDate?: string;
  endDate?: string;
  duration?: number; // in hours
  deadline?: string;
  isFlexible: boolean;
  preferredTime?: 'morning' | 'afternoon' | 'evening' | 'night' | 'anytime';
}

export interface Application {
  _id: string;
  applicantId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  appliedAt: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  proposedRate?: number;
  message?: string;
  portfolioLinks?: string[];
  estimatedDuration?: number;
  availability?: string;
}

export interface Gig {
  _id: string;
  title: string;
  description: string;
  category: string;
  subCategory?: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  location: GigLocation;
  isRemote: boolean;
  allowsRemote: boolean;
  serviceRadius?: number;
  skills: RequiredSkill[];
  experienceLevel: 'entry' | 'intermediate' | 'experienced' | 'expert';
  toolsRequired?: string[];
  materialsProvided: boolean;
  payment: PaymentInfo;
  timeline: Timeline;
  status: 'draft' | 'posted' | 'active' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'expired';
  posterId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  applications: Application[];
  views: number;
  applicationsCount: number;
  completionDate?: string;
  images?: string[];
  documents?: string[];
  contactPreference: 'phone' | 'message' | 'both';
  isRecurring: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  safetyRequirements?: string[];
  qualityStandards?: string[];
  postedAt: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGigData {
  title: string;
  description: string;
  category: string;
  subCategory?: string;
  urgency?: 'low' | 'medium' | 'high' | 'urgent';
  location: GigLocation;
  isRemote?: boolean;
  allowsRemote?: boolean;
  serviceRadius?: number;
  skills: RequiredSkill[];
  experienceLevel?: 'entry' | 'intermediate' | 'experienced' | 'expert';
  toolsRequired?: string[];
  materialsProvided?: boolean;
  payment: PaymentInfo;
  timeline: Timeline;
  images?: string[];
  documents?: string[];
  contactPreference?: 'phone' | 'message' | 'both';
  isRecurring?: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  safetyRequirements?: string[];
  qualityStandards?: string[];
}

export interface GetGigsParams {
  page?: number;
  limit?: number;
  category?: string;
  skills?: string | string[];
  minRate?: number;
  maxRate?: number;
  urgency?: 'low' | 'medium' | 'high' | 'urgent';
  paymentType?: 'hourly' | 'fixed' | 'daily' | 'weekly';
  search?: string;
  lat?: number;
  lng?: number;
  radius?: number;
}

export interface GetGigsResponse {
  gigs: Gig[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApplyToGigData {
  message?: string;
  proposedRate?: number;
  portfolioLinks?: string[];
  estimatedDuration?: number;
  availability?: string;
}

// Gig Service
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
    await apiCall<void>(
      () => api.delete(`/gigs/${id}`)
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
  static async getUserApplications(params: { page?: number; limit?: number; status?: string } = {}): Promise<{ applications: any[] }> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    return await apiCall<{ applications: any[] }>(
      () => api.get(`/gigs/user/applications?${queryParams.toString()}`)
    );
  }

  // Search gigs by text
  static async searchGigs(searchTerm: string, lat?: number, lng?: number, radius: number = 15): Promise<{ gigs: Gig[] }> {
    const params: GetGigsParams = {
      search: searchTerm,
      radius
    };

    if (lat && lng) {
      params.lat = lat;
      params.lng = lng;
    }

    const response = await this.getGigs(params);
    return { gigs: response.gigs };
  }

  // Get gigs by category
  static async getGigsByCategory(category: string, lat?: number, lng?: number): Promise<{ gigs: Gig[] }> {
    const params: GetGigsParams = { category };

    if (lat && lng) {
      params.lat = lat;
      params.lng = lng;
    }

    const response = await this.getGigs(params);
    return { gigs: response.gigs };
  }

  // Get gigs by skills
  static async getGigsBySkills(skills: string[], lat?: number, lng?: number): Promise<{ gigs: Gig[] }> {
    const params: GetGigsParams = { skills };

    if (lat && lng) {
      params.lat = lat;
      params.lng = lng;
    }

    const response = await this.getGigs(params);
    return { gigs: response.gigs };
  }
}

export default GigService;
