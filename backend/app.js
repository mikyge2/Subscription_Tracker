import express from 'express';

// Import environment variables like PORT number
import { PORT } from './config/env.js';

// Import route handlers for different resources
import userRouter from './routes/user.routes.js';
import authRouter from './routes/auth.routes.js';
import subscriptionRouter from './routes/subscription.routes.js';
import workflowRouter from "./routes/workflow.routes.js";

// Import database connection function
import connectToDatabase from "./database/mongodb.js";

// Import middleware for handling errors globally
import errorMiddleware from "./middleware/error.middleware.js";

// Middleware to parse cookies from incoming requests
import cookieParser from "cookie-parser";

// Custom middleware (could be for logging, security, etc.)
import arcjetMiddleware from "./middleware/arcjet.middleware.js";

// Initialize the Express application
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Middleware to parse URL-encoded request bodies (form submissions)
app.use(express.urlencoded({ extended: false }));

// Middleware to parse cookies attached to requests
app.use(cookieParser());

// Apply custom middleware globally
app.use(arcjetMiddleware);

// Mount routers on specific URL paths with versioning
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/subscriptions', subscriptionRouter);
app.use('/api/v1/workflows', workflowRouter);

// Global error handling middleware to catch errors and send proper responses
app.use(errorMiddleware);

// Root endpoint - basic sanity check endpoint
app.get("/", (req, res) => {
    res.send("Welcome to Subscription Tracker API");
});

// Start the server and connect to the database asynchronously
app.listen(PORT, async () => {
    console.log(`Subscription Tracker is Running on http://localhost:${PORT}`);
    await connectToDatabase();
});

// Export the app instance (useful for testing or serverless deployment)
export default app;
