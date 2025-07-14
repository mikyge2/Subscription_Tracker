// Import the Router function from Express to create a modular route handler
import { Router } from 'express';

// Import authorization middleware to protect specific routes
import authorize from "../middleware/auth.middleware.js";

// Import user-related controller functions
import {
    deleteUser,
    getUser,
    getUsers,
    updateUser
} from "../controllers/user.controller.js";

// Create a new router instance for user routes
const userRouter = Router();

// Public route: Get all users
// No authentication required
userRouter.get('/', getUsers);

// Protected route: Get a single user by ID
// Requires authorization (e.g., valid token/session)
userRouter.get('/:id', authorize, getUser);

// Protected route: Update a user by ID
// Requires authorization
userRouter.put('/:id', authorize, updateUser);

// Protected route: Delete a user by ID
// Requires authorization
userRouter.delete('/:id', authorize, deleteUser);

// Export the router to be used in the main application
export default userRouter;
