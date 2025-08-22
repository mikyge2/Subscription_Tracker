import { createHandler, handleError, authorize } from '../_lib/middleware.js';
import Subscription from '../../backend/models/subsciption.model.js';
import { Client } from "@upstash/qstash";

const subscriptionsHandler = async (req, res) => {
  try {
    // All methods require authorization
    const authResult = await authorize(req, res);
    if (authResult.error) {
      return res.status(authResult.status).json({ message: authResult.error });
    }
    req.user = authResult.user;

    if (req.method === 'GET') {
      // Get all subscriptions
      const subscriptions = await Subscription.find();
      res.status(200).json({ 
        success: true, 
        data: subscriptions 
      });
      
    } else if (req.method === 'POST') {
      // Create a new subscription
      const subscription = await Subscription.create({
        ...req.body,
        user: req.user._id,
      });

      // Handle QStash workflow trigger based on environment
      const NODE_ENV = process.env.NODE_ENV;
      const SERVER_URL = process.env.SERVER_URL;
      const QSTASH_TOKEN = process.env.QSTASH_TOKEN;

      try {
        if (NODE_ENV === 'development' && SERVER_URL) {
          // For development - you might want to implement workflowClient later
          console.log('Development environment - skipping workflow trigger');
        } else if (NODE_ENV === 'production' && QSTASH_TOKEN && SERVER_URL) {
          // Trigger an Upstash workflow for production
          const qstash = new Client({
            token: QSTASH_TOKEN,
          });

          const response = await qstash.publish({
            url: `${SERVER_URL}/api/workflows/subscription/reminder`,
            body: JSON.stringify({
              subscriptionId: subscription.id,
            }),
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          return res.status(201).json({ 
            success: true, 
            data: { 
              subscription, 
              messageId: response.messageId 
            } 
          });
        }
      } catch (workflowError) {
        console.warn('Workflow trigger failed:', workflowError.message);
        // Continue without workflow - don't fail the subscription creation
      }

      res.status(201).json({ 
        success: true, 
        data: { subscription } 
      });
      
    } else if (req.method === 'DELETE') {
      // Delete all subscriptions (admin operation)
      const result = await Subscription.deleteMany({});
      
      res.status(200).json({
        success: true,
        message: `${result.deletedCount} subscriptions deleted successfully`,
      });
      
    } else {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }
  } catch (error) {
    return handleError(error, res);
  }
};

export default createHandler(subscriptionsHandler);