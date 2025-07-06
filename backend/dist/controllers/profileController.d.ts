import { Request, Response } from 'express';
export declare const getProfile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateProfile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateAvatar: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getAvatarSuggestions: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=profileController.d.ts.map