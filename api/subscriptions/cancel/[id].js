import { createHandler, handleError, authorize } from '../../_lib/middleware.js';
import Subscription from '../../../backend/models/subsciption.model.js';

const cancelSubscriptionHandler = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      const error = new Error('Subscription ID is required');
      error.statusCode = 400;
      throw error;
    }

    // Only PUT method allowed
    if (req.method !== 'PUT') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }

    // Require authorization
    const authResult = await authorize(req, res);
    if (authResult.error) {
      return res.status(authResult.status).json({ message: authResult.error });
    }
    req.user = authResult.user;

    // Find subscription by ID
    const subscription = await Subscription.findById(id);

    if (!subscription) {
      const error = new Error('Subscription not found');
      error.statusCode = 404;
      throw error;
    }

    // If already canceled, respond with 400 Bad Request
    if (subscription.status === 'canceled') {
      return res.status(400).json({
        success: false,
        message: 'Subscription is already canceled',
      });
    }

    // Update status to canceled and save
    subscription.status = 'canceled';
    await subscription.save();

    res.status(200).json({
      success: true,
      message: 'Subscription canceled successfully',
      data: subscription,
    });
    
  } catch (error) {
    return handleError(error, res);
  }
};

export default createHandler(cancelSubscriptionHandler);