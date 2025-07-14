// Import mongoose to define the schema and model
import mongoose from 'mongoose';

// Define the user schema using Mongoose
const userSchema = new mongoose.Schema({
        // User's full name
        name: {
            type: String,
            required: [true, 'User Name is required'], // Custom error message if missing
            trim: true,                                // Removes leading/trailing whitespace
            minLength: 4,                              // Minimum name length
            maxLength: 50,                             // Maximum name length
        },

        // User's email address
        email: {
            type: String,
            required: [true, 'User Email is required'], // Must be provided
            unique: true,                               // No duplicate emails allowed
            trim: true,                                 // Clean whitespace
            lowercase: true,                            // Always store in lowercase
            match: [/\S+@\S+\.\S+/, 'Invalid email format'], // Regex to validate format
        },

        // User's hashed password
        password: {
            type: String,
            required: [true, 'User Password is required'], // Must be provided
            minlength: 6,                                  // Must be at least 6 characters
        }
    },
    {
        // Automatically add createdAt and updatedAt timestamps
        timestamps: true
    });

// Create the User model from the schema
const User = mongoose.model('User', userSchema);

// Export the User model for use in other parts of the app
export default User;
