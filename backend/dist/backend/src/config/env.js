import dotenv from 'dotenv';
import { z } from 'zod';
// Load environment variables
dotenv.config();
// Environment validation schema
const envSchema = z.object({
    // Server Configuration
    PORT: z.string().default('5000').transform(Number),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    // Database Configuration
    MONGODB_URI: z.string().min(1, 'MongoDB URI is required'),
    // JWT Configuration
    JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
    JWT_REFRESH_SECRET: z.string().min(32, 'JWT refresh secret must be at least 32 characters'),
    JWT_EXPIRES_IN: z.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
    // Google Maps API
    GOOGLE_MAPS_API_KEY: z.string().optional(),
    // Cohere AI Configuration
    COHERE_API_KEY: z.string().min(1, 'Cohere API key is required for AI chat functionality'),
    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform(Number),
    RATE_LIMIT_MAX_REQUESTS: z.string().default('100').transform(Number),
    // CORS Configuration
    CORS_ORIGIN: z.string().default('http://localhost:3000'),
});
// Validate environment variables
function validateEnv() {
    try {
        return envSchema.parse(process.env);
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            console.error('❌ Environment validation failed:');
            error.errors.forEach((err) => {
                console.error(`  - ${err.path.join('.')}: ${err.message}`);
            });
        }
        process.exit(1);
    }
}
// Export validated configuration
export const config = validateEnv();
// Helper function to check if we're in development
export const isDevelopment = () => config.NODE_ENV === 'development';
// Helper function to check if we're in production
export const isProduction = () => config.NODE_ENV === 'production';
// Helper function to check if we're in test mode
export const isTest = () => config.NODE_ENV === 'test';
// Logging configuration
export const getLogLevel = () => {
    switch (config.NODE_ENV) {
        case 'production':
            return 'warn';
        case 'test':
            return 'error';
        default:
            return 'info';
    }
};
//# sourceMappingURL=env.js.map