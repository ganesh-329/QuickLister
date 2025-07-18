export declare const config: {
    PORT: number;
    NODE_ENV: "development" | "production" | "test";
    MONGODB_URI: string;
    JWT_SECRET: string;
    JWT_REFRESH_SECRET: string;
    JWT_EXPIRES_IN: string;
    JWT_REFRESH_EXPIRES_IN: string;
    SMTP_PORT: number;
    RATE_LIMIT_WINDOW_MS: number;
    RATE_LIMIT_MAX_REQUESTS: number;
    CORS_ORIGIN: string;
    MONGODB_TEST_URI?: string | undefined;
    GOOGLE_MAPS_API_KEY?: string | undefined;
    DIGILOCKER_CLIENT_ID?: string | undefined;
    DIGILOCKER_CLIENT_SECRET?: string | undefined;
    DIGILOCKER_REDIRECT_URI?: string | undefined;
    RAZORPAY_KEY_ID?: string | undefined;
    RAZORPAY_KEY_SECRET?: string | undefined;
    CLOUDFLARE_API_TOKEN?: string | undefined;
    SMTP_HOST?: string | undefined;
    SMTP_USER?: string | undefined;
    SMTP_PASS?: string | undefined;
};
export type Config = typeof config;
export declare const isDevelopment: () => boolean;
export declare const isProduction: () => boolean;
export declare const isTest: () => boolean;
export declare const getDatabaseUri: () => string;
export declare const getLogLevel: () => "warn" | "error" | "info";
//# sourceMappingURL=env.d.ts.map