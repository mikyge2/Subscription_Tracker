import mongoose from 'mongoose';

// Global variable to store the cached connection
let cachedConnection = null;

/**
 * Optimized MongoDB connection for serverless functions
 * Reuses existing connections to handle cold starts efficiently
 */
const connectToDatabase = async () => {
  // If we have a cached connection, return it
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  try {
    // Get DB URI from environment variables
    const DB_URI = process.env.DB_URI;
    
    if (!DB_URI) {
      throw new Error('MongoDB URI is missing from environment variables');
    }

    // Configure mongoose for serverless environment
    mongoose.set('strictQuery', false);
    
    // Connect with optimized settings for serverless
    const connection = await mongoose.connect(DB_URI, {
      // Optimize for serverless
      bufferCommands: false, // Disable mongoose buffering
      maxPoolSize: 1, // Limit connection pool size for serverless
      serverSelectionTimeoutMS: 5000, // Keep this short for serverless
      socketTimeoutMS: 45000,
      family: 4 // Use IPv4, skip trying IPv6
    });

    // Cache the connection
    cachedConnection = connection;
    
    console.log('MongoDB Connected for serverless function');
    return connection;
    
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
};

export default connectToDatabase;