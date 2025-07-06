export declare const config: {
    PORT: number;
    NODE_ENV: "development" | "production" | "test";
    MONGODB_URI: string;
    JWT_SECRET: string;
    JWT_REFRESH_SECRET: string;
    JWT_EXPIRES_IN: string;
    JWT_REFRESH_EXPIRES_IN: string;
    COHERE_API_KEY: string;
    RATE_LIMIT_WINDOW_MS: number;
    RATE_LIMIT_MAX_REQUESTS: number;
    CORS_ORIGIN: string;
    GOOGLE_MAPS_API_KEY?: string | undefined;
};
export type Config = typeof config;
export declare const isDevelopment: () => boolean;
export declare const isProduction: () => boolean;
export declare const isTest: () => boolean;
export declare const getLogLevel: () => "warn" | "error" | "info";
//# sourceMappingURL=env.d.ts.map