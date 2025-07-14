// Import Router from Express framework
import { Router } from 'express';

// Import the controller function that handles sending reminders
import { sendReminders } from '../controllers/workflow.controller.js';

// Create a new router instance
const workflowRouter = Router();

/**
 * Route: POST /subscription/reminder
 * Description: Endpoint to trigger sending subscription reminders
 * This will be called by workflows or external services to initiate reminder emails or notifications
 */
workflowRouter.post('/subscription/reminder', sendReminders);

// Export the router for use in the main app
export default workflowRouter;
