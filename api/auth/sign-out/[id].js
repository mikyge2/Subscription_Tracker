import { createHandler, handleError } from '../../_lib/middleware.js';

const signOutHandler = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Get user ID from query parameters
    const { id } = req.query;

    if (!id) {
      const error = new Error('User ID is required');
      error.statusCode = 400;
      throw error;
    }

    // Just send a success response indicating sign-out
    // In a real implementation, you might want to blacklist the token
    res.status(200).json({
      success: true,
      message: `User with id ${id} signed out successfully`,
    });
  } catch (error) {
    return handleError(error, res);
  }
};

// Export the handler wrapped with common middleware
export default createHandler(signOutHandler);