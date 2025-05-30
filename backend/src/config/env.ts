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
  MONGODB_TEST_URI: z.string().optional(),

  // JWT Configuration
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT refresh secret must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Google Maps API
  GOOGLE_MAPS_API_KEY: z.string().optional(),

  // Twilio Configuration
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),

  // Razorpay Configuration
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),

  // DigiLocker API
  DIGILOCKER_CLIENT_ID: z.string().optional(),
  DIGILOCKER_CLIENT_SECRET: z.string().optional(),

  // Cloudflare Configuration
  CLOUDFLARE_API_TOKEN: z.string().optional(),

  // Email Configuration
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional().transform(Number),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),

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
  } catch (error) {
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

// Type for the configuration
export type Config = typeof config;

// Helper function to check if we're in development
export const isDevelopment = () => config.NODE_ENV === 'development';

// Helper function to check if we're in production
export const isProduction = () => config.NODE_ENV === 'production';

// Helper function to check if we're in test mode
export const isTest = () => config.NODE_ENV === 'test';

// Database URI with fallback for test environment
export const getDatabaseUri = () => {
  if (isTest() && config.MONGODB_TEST_URI) {
    return config.MONGODB_TEST_URI;
  }
  return config.MONGODB_URI;
};

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
