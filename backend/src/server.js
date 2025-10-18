import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Import configuration
import { config, validateConfig, isDevelopment } from './config/environment.js';
import { testConnection, validateSchema } from './config/database.js';

// Import middleware
import { corsWithLogging } from './middleware/cors.js';
import { 
  helmetConfig, 
  rateLimitConfig, 
  authRateLimit, 
  apiRateLimit, 
  requestLogger, 
  securityHeaders 
} from './middleware/security.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Import routes
import userRoutes from './routes/userRoutes.js';
import lessonRoutes from './routes/lessonRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import practiceRoutes from './routes/practiceRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

// Load environment variables
dotenv.config();

// Validate configuration
try {
  validateConfig();
} catch (error) {
  console.error('❌ Configuration validation failed:', error.message);
  process.exit(1);
}

// Create Express app
const app = express();

// Trust proxy for accurate IP addresses (important for rate limiting)
app.set('trust proxy', 1);

// Security middleware
app.use(helmetConfig);
app.use(securityHeaders);

// CORS middleware
app.use(corsWithLogging);

// Rate limiting
app.use(rateLimitConfig);

// Logging middleware
if (isDevelopment()) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}
app.use(requestLogger);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'FinanceBro backend is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'FinanceBro backend is running 🚀',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: config.nodeEnv,
    endpoints: {
      health: '/health',
      api: '/api',
      docs: '/api/docs'
    }
  });
});

// API routes
app.use('/api/users', authRateLimit, userRoutes);
app.use('/api/lessons', apiRateLimit, lessonRoutes);
app.use('/api/progress', apiRateLimit, progressRoutes);
app.use('/api/practice', apiRateLimit, practiceRoutes);
app.use('/api/ai', apiRateLimit, aiRoutes);

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'FinanceBro API Documentation',
    version: '1.0.0',
    endpoints: {
      users: {
        'POST /api/users/register': 'Register a new user',
        'POST /api/users/login': 'Login user',
        'GET /api/users/profile': 'Get user profile (auth required)',
        'PUT /api/users/profile': 'Update user profile (auth required)',
        'PUT /api/users/stats': 'Update user stats (auth required)'
      },
      lessons: {
        'GET /api/lessons': 'Get all lessons',
        'GET /api/lessons/:id': 'Get specific lesson',
        'GET /api/lessons/categories': 'Get lesson categories',
        'POST /api/lessons/unlock': 'Unlock next lesson (auth required)'
      },
      progress: {
        'GET /api/progress': 'Get user progress (auth required)',
        'GET /api/progress/stats': 'Get progress statistics (auth required)',
        'PUT /api/progress': 'Update lesson progress (auth required)',
        'DELETE /api/progress': 'Reset progress (auth required)'
      },
      practice: {
        'GET /api/practice': 'Get practice sessions (auth required)',
        'GET /api/practice/stats': 'Get practice statistics (auth required)',
        'POST /api/practice': 'Create practice session (auth required)',
        'PUT /api/practice/:id': 'Update practice session (auth required)',
        'DELETE /api/practice/:id': 'Delete practice session (auth required)'
      },
      ai: {
        'GET /api/ai/test': 'Test AI service integration',
        'GET /api/ai/health': 'Get AI service health',
        'POST /api/ai/feedback': 'Generate feedback (auth required)',
        'POST /api/ai/scenarios': 'Generate scenarios (auth required)',
        'GET /api/ai/analysis': 'Analyze learning patterns (auth required)'
      }
    },
    authentication: {
      type: 'Bearer Token (JWT)',
      header: 'Authorization: Bearer <token>',
      note: 'Most endpoints require authentication'
    }
  });
});

// 404 handler for undefined routes
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Database connection test and server startup
const startServer = async () => {
  try {
    // Test database connection
    console.log('🔌 Testing database connection...');
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ Database connection failed. Please check your Supabase configuration.');
      process.exit(1);
    }
    
    // Validate database schema
    console.log('📋 Validating database schema...');
    const missingTables = await validateSchema();
    
    if (missingTables.length > 0) {
      console.warn('⚠️  Some tables are missing. Please run the database migrations.');
      console.log('Missing tables:', missingTables.join(', '));
    }
    
    // Start server - bind to 0.0.0.0 for Render compatibility
    const host = process.env.HOST || '0.0.0.0';
    const server = app.listen(config.port, host, () => {
      console.log('🚀 FinanceBro Backend Server Started');
      console.log('=====================================');
      console.log(`📍 Environment: ${config.nodeEnv}`);
      console.log(`🌐 Server: http://${host}:${config.port}`);
      console.log(`📚 API Docs: http://${host}:${config.port}/api/docs`);
      console.log(`❤️  Health Check: http://${host}:${config.port}/health`);
      console.log(`🔧 CORS Origin: ${config.cors.origin}`);
      console.log('=====================================');
      
      if (isDevelopment()) {
        console.log('🔧 Development mode enabled');
        console.log('📝 API endpoints available at /api/*');
        console.log('🤖 AI integration ready at /api/ai/*');
      }
    });

    // Handle server errors
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${config.port} is already in use`);
      } else {
        console.error('❌ Server error:', err);
      }
      process.exit(1);
    });
    
    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
      
      server.close(() => {
        console.log('✅ HTTP server closed');
        console.log('👋 FinanceBro backend shutdown complete');
        process.exit(0);
      });
      
      // Force close after 10 seconds
      setTimeout(() => {
        console.error('❌ Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };
    
    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;
