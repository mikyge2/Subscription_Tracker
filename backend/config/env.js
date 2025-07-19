// Import 'config' function from dotenv to load environment variables from a file
import { config } from 'dotenv';

// Load environment variables from a file based on current NODE_ENV
// For example, if NODE_ENV=development, it loads from '..env.development.local'
// Defaults to 'development' if NODE_ENV is not set
config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

// Destructure and export needed environment variables for use elsewhere in your app
export const {
    PORT,           // Server port number
    NODE_ENV,       // Environment name (development, production, etc.)
    DB_URI,         // Database connection URI
    SERVER_URL,     // Base URL of your server
    JWT_SECRET,     // Secret key for signing JWT tokens
    JWT_Expires_IN, // JWT token expiration time
    ARCJET_KEY,     // Arcjet API key for security services
    ARCJET_ENV,     // Arcjet environment variable (optional)
    QSTASH_URL,     // QStash endpoint URI
    QSTASH_TOKEN,   // QStash authorization token
    EMAIL_PASSWORD  // Password for email sending service
} = process.env;
