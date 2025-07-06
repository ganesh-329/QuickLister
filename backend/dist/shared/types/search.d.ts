export interface SearchResult {
    id: string;
    title: string;
    type: 'gig' | 'user' | 'location';
    description?: string;
    category?: string;
    location?: string;
    paymentRange?: string;
    distance?: number;
    score?: number;
    avatar?: string;
    urgency?: string;
    postedAt?: string;
}
export interface SearchGigResult {
    _id: string;
    title: string;
    description: string;
    category: string;
    subCategory?: string;
    urgency: string;
    location: {
        type: string;
        coordinates: [number, number];
        address: string;
        city?: string;
        state?: string;
        country?: string;
    };
    skills: Array<{
        name: string;
        category: string;
        proficiency: string;
        isRequired: boolean;
    }>;
    payment: {
        rate: number;
        currency: string;
        paymentType: string;
        totalBudget?: number;
        paymentMethod: string;
    };
    timeline: {
        startDate?: string;
        endDate?: string;
        duration?: number;
        deadline?: string;
        isFlexible: boolean;
        preferredTime: string;
    };
    status: string;
    poster: {
        _id: string;
        name: string;
        email: string;
        phone?: string;
        location?: string;
        avatar?: string;
    };
    applications: any[];
    applicationsCount: number;
    views: number;
    postedAt: string;
    expiresAt: string;
    experienceLevel: string;
    toolsRequired: string[];
    images: string[];
    distance?: number;
    score?: number;
}
export interface SearchUserResult {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    location?: string;
    bio?: string;
    avatar?: string;
    createdAt: string;
}
export interface SearchGigsParams {
    q?: string;
    category?: string;
    skills?: string[];
    minRate?: number;
    maxRate?: number;
    paymentType?: string;
    urgency?: string;
    experienceLevel?: string;
    lat?: number;
    lng?: number;
    radius?: number;
    sort?: string;
    page?: number;
    limit?: number;
    location?: string;
}
export interface SearchUsersParams {
    q?: string;
    skills?: string[];
    location?: string;
    lat?: number;
    lng?: number;
    radius?: number;
    sort?: string;
    page?: number;
    limit?: number;
}
export interface SearchGigsResponse {
    success: boolean;
    message: string;
    data: {
        gigs: SearchGigResult[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
            hasMore: boolean;
        };
        searchMeta: {
            query?: string;
            filters: {
                category?: string;
                skills?: string[];
                priceRange?: {
                    min?: string;
                    max?: string;
                };
                paymentType?: string;
                urgency?: string;
                experienceLevel?: string;
                location?: string;
                radius: number;
            };
            sort: string;
            resultsFound: boolean;
        };
    };
}
export interface SearchUsersResponse {
    success: boolean;
    message: string;
    data: {
        users: SearchUserResult[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
            hasMore: boolean;
        };
        searchMeta: {
            query?: string;
            filters: {
                skills?: string[];
                location?: string;
                radius: number;
            };
            sort: string;
            resultsFound: boolean;
        };
    };
}
export interface SearchSuggestion {
    id: string;
    text: string;
    type: 'recent' | 'popular' | 'category' | 'skill' | 'service' | 'gig' | 'user';
    category?: string;
    count?: number;
}
export interface SearchSuggestionsResponse {
    success: boolean;
    data: {
        suggestions: SearchSuggestion[];
    };
}
export interface PopularSearch {
    text: string;
    count: number;
    trend: 'up' | 'down' | 'stable';
}
export interface PopularSearchesResponse {
    success: boolean;
    data: {
        popularSearches: PopularSearch[];
    };
}
export interface SearchFilters {
    categories: string[];
    skills: string[];
    paymentTypes: string[];
    urgencyLevels: string[];
    experienceLevels: string[];
    priceRange: {
        min: number;
        max: number;
        step: number;
    };
    sortOptions: Array<{
        value: string;
        label: string;
        description?: string;
    }>;
}
export interface SearchAnalytics {
    query: string;
    resultCount: number;
    filters: Record<string, any>;
    userId?: string;
    timestamp?: Date;
}
//# sourceMappingURL=search.d.ts.map