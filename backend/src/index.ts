import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import session from 'express-session';
import passport from './config/passport';
import { config } from './config';
import routes from './routes';
import { errorHandler, notFound } from './middleware/error';
import { 
  helmetConfig, 
  hppProtection, 
  hideServerInfo, 
  extractRealIP 
} from './middleware/security.middleware';
import { initializeBackupScheduler } from './services/backup.scheduler';
import { cleanupOldReceipts } from './services/pdf.service';
import { dailyBackupScheduler } from './services/daily-backup.scheduler';
import path from 'path';
import dns from 'dns';

// Fix Windows DNS/Proxy issues for Google OAuth
// Force IPv4 DNS resolution (Windows IPv6 can cause ENOTFOUND errors)
dns.setDefaultResultOrder('ipv4first');

// Clear any proxy environment variables that might interfere
process.env.HTTP_PROXY = '';
process.env.HTTPS_PROXY = '';
process.env.NO_PROXY = '*';

console.log('🌐 DNS Configuration: IPv4 priority (fixing Windows DNS issues)');
console.log('🔓 Proxy Settings: Disabled (direct connection)');

const app = express();

// Security middleware (must be early in the chain)
app.use(helmetConfig); // Security headers
app.use(hppProtection); // HTTP Parameter Pollution protection
app.use(hideServerInfo); // Hide server info
app.use(extractRealIP); // Extract real IP for rate limiting

// CORS middleware - configure based on environment
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    
    // In development, allow all origins for network access (WiFi, hotspot, etc.)
    if (config.nodeEnv === 'development') {
      return callback(null, true);
    }
    
    // In production, only allow configured frontend URL(s)
    const allowedOrigins = [
      config.cors.origin,
      // Add additional production domains if needed
    ].filter(Boolean);
    
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware (required for passport)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production', 
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Logging middleware
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Serve static files from uploads directory with explicit CORS headers
app.use('/uploads', (req, res, next) => {
  // Allow requests from any origin in development (config.cors.origin = true)
  const allowedOrigin = req.headers.origin || '*';
  res.header('Access-Control-Allow-Origin', allowedOrigin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
}, express.static(path.join(__dirname, '../uploads')));

// API routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Lush Laundry ERP API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      customers: '/api/customers',
      prices: '/api/prices',
      orders: '/api/orders',
      reports: '/api/reports',
    },
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    app.listen(config.port, '0.0.0.0', () => {
      console.log('');
      console.log('🚀 ========================================');
      console.log(`🚀 Server running on port ${config.port}`);
      console.log(`🚀 Environment: ${config.nodeEnv}`);
      console.log(`🚀 API URL: http://localhost:${config.port}`);
      console.log(`🚀 Network Access: http://192.168.1.7:${config.port}`);
      console.log(`🚀 Health Check: http://localhost:${config.port}/api/health`);
      console.log('🚀 ========================================');
      console.log('');
      
      // Initialize automated backup scheduler
      initializeBackupScheduler();
      
      // Initialize daily email backup scheduler
      dailyBackupScheduler.start();
      
      // Schedule PDF receipt cleanup (every 24 hours)
      setInterval(() => {
        console.log('🧹 Running scheduled PDF cleanup...');
        cleanupOldReceipts();
      }, 24 * 60 * 60 * 1000); // 24 hours
      
      // Run initial cleanup
      cleanupOldReceipts();
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
