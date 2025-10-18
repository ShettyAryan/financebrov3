import cors from 'cors';
import { config } from '../config/environment.js';

/**
 * CORS configuration for FinanceBro backend
 * Configured to work with the frontend React app
 */
export const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // In development, allow localhost with any port
    if (config.nodeEnv === 'development') {
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:8080',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:8080'
      ];
      
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
    }
    
    // In production, allow configured frontend URL and Vercel domains
    if (config.nodeEnv === 'production') {
      const allowedProductionOrigins = [
        config.cors.origin, // Your configured FRONTEND_URL
        'https://financebro.app',
        'https://www.financebro.app'
      ];
      
      // Also allow any Vercel domain if the configured origin isn't set
      if (origin && origin.includes('.vercel.app')) {
        return callback(null, true);
      }
      
      if (allowedProductionOrigins.includes(origin)) {
        return callback(null, true);
      }
    }
    
    // Allow the configured frontend URL regardless of environment
    if (origin === config.cors.origin) {
      return callback(null, true);
    }
    
    // Log rejected origins for debugging
    console.log(`CORS: Rejected origin: ${origin}, configured origin: ${config.cors.origin}, env: ${config.nodeEnv}`);
    
    // Reject other origins
    callback(new Error('Not allowed by CORS'));
  },
  
  credentials: config.cors.credentials,
  
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma'
  ],
  
  exposedHeaders: [
    'X-Total-Count',
    'X-Page-Count',
    'X-Current-Page'
  ],
  
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  
  maxAge: 86400 // 24 hours
};

/**
 * Custom CORS middleware with logging
 */
export const corsWithLogging = (req, res, next) => {
  const origin = req.get('Origin');
  
  // Always log CORS requests in production for debugging
  console.log(`CORS: ${req.method} ${req.path} from origin: ${origin || 'no-origin'}, configured: ${config.cors.origin}`);
  
  cors(corsOptions)(req, res, (err) => {
    if (err) {
      console.error(`CORS Error: ${err.message} for origin: ${origin}`);
    }
    next(err);
  });
};
