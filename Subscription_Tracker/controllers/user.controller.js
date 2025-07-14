// Import the User model from the models directory
import User from '../models/user.model.js';

// Import bcryptjs for password hashing
import bcrypt from 'bcryptjs';

// Controller to get all users
export const getUsers = async (req, res, next) => {
    try {
        // Fetch all users from the database
        const users = await User.find();

        // Respond with the list of users
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        // Pass any errors to the global error handler
        next(error);
    }
};

// Controller to get a single user by ID
export const getUser = async (req, res, next) => {
    try {
        // Find user by ID and exclude the password field from the result
        const user = await User.findById(req.params.id).select('-password');

        // If user is not found, throw a 404 error
        if (!user) {
            const error = new Error('User Not Found');
            error.statusCode = 404;
            throw error;
        }

        // Respond with the user data
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        // Pass any errors to the global error handler
        next(error);
    }
};

// Controller to update a user by ID
export const updateUser = async (req, res, next) => {
    try {
        // Find the user by ID
        const user = await User.findById(req.params.id);

        // If user is not found, throw a 404 error
        if (!user) {
            const error = new Error('User Not Found');
            error.statusCode = 404;
            throw error;
        }

        // Update user's name if provided in request body
        if (req.body.name) user.name = req.body.name;

        // Update user's email if provided in request body
        if (req.body.email) user.email = req.body.email;

        // If a new password is provided, hash it before saving
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
        }

        // Save the updated user to the database
        const updatedUser = await user.save();

        // Respond with the updated user data
        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: updatedUser,
        });
    } catch (error) {
        // Pass any errors to the global error handler
        next(error);
    }
};

// Controller to delete a user by ID
export const deleteUser = async (req, res, next) => {
    try {
        // Find the user by ID
        const user = await User.findById(req.params.id);

        // If user is not found, throw a 404 error
        if (!user) {
            const error = new Error('User Not Found');
            error.statusCode = 404;
            throw error;
        }

        // Permanently delete the user from the database
        await user.deleteOne();

        // Respond with a success message
        res.status(200).json({
            success: true,
            message: 'User deleted successfully',
        });
    } catch (error) {
        // Pass any errors to the global error handler
        next(error);
    }
};
