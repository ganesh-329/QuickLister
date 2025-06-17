import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config, isDevelopment } from './config/env.js';
import { database } from './config/database.js';
import { createSocketService } from './services/socketService.js';

// Create Express application
const app = express();

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.io
const io = createSocketService({ httpServer });

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Rate limiting - more lenient in development
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for localhost in development
  skip: (req) => {
    if (isDevelopment()) {
      const ip = req.ip || req.connection.remoteAddress;
      return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
    }
    return false;
  },
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (isDevelopment()) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await database.healthCheck();
    
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.NODE_ENV,
      database: dbHealth,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100,
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: 'Service unavailable',
      timestamp: new Date().toISOString(),
    });
  }
});

// Import routes
import authRoutes from './routes/auth.js';
import gigRoutes from './routes/gigs.js';
import applicationRoutes from './routes/applications.js';
import profileRoutes from './routes/profile.js';
import chatRoutes from './routes/chat.js';
import dashboardRoutes from './routes/dashboard.js';
import adminRoutes from './routes/admin.js';

// Import services for health checks
import { cohereService } from './services/cohereService.js';

// API routes
app.get('/api', (req, res) => {
  res.json({
    message: 'MJob Platform API',
    version: '1.0.0',
    environment: config.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Profile routes
app.use('/api/profile', profileRoutes);

// Gig routes
app.use('/api/gigs', gigRoutes);

// Application routes
app.use('/api/applications', applicationRoutes);

// Chat routes
app.use('/api/chat', chatRoutes);

// Dashboard routes
app.use('/api/dashboard', dashboardRoutes);

// Admin routes
app.use('/api/admin', adminRoutes);

// Cohere AI health check endpoint
app.get('/api/ai/health', async (req, res) => {
  try {
    console.log('🔍 Checking Cohere AI health...');
    const healthCheck = await cohereService.healthCheck();
    
    if (healthCheck.status === 'healthy') {
      res.status(200).json({
        status: 'healthy',
        message: healthCheck.message,
        service: 'Cohere AI',
        model: 'command-r-plus',
        details: healthCheck.details,
      });
    } else {
      res.status(503).json({
        status: healthCheck.status,
        message: healthCheck.message,
        service: 'Cohere AI',
        details: healthCheck.details,
      });
    }
  } catch (error) {
    console.error('❌ Cohere health check error:', error);
    res.status(503).json({
      status: 'error',
      message: 'AI health check failed',
      service: 'Cohere AI',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Unhandled error:', error);

  // Don't leak error details in production
  const message = isDevelopment() ? error.message : 'Internal server error';
  const stack = isDevelopment() ? error.stack : undefined;

  res.status(500).json({
    error: 'Internal server error',
    message,
    stack,
    timestamp: new Date().toISOString(),
  });
});

// Start server function
async function startServer() {
  try {
    // Try to connect to database (optional for development)
    console.log('🔄 Connecting to database...');
    try {
      await database.connect();
    } catch (error) {
      console.log('⚠️ Database connection failed, continuing without database...');
      console.log('💡 To fix: Install and start MongoDB, or use MongoDB Atlas');
    }

    // Start HTTP server
    const server = httpServer.listen(config.PORT, () => {
      console.log(`🚀 Server running on port ${config.PORT}`);
      console.log(`📍 Environment: ${config.NODE_ENV}`);
      console.log(`🌐 API URL: http://localhost:${config.PORT}/api`);
      console.log(`❤️ Health check: http://localhost:${config.PORT}/health`);
      console.log(`💬 Socket.io initialized for real-time chat`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
      
      server.close(async () => {
        console.log('🔄 HTTP server closed');
        
        try {
          await database.disconnect();
          console.log('✅ Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during shutdown:', error);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('❌ Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    return server;
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}

export { app, startServer, httpServer, io };
