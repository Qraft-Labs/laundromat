import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'lush_laundry',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'change-this-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  cors: {
    // In production, use the configured frontend URL
    // In development, allow any origin for local network access
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL || false
      : true, // Allow any origin in development
  },
};
