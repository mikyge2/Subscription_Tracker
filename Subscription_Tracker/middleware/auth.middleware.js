import { JWT_SECRET } from "../config/env.js";
import jwt from 'jsonwebtoken';
import User from "../models/user.model.js";

/**
 * Middleware to authorize requests based on JWT token in the Authorization header
 */
const authorize = async (req, res, next) => {
    try {
        let token;

        // Check if Authorization header exists and starts with 'Bearer'
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            // Extract token from header (format: "Bearer <token>")
            token = req.headers.authorization.split(' ')[1];
        }

        // If no token found, respond with 401 Unauthorized
        if (!token) {
            return res.status(401).json({ message: "Unauthorized Token" });
        }

        // Verify the token using the secret key, returns the decoded payload
        const decoded = jwt.verify(token, JWT_SECRET);

        // Find the user in the database by ID stored in token payload (assumed as decoded.userID)
        const user = await User.findById(decoded.userID);

        // If user not found, respond with 401 Unauthorized
        if (!user) {
            return res.status(401).json({ message: "Unauthorized User" });
        }

        // Attach the user object to the request for downstream middleware/routes
        req.user = user;

        // Proceed to next middleware or route handler
        next();
    } catch (error) {
        // Handle errors such as token expiration or invalid token
        res.status(401).json({ message: 'Unauthorized', error: error.message });
        next(error); // Forward error to error-handling middleware (optional)
    }
};

export default authorize;
