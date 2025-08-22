import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

const testConnection = async () => {
  try {
    const DB_URI = process.env.DB_URI;
    console.log('Testing connection to:', DB_URI ? 'MongoDB URI provided' : 'No URI found');
    
    if (!DB_URI) {
      throw new Error('DB_URI not found in environment variables');
    }
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(DB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    
    console.log('✅ MongoDB connection successful!');
    console.log('Connection state:', mongoose.connection.readyState);
    
    await mongoose.disconnect();
    console.log('✅ Disconnected successfully');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
};

testConnection();