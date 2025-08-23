import { createHandler, handleError, authorize } from '../../_lib/middleware.js';
import Subscription from '../../../backend/models/subsciption.model.js';

const userSubscriptionsHandler = async (req, res) => {
  try {
    // Get ID from either query or params (for compatibility between Vercel and Express)
    const { id } = req.query || {};
    const paramId = req.params?.id;
    const userId = id || paramId;
    
    console.log('Looking for user ID:', { id, paramId, userId, query: req.query, params: req.params });

    if (!userId) {
      const error = new Error('User ID is required');
      error.statusCode = 400;
      throw error;
    }

    // Only GET method allowed
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // Require authorization
    const authResult = await authorize(req, res);
    if (authResult.error) {
      return res.status(authResult.status).json({ message: authResult.error });
    }
    req.user = authResult.user;

    // Check if the authenticated user matches the requested user ID
    if (req.user.id !== id) {
      const error = new Error('You are not the owner of this account');
      error.statusCode = 401;
      throw error;
    }

    // Find subscriptions by user ID
    const subscriptions = await Subscription.find({ user: id });

    res.status(200).json({ 
      success: true, 
      data: subscriptions 
    });
    
  } catch (error) {
    return handleError(error, res);
  }
};

export default createHandler(userSubscriptionsHandler);