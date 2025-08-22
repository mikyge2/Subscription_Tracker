import mongoose from "mongoose";
import bcrypt from 'bcryptjs';
import { createHandler, handleError, authorize } from '../_lib/middleware.js';
import User from '../../backend/models/user.model.js';

const userHandler = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      const error = new Error('User ID is required');
      error.statusCode = 400;
      throw error;
    }

    // All routes require authorization except OPTIONS
    if (req.method !== 'OPTIONS') {
      const authResult = await authorize(req, res);
      if (authResult.error) {
        return res.status(authResult.status).json({ message: authResult.error });
      }
      req.user = authResult.user;
    }

    if (req.method === 'GET') {
      // Get single user
      const user = await User.findById(id, '-password');
      
      if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
      }
      
      res.status(200).json({
        success: true,
        message: "User retrieved successfully",
        data: user
      });
      
    } else if (req.method === 'PUT') {
      // Update user
      const { name, email } = req.body;
      
      if (!name && !email) {
        const error = new Error('At least one field (name or email) is required for update');
        error.statusCode = 400;
        throw error;
      }

      const updateData = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;

      const updatedUser = await User.findByIdAndUpdate(
        id, 
        updateData, 
        { new: true, runValidators: true }
      ).select('-password');
      
      if (!updatedUser) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
      }
      
      res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: updatedUser
      });
      
    } else if (req.method === 'DELETE') {
      // Delete user
      const deletedUser = await User.findByIdAndDelete(id);
      
      if (!deletedUser) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
      }
      
      res.status(200).json({
        success: true,
        message: "User deleted successfully",
        data: { deletedUserId: id }
      });
      
    } else {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }
  } catch (error) {
    return handleError(error, res);
  }
};

export default createHandler(userHandler);