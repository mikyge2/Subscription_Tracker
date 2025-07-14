import mongoose from 'mongoose';
// Import database URI and current environment mode from config
import { DB_URI, NODE_ENV } from '../config/env.js';

// Throw an error if DB_URI is not defined to prevent app from running without DB connection info
if (!DB_URI) {
    throw new Error('MongoDB URI is missing');
}

// Async function to connect to MongoDB using Mongoose
const connectToDatabase = async () => {
    try {
        // Attempt to connect using the connection string
        await mongoose.connect(DB_URI);
        console.log(`MongoDB Connected in ${NODE_ENV} mode`);
    } catch (error) {
        // Log error and exit process if connection fails
        console.error('Error trying to connect to MongoDB', error);
        process.exit(1);
    }
};

// Export the connect function to be called on app startup
export default connectToDatabase;
