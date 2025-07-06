import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    phone: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    phone: string;
    name: string;
    email: string;
    password: string;
}, {
    phone: string;
    name: string;
    email: string;
    password: string;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const validateData: <T>(schema: z.ZodSchema<T>, data: any) => {
    success: boolean;
    data: T;
    errors: null;
} | {
    success: boolean;
    data: null;
    errors: {
        field: string;
        message: string;
    }[];
};
//# sourceMappingURL=validation.d.ts.map