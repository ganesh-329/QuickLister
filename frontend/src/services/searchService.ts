import api, { apiCall } from './api';
import { GetGigsResponse } from '../../../shared/types';

export interface SearchResult {
  id: string;
  title: string;
  type: 'gig' | 'user' | 'location';
  description?: string;
  category?: string;
  location?: string;
  paymentRange?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  hasMore: boolean;
}

export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'popular' | 'category';
}

export class SearchService {
  // Search gigs and format results using the existing /gigs endpoint
  static async searchGigs(query: string, options: {
    page?: number;
    limit?: number;
    category?: string;
    location?: string;
  } = {}): Promise<SearchResponse> {
    const params = new URLSearchParams();
    
    // Add search query
    if (query.trim()) {
      params.append('search', query);
    }
    
    // Add other parameters
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.category) params.append('category', options.category);
    if (options.location) params.append('location', options.location);

    const response = await apiCall<GetGigsResponse>(
      () => api.get(`/gigs?${params.toString()}`)
    );

    // Transform gig results into search results
    const results: SearchResult[] = response.gigs.map(gig => ({
      id: gig._id,
      title: gig.title,
      type: 'gig' as const,
      description: gig.description,
      category: gig.category,
      location: `${gig.location.city}, ${gig.location.state}`,
      paymentRange: `$${gig.payment.rate} ${gig.payment.paymentType}`
    }));

    return {
      results,
      totalCount: response.pagination.total,
      hasMore: response.pagination.page < response.pagination.totalPages
    };
  }

  // Get search suggestions for autocomplete (fallback to popular suggestions)
  static async getSearchSuggestions(query: string): Promise<SearchSuggestion[]> {
    if (!query || query.length < 2) {
      return this.getPopularSuggestions();
    }

    // For now, return popular suggestions filtered by query
    // In the future, you could implement a backend endpoint for suggestions
    const popular = this.getPopularSuggestions();
    const filtered = popular.filter(suggestion => 
      suggestion.text.toLowerCase().includes(query.toLowerCase())
    );
    
    return filtered.length > 0 ? filtered : this.getPopularSuggestions().slice(0, 5);
  }

  // Get popular search suggestions (fallback)
  private static getPopularSuggestions(): SearchSuggestion[] {
    return [
      { id: '1', text: 'Graphic Design', type: 'popular' },
      { id: '2', text: 'Web Development', type: 'popular' },
      { id: '3', text: 'Photography', type: 'popular' },
      { id: '4', text: 'Writing & Translation', type: 'popular' },
      { id: '5', text: 'Video Editing', type: 'popular' },
      { id: '6', text: 'Social Media Marketing', type: 'popular' },
      { id: '7', text: 'Tutoring', type: 'popular' },
      { id: '8', text: 'Data Entry', type: 'popular' },
      { id: '9', text: 'Virtual Assistant', type: 'popular' },
      { id: '10', text: 'Content Writing', type: 'popular' }
    ];
  }

  // Quick search for immediate results
  static async quickSearch(query: string): Promise<SearchResult[]> {
    if (!query || query.length < 2) return [];
    
    try {
      const response = await this.searchGigs(query, { limit: 5 });
      return response.results;
    } catch (error) {
      console.error('Quick search failed:', error);
      return [];
    }
  }

  // Save search query for recent searches
  static saveRecentSearch(query: string): void {
    if (!query.trim()) return;
    
    const recentSearches = this.getRecentSearches();
    const filteredSearches = recentSearches.filter(search => search !== query);
    const updatedSearches = [query, ...filteredSearches].slice(0, 10);
    
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  }

  // Get recent searches
  static getRecentSearches(): string[] {
    try {
      const recent = localStorage.getItem('recentSearches');
      return recent ? JSON.parse(recent) : [];
    } catch (error) {
      return [];
    }
  }

  // Clear recent searches
  static clearRecentSearches(): void {
    localStorage.removeItem('recentSearches');
  }
}

export default SearchService; 