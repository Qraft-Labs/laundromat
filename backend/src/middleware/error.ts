import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);
  
  // PostgreSQL unique violation
  if (err.message.includes('duplicate key')) {
    return res.status(409).json({ 
      error: 'Resource already exists',
      details: err.message 
    });
  }
  
  // PostgreSQL foreign key violation
  if (err.message.includes('foreign key')) {
    return res.status(400).json({ 
      error: 'Invalid reference to related resource',
      details: err.message 
    });
  }
  
  // Default error
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
};
