import { Request, Response } from 'express';
interface SearchGigsRequest extends Request {
    query: {
        q?: string;
        category?: string;
        skills?: string;
        minRate?: string;
        maxRate?: string;
        paymentType?: string;
        urgency?: string;
        experienceLevel?: string;
        lat?: string;
        lng?: string;
        radius?: string;
        sort?: string;
        page?: string;
        limit?: string;
        location?: string;
    };
}
interface SearchUsersRequest extends Request {
    query: {
        q?: string;
        skills?: string;
        location?: string;
        lat?: string;
        lng?: string;
        radius?: string;
        sort?: string;
        page?: string;
        limit?: string;
    };
}
export declare const searchGigs: (req: SearchGigsRequest, res: Response) => Promise<void>;
export declare const searchUsers: (req: SearchUsersRequest, res: Response) => Promise<void>;
export declare const getSearchSuggestions: (req: Request, res: Response) => Promise<void>;
export declare const getPopularSearches: (req: Request, res: Response) => Promise<void>;
export declare const saveSearchAnalytics: (req: Request, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=searchController.d.ts.map