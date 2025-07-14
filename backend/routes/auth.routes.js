// Import the Router function from Express to create a modular, mountable route handler
import { Router } from 'express';

// Import authentication controller functions
import { signUp, signIn, signOut } from '../controllers/auth.controllers.js';

// Create a new router instance for authentication routes
const authRouter = Router();

// Route for user registration
// Expects user details (username, email, password) in the request body
authRouter.post("/sign-up", signUp);

// Route for user login
// Expects credentials (email and password) in the request body
authRouter.post("/sign-in", signIn);

// Route for user logout
// Handles session/token invalidation
authRouter.post("/sign-out/:id", signOut);

// Export the configured router for use in the main app
export default authRouter;
