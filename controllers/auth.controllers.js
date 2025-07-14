import mongoose from "mongoose";
import User from "../models/user.model.js";
import bcrypt from 'bcryptjs';
import { JWT_SECRET, JWT_Expires_IN } from "../config/env.js";
import jwt from 'jsonwebtoken';

// Controller for user sign-up (registration)
export const signUp = async (req, res, next) => {
    // Start a new mongoose session and transaction for atomic operations
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Extract name, email, and password from the request body
        const { name, email, password } = req.body;

        // Check if a user with the given email already exists in the database
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            // If user exists, throw an error with status code 409 (Conflict)
            const error = new Error('User already exists');
            error.statusCode = 409;
            throw error;
        }

        // Generate a salt and hash the plain text password for security
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user document with hashed password inside the transaction session
        const newUser = await User.create([{ name, email, password: hashedPassword }], { session });

        // Create a JWT token for the newly created user (for authentication)
        const token = jwt.sign({ id: newUser[0]._id }, JWT_SECRET, { expiresIn: JWT_Expires_IN });

        // Commit the transaction to save the user permanently
        await session.commitTransaction();
        // End the mongoose session
        session.endSession();

        // Send success response with the new user data and JWT token
        res.status(201).json({
            success: true,
            message: "User Signed Up Successfully",
            data: {
                user: newUser[0],
                token
            }
        });

    } catch (error) {
        // If any error occurs, abort the transaction and end the session
        await session.abortTransaction();
        session.endSession();
        // Pass the error to the next middleware (error handler)
        next(error);
    }
}

// Controller for user sign-in (login)
export const signIn = async (req, res, next) => {
    // Start a new mongoose session and transaction (although no DB writes here)
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Extract email and password from request body
        const { email, password } = req.body;

        // Find the user by email in the database
        const user = await User.findOne({ email });
        if (!user) {
            // If user is not found, throw 404 error
            const error = new Error('User Not Found');
            error.statusCode = 404;
            throw error;
        }

        // Compare provided password with the hashed password stored in DB
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            // If password does not match, throw 401 Unauthorized error
            const error = new Error('Invalid Password');
            error.statusCode = 401;
            throw error;
        }

        // Generate JWT token for the authenticated user
        const token = jwt.sign({ userID: user._id }, JWT_SECRET, { expiresIn: JWT_Expires_IN });

        // Send success response with user data and token
        res.status(201).json({
            success: true,
            message: "User Signed in Successfully",
            data: {
                token,
                user
            }
        });
    } catch (error) {
        // Abort transaction and end session on error
        await session.abortTransaction();
        session.endSession();
        // Pass error to error-handling middleware
        next(error);
    }
}

// Controller for user sign-out (logout)
export const signOut = async (req, res, next) => {
    try {
        // Just send a success response indicating sign-out token invalidation will be handled
        res.status(200).json({
            success: true,
            message: `User with id ${req.params.id} signed out successfully`,
        });
    } catch (error) {
        // Pass any error to error handler
        next(error);
    }
};
