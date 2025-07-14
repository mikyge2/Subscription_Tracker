// Import the Router utility from Express
import { Router } from "express";

// Import custom middleware to authorize requests (e.g., validate JWT)
import authorize from "../middleware/auth.middleware.js";

// Import all the controller functions that handle the subscription logic
import {
    cancelSubscription,
    createSubscription,
    deleteAllSubscriptions,
    deleteSubscription,
    getSubscription,
    getSubscriptions,
    getUserSubscriptions,
    upcomingUserRenewals,
    updateSubscription
} from "../controllers/subscription.controller.js";

// Initialize the router
const subscriptionRouter = Router();

/**
 * Route: GET /
 * Description: Get all subscriptions (for admins or privileged users)
 * Access: Protected (authorization required)
 */
subscriptionRouter.get('/', authorize, getSubscriptions);

/**
 * Route: GET /:id
 * Description: Get a specific subscription by its ID
 * Access: Protected
 */
subscriptionRouter.get('/:id', authorize, getSubscription);

/**
 * Route: GET /user/:id
 * Description: Get all subscriptions for a specific user (by user ID)
 * Access: Protected
 */
subscriptionRouter.get('/user/:id', authorize, getUserSubscriptions);

/**
 * Route: POST /
 * Description: Create a new subscription
 * Access: Protected
 */
subscriptionRouter.post('/', authorize, createSubscription);

/**
 * Route: PUT /:id
 * Description: Update a subscription by its ID
 * Access: Protected
 */
subscriptionRouter.put('/:id', authorize, updateSubscription);

/**
 * Route: DELETE /:id
 * Description: Delete a subscription by its ID
 * Access: Protected
 */
subscriptionRouter.delete('/:id', authorize, deleteSubscription);

/**
 * Route: DELETE /
 * Description: Delete **all** subscriptions (use with caution — likely admin only)
 * Access: Protected
 */
subscriptionRouter.delete('/', authorize, deleteAllSubscriptions);

/**
 * Route: PUT /cancel/:id
 * Description: Cancel a subscription by setting its status to 'canceled'
 * Access: Protected
 */
subscriptionRouter.put('/cancel/:id', authorize, cancelSubscription);

/**
 * Route: GET /upcoming-user-renewals/:id
 * Description: Get subscriptions for a user that are due for renewal soon (based on user ID)
 * Access: Protected
 */
subscriptionRouter.get('/upcoming-user-renewals/:id', authorize, upcomingUserRenewals);

// Export the router to be used in your main application
export default subscriptionRouter;
