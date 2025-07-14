/**
 * Global error handling middleware for Express
 * Catches errors passed from route handlers or other middleware
 */
const errorMiddleware = (err, req, res, next) => {
    try {
        // Create a shallow copy of the original error object
        let error = { ...err };
        // Ensure the message property is preserved
        error.message = err.message;

        // Log the full original error to the server console for debugging
        console.error(err);

        // Handle specific Mongoose CastError (e.g., invalid ObjectId)
        if (err.name === 'CastError') {
            const message = err.message;
            error = new Error(message);
            error.statusCode = 404; // Not Found
        }

        // Handle MongoDB duplicate key error (code 11000)
        if (err.code === 11000) {
            const message = err.message;
            error = new Error(message);
            error.statusCode = 400; // Bad Request
        }

        // Handle Mongoose validation errors (multiple validation messages)
        if (err.name === 'ValidationError') {
            // Extract all validation error messages and join them
            const message = Object.values(err.errors).map(val => val.message);
            error = new Error(message.join(', '));
            error.statusCode = 400; // Bad Request
        }

        // Send JSON response with error status and message
        res.status(err.statusCode || 500).json({
            success: false,
            error: error.message || 'Server Error',
        });

    } catch (error) {
        // If an error occurs within this middleware, forward it to Express error handler
        next(error);
    }
};

export default errorMiddleware;
