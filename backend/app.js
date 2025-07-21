import dotenv from 'dotenv';
dotenv.config();

// Import the Express framework
import express from 'express';

// Import environment variable (e.g., port number)
import { PORT } from './config/env.js';

// Import route handlers for various functionalities
import userRouter from './routes/user.routes.js';
import authRouter from './routes/auth.routes.js';
import subscriptionRouter from './routes/subscription.routes.js';
import workflowRouter from "./routes/workflow.routes.js";

// Import database connection function
import connectToDatabase from "./database/mongodb.js";

// Import global error handling middleware
import errorMiddleware from "./middleware/error.middleware.js";

// Import cookie parser middleware to handle cookies in requests
import cookieParser from "cookie-parser";

// Import custom middleware (possibly for logging, security, etc.)
import arcjetMiddleware from "./middleware/arcjet.middleware.js";

// Import CORS middleware to enable cross-origin resource sharing
import cors from "cors";

// Initialize the Express application
const app = express();

// Configure and use CORS to allow frontend (e.g., React app) to communicate with backend
app.use(cors({
    origin: ['http://localhost:3000', 'http://192.168.100.227:3000', 'https://subs-tracker-steel.vercel.app/'], // Frontend origin
    credentials: true,                 // Allow cookies/credentials to be sent
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'] // Allowed headers
}));

// Middleware to parse incoming JSON request bodies
app.use(express.json());

// Middleware to parse URL-encoded data (e.g., from forms)
app.use(express.urlencoded({ extended: false }));

// Middleware to parse cookies from the request headers
app.use(cookieParser());

// Apply custom middleware globally (e.g., arcjet security middleware)
app.use(arcjetMiddleware);

// Mount different routers for different API routes
app.use('/api/v1/auth', authRouter);               // Authentication routes
app.use('/api/v1/users', userRouter);              // User management routes
app.use('/api/v1/subscriptions', subscriptionRouter); // Subscription management routes
app.use('/api/v1/workflows', workflowRouter);      // Workflow-related routes

// Global error handler to catch and respond to errors from any route or middleware
app.use(errorMiddleware);

// Simple root endpoint for checking if server is up
app.get("/", (req, res) => {
    res.send("Welcome to Subscription Tracker API");
});

// Start the server and connect to MongoDB
app.listen(PORT, async () => {
    console.log(`Subscription Tracker is Running on http://localhost:${PORT}`);
    await connectToDatabase();
});

// Export the app instance for testing or serverless deployment
export default app;
