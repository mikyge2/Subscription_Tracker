import mongoose from "mongoose";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createHandler, handleError } from '../_lib/middleware.js';
import User from '../../backend/models/user.model.js';

const signUpHandler = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Extract name, email, and password from the request body
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      const error = new Error('Name, email, and password are required');
      error.statusCode = 400;
      throw error;
    }

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

    // Create a new user document with hashed password
    const newUser = await User.create({ name, email, password: hashedPassword });

    // Get JWT configuration from environment
    const JWT_SECRET = process.env.JWT_SECRET;
    const JWT_Expires_IN = process.env.JWT_Expires_IN || '7d';

    if (!JWT_SECRET) {
      const error = new Error('JWT configuration missing');
      error.statusCode = 500;
      throw error;
    }

    // Create a JWT token for the newly created user (for authentication)
    const token = jwt.sign({ userID: newUser._id }, JWT_SECRET, { expiresIn: JWT_Expires_IN });

    // Send success response with the new user data and JWT token
    res.status(201).json({
      success: true,
      message: "User Signed Up Successfully",
      data: {
        user: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          createdAt: newUser.createdAt,
          updatedAt: newUser.updatedAt
        },
        token
      }
    });

  } catch (error) {
    // Handle the error
    return handleError(error, res);
  }
};

// Export the handler wrapped with common middleware
export default createHandler(signUpHandler);