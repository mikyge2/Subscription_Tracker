import { createHandler, handleError, authorize } from '../_lib/middleware.js';
import Subscription from '../../backend/models/subsciption.model.js';

const subscriptionHandler = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      const error = new Error('Subscription ID is required');
      error.statusCode = 400;
      throw error;
    }

    // All methods require authorization
    const authResult = await authorize(req, res);
    if (authResult.error) {
      return res.status(authResult.status).json({ message: authResult.error });
    }
    req.user = authResult.user;

    if (req.method === 'GET') {
      // Get single subscription
      const subscription = await Subscription.findById(id);

      if (!subscription) {
        const error = new Error('Subscription Not Found');
        error.statusCode = 404;
        throw error;
      }

      res.status(200).json({ 
        success: true, 
        data: subscription 
      });
      
    } else if (req.method === 'PUT') {
      // Update subscription
      const subscription = await Subscription.findById(id);

      if (!subscription) {
        const error = new Error('Subscription not found');
        error.statusCode = 404;
        throw error;
      }

      // Confirm the user owns this subscription
      if (subscription.user.toString() !== req.user.id) {
        const error = new Error('You are not authorized to update this subscription');
        error.statusCode = 403;
        throw error;
      }

      // List of fields allowed to be updated
      const updatableFields = [
        'name', 'price', 'currency',
        'frequency', 'category',
        'payment', 'startDate', 'renewalDate'
      ];

      // Update only allowed fields if provided in request body
      updatableFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          subscription[field] = req.body[field];
        }
      });

      // Save changes
      await subscription.save();

      res.status(200).json({
        success: true,
        message: 'Subscription updated successfully',
        data: subscription,
      });
      
    } else if (req.method === 'DELETE') {
      // Delete subscription
      const subscription = await Subscription.findById(id);

      if (!subscription) {
        const error = new Error('Subscription Not Found');
        error.statusCode = 404;
        throw error;
      }

      // Delete the subscription document
      await subscription.deleteOne();

      res.status(200).json({
        success: true,
        message: 'Subscription deleted successfully',
      });
      
    } else {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }
  } catch (error) {
    return handleError(error, res);
  }
};

export default createHandler(subscriptionHandler);