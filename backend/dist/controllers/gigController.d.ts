import { Request, Response } from 'express';
interface AuthRequest extends Request {
}
export declare const createGig: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getGigs: (req: Request, res: Response) => Promise<void>;
export declare const getGigById: (req: Request, res: Response) => Promise<void>;
export declare const updateGig: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteGig: (req: AuthRequest, res: Response) => Promise<void>;
export declare const applyToGig: (req: AuthRequest, res: Response) => Promise<void>;
export declare const acceptApplication: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getUserPostedGigs: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getUserApplications: (req: AuthRequest, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=gigController.d.ts.map