import { createHandler, handleError } from '../_lib/middleware.js';
import User from '../../backend/models/user.model.js';

const usersHandler = async (req, res) => {
  try {
    if (req.method === 'GET') {
      // Get all users
      const users = await User.find({}, '-password'); // Exclude password field
      
      res.status(200).json({
        success: true,
        message: "Users retrieved successfully",
        data: users
      });
    } else {
      // Method not allowed
      return res.status(405).json({ message: 'Method Not Allowed' });
    }
  } catch (error) {
    return handleError(error, res);
  }
};

export default createHandler(usersHandler);