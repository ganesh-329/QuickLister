import { create } from 'zustand';
import dashboardService, { DashboardData } from '../services/dashboardService';

interface DashboardState {
  // State
  dashboardData: DashboardData | null;
  loading: boolean;
  error: string | null;
  lastFetched: Date | null;

  // Actions
  fetchDashboardData: () => Promise<void>;
  clearError: () => void;
  refreshDashboard: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  // Initial state
  dashboardData: null,
  loading: false,
  error: null,
  lastFetched: null,

  // Fetch dashboard data
  fetchDashboardData: async () => {
    try {
      set({ loading: true, error: null });
      
      const data = await dashboardService.getDashboardStats();
      
      set({
        dashboardData: data,
        loading: false,
        lastFetched: new Date(),
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch dashboard data',
        loading: false,
      });
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Refresh dashboard (force refetch)
  refreshDashboard: async () => {
    const { fetchDashboardData } = get();
    await fetchDashboardData();
  },
})); 