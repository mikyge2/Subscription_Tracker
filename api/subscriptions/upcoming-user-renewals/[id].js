import { createHandler, handleError, authorize } from '../../_lib/middleware.js';
import Subscription from '../../../backend/models/subsciption.model.js';

const upcomingRenewalsHandler = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
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

    // Ensure user owns the subscriptions they're querying
    if (req.user.id !== id) {
      const error = new Error('You are not the owner of this account');
      error.statusCode = 401;
      throw error;
    }

    // Calculate current date and 7 days in the future
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);

    // Find active subscriptions with renewal dates between now and 7 days ahead
    const subscriptions = await Subscription.find({
      user: id,
      status: 'active',
      renewalDate: { $gte: now, $lte: sevenDaysFromNow },
    });

    res.status(200).json({
      success: true,
      data: subscriptions,
    });
    
  } catch (error) {
    return handleError(error, res);
  }
};

export default createHandler(upcomingRenewalsHandler);