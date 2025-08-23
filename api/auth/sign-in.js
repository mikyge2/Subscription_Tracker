import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createHandler, handleError } from '../_lib/middleware.js';
import User from '../../backend/models/user.model.js';

const signInHandler = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Extract email and password from request body
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      const error = new Error('Email and password are required');
      error.statusCode = 400;
      throw error;
    }

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

    // Get JWT configuration from environment
    const JWT_SECRET = process.env.JWT_SECRET;
    const JWT_Expires_IN = process.env.JWT_Expires_IN || '7d';

    if (!JWT_SECRET) {
      const error = new Error('JWT configuration missing');
      error.statusCode = 500;
      throw error;
    }

    // Generate JWT token for the authenticated user
    const token = jwt.sign({ userID: user._id }, JWT_SECRET, { expiresIn: JWT_Expires_IN });

    // Send success response with user data and token
    res.status(200).json({
      success: true,
      message: "User Signed in Successfully",
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error) {
    // Handle error
    return handleError(error, res);
  }
};

// Export the handler wrapped with common middleware
export default createHandler(signInHandler);