import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import GigService, { Gig, GetGigsParams, CreateGigData, ApplyToGigData } from '../services/gigService';

interface GigState {
  // State
  gigs: Gig[];
  selectedGig: Gig | null;
  userPostedGigs: Gig[];
  userApplications: any[];
  loading: boolean;
  error: string | null;
  
  // Filters and search
  filters: GetGigsParams;
  searchQuery: string;
  userLocation: { lat: number; lng: number } | null;
  
  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };

  // Actions
  fetchGigs: (params?: GetGigsParams) => Promise<void>;

  fetchGigById: (id: string) => Promise<void>;
  createGig: (data: CreateGigData) => Promise<Gig>;
  updateGig: (id: string, data: Partial<CreateGigData>) => Promise<void>;
  deleteGig: (id: string) => Promise<void>;
  applyToGig: (gigId: string, data: ApplyToGigData) => Promise<void>;
  acceptApplication: (gigId: string, applicationId: string) => Promise<void>;
  fetchUserPostedGigs: () => Promise<void>;
  fetchUserApplications: () => Promise<void>;
  searchGigs: (query: string) => Promise<void>;
  
  // Utility actions
  setFilters: (filters: Partial<GetGigsParams>) => void;
  clearFilters: () => void;
  setUserLocation: (location: { lat: number; lng: number }) => void;
  setSelectedGig: (gig: Gig | null) => void;
  clearError: () => void;
}

export const useGigStore = create<GigState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    gigs: [],
    selectedGig: null,
    userPostedGigs: [],
    userApplications: [],
    loading: false,
    error: null,
    
    filters: {},
    searchQuery: '',
    userLocation: null,
    
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      pages: 0,
    },

    // Fetch all gigs with filters
    fetchGigs: async (params?: GetGigsParams) => {
      try {
        set({ loading: true, error: null });
        
        const { filters, userLocation } = get();
        const mergedParams = {
          ...filters,
          ...params,
          ...(userLocation && { lat: userLocation.lat, lng: userLocation.lng }),
        };
        
        const response = await GigService.getGigs(mergedParams);
        
        set({
          gigs: response.gigs,
          pagination: response.pagination,
          loading: false,
        });
      } catch (error: any) {
        set({ 
          error: error.message,
          loading: false,
          gigs: [],
        });
      }
    },



    // Fetch gig by ID
    fetchGigById: async (id: string) => {
      try {
        set({ loading: true, error: null });
        
        const response = await GigService.getGigById(id);
        
        set({
          selectedGig: response.gig,
          loading: false,
        });
      } catch (error: any) {
        set({ 
          error: error.message,
          loading: false,
          selectedGig: null,
        });
      }
    },

    // Create a new gig
    createGig: async (data: CreateGigData) => {
      try {
        set({ loading: true, error: null });
        
        const response = await GigService.createGig(data);
        
        // Add to gigs list if it matches current filters
        const { gigs } = get();
        set({
          gigs: [response.gig, ...gigs],
          loading: false,
        });
        
        return response.gig;
      } catch (error: any) {
        set({ 
          error: error.message,
          loading: false,
        });
        throw error;
      }
    },

    // Update a gig
    updateGig: async (id: string, data: Partial<CreateGigData>) => {
      try {
        set({ loading: true, error: null });
        
        const response = await GigService.updateGig(id, data);
        
        // Update in gigs list
        const { gigs, selectedGig } = get();
        const updatedGigs = gigs.map(gig => 
          gig._id === id ? response.gig : gig
        );
        
        set({
          gigs: updatedGigs,
          selectedGig: selectedGig?._id === id ? response.gig : selectedGig,
          loading: false,
        });
      } catch (error: any) {
        set({ 
          error: error.message,
          loading: false,
        });
        throw error;
      }
    },

    // Delete a gig
    deleteGig: async (id: string) => {
      try {
        set({ loading: true, error: null });
        
        await GigService.deleteGig(id);
        
        // Remove from gigs list
        const { gigs, selectedGig } = get();
        const updatedGigs = gigs.filter(gig => gig._id !== id);
        
        set({
          gigs: updatedGigs,
          selectedGig: selectedGig?._id === id ? null : selectedGig,
          loading: false,
        });
      } catch (error: any) {
        set({ 
          error: error.message,
          loading: false,
        });
        throw error;
      }
    },

    // Apply to a gig
    applyToGig: async (gigId: string, data: ApplyToGigData) => {
      try {
        set({ loading: true, error: null });
        
        const response = await GigService.applyToGig(gigId, data);
        
        // Update the gig in the store
        const { gigs, selectedGig } = get();
        const updatedGigs = gigs.map(gig => 
          gig._id === gigId ? response.gig : gig
        );
        
        set({
          gigs: updatedGigs,
          selectedGig: selectedGig?._id === gigId ? response.gig : selectedGig,
          loading: false,
        });
      } catch (error: any) {
        set({ 
          error: error.message,
          loading: false,
        });
        throw error;
      }
    },

    // Accept an application
    acceptApplication: async (gigId: string, applicationId: string) => {
      try {
        set({ loading: true, error: null });
        
        const response = await GigService.acceptApplication(gigId, applicationId);
        
        // Update the gig in the store
        const { gigs, selectedGig, userPostedGigs } = get();
        const updatedGigs = gigs.map(gig => 
          gig._id === gigId ? response.gig : gig
        );
        const updatedUserPostedGigs = userPostedGigs.map(gig => 
          gig._id === gigId ? response.gig : gig
        );
        
        set({
          gigs: updatedGigs,
          userPostedGigs: updatedUserPostedGigs,
          selectedGig: selectedGig?._id === gigId ? response.gig : selectedGig,
          loading: false,
        });
      } catch (error: any) {
        set({ 
          error: error.message,
          loading: false,
        });
        throw error;
      }
    },

    // Fetch user's posted gigs
    fetchUserPostedGigs: async () => {
      try {
        set({ loading: true, error: null });
        
        const response = await GigService.getUserPostedGigs();
        
        set({
          userPostedGigs: response.gigs,
          loading: false,
        });
      } catch (error: any) {
        set({ 
          error: error.message,
          loading: false,
          userPostedGigs: [],
        });
      }
    },

    // Fetch user's applications
    fetchUserApplications: async () => {
      try {
        set({ loading: true, error: null });
        
        const response = await GigService.getUserApplications();
        
        set({
          userApplications: response.applications,
          loading: false,
        });
      } catch (error: any) {
        set({ 
          error: error.message,
          loading: false,
          userApplications: [],
        });
      }
    },

    // Search gigs
    searchGigs: async (query: string) => {
      try {
        set({ loading: true, error: null, searchQuery: query });
        
        const { userLocation } = get();
        const response = await GigService.searchGigs(
          query,
          userLocation?.lat,
          userLocation?.lng
        );
        
        set({
          gigs: response.gigs,
          loading: false,
        });
      } catch (error: any) {
        set({ 
          error: error.message,
          loading: false,
          gigs: [],
        });
      }
    },

    // Set filters
    setFilters: (newFilters: Partial<GetGigsParams>) => {
      const { filters } = get();
      set({ 
        filters: { ...filters, ...newFilters },
      });
    },

    // Clear filters
    clearFilters: () => {
      set({ 
        filters: {},
        searchQuery: '',
      });
    },

    // Set user location
    setUserLocation: (location: { lat: number; lng: number }) => {
      set({ userLocation: location });
    },

    // Set selected gig
    setSelectedGig: (gig: Gig | null) => {
      set({ selectedGig: gig });
    },

    // Clear error
    clearError: () => {
      set({ error: null });
    },
  }))
);

export default useGigStore;
