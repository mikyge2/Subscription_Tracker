import jwt from 'jsonwebtoken';
import connectToDatabase from './database.js';

// Import models - we'll need to create these paths
import User from '../../backend/models/user.model.js';

/**
 * CORS middleware for serverless functions
 */
export const corsHandler = (req, res) => {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://172.20.10.4:3000',
    'https://subs-tracker-steel.vercel.app'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, ngrok-skip-browser-warning');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  
  return false;
};

/**
 * Authentication middleware for serverless functions
 */
export const authorize = async (req, res) => {
  try {
    // Ensure database connection
    await connectToDatabase();
    
    let token;
    
    // Check if Authorization header exists and starts with 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // If no token found, return unauthorized
    if (!token) {
      return { error: 'Unauthorized Token', status: 401 };
    }
    
    // Verify the token
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      return { error: 'JWT Secret not configured', status: 500 };
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Find the user in the database
    const user = await User.findById(decoded.userID);
    
    if (!user) {
      return { error: 'Unauthorized User', status: 401 };
    }
    
    return { user };
    
  } catch (error) {
    console.error('Authorization error:', error);
    return { error: 'Unauthorized', status: 401 };
  }
};

/**
 * Error handler for serverless functions
 */
export const handleError = (error, res) => {
  console.error('Function error:', error);
  
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  
  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

/**
 * Wrapper function to handle common serverless function setup
 */
export const createHandler = (handler) => {
  return async (req, res) => {
    try {
      // Handle CORS
      if (corsHandler(req, res)) {
        return; // OPTIONS request handled
      }
      
      // Connect to database
      await connectToDatabase();
      
      // Call the actual handler
      return await handler(req, res);
      
    } catch (error) {
      return handleError(error, res);
    }
  };
};