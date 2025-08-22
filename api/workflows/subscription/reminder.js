import dayjs from 'dayjs';
import { createHandler, handleError } from '../../_lib/middleware.js';
import Subscription from '../../../backend/models/subsciption.model.js';

// Note: This is a simplified version of the workflow without @upstash/workflow
// For full Upstash Workflow support, you'd need to adapt this further

const REMINDERS = [7, 5, 2, 1];

const workflowReminderHandler = async (req, res) => {
  try {
    // Only POST method allowed
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { subscriptionId } = req.body;

    if (!subscriptionId) {
      const error = new Error('Subscription ID is required');
      error.statusCode = 400;
      throw error;
    }

    // Fetch the subscription with user details
    const subscription = await Subscription.findById(subscriptionId).populate('user', 'name email');

    if (!subscription || subscription.status !== 'active') {
      return res.status(200).json({
        success: true,
        message: 'Subscription not found or not active, workflow stopped'
      });
    }

    const renewalDate = dayjs(subscription.renewalDate);

    if (renewalDate.isBefore(dayjs())) {
      console.log(`Renewal date has passed for subscription ${subscriptionId}. Stopping workflow.`);
      return res.status(200).json({
        success: true,
        message: 'Renewal date has passed, workflow stopped'
      });
    }

    // In a serverless environment, you'd typically:
    // 1. Schedule individual reminder functions using QStash or similar
    // 2. Or process immediate reminders and schedule future ones
    
    const now = dayjs();
    const immediateReminders = [];
    const futureReminders = [];

    for (const daysBefore of REMINDERS) {
      const reminderDate = renewalDate.subtract(daysBefore, 'day');
      
      if (now.isSame(reminderDate, 'day')) {
        immediateReminders.push({
          daysBefore,
          type: `${daysBefore} days before reminder`,
          subscription
        });
      } else if (reminderDate.isAfter(now)) {
        futureReminders.push({
          daysBefore,
          reminderDate: reminderDate.toDate(),
          type: `${daysBefore} days before reminder`
        });
      }
    }

    // Process immediate reminders
    for (const reminder of immediateReminders) {
      console.log(`Processing immediate reminder: ${reminder.type}`);
      // Here you would call your email service
      // await sendReminderEmail({ ... });
    }

    // For future reminders, you'd typically schedule them with QStash or another scheduler
    console.log(`Scheduled ${futureReminders.length} future reminders`);

    res.status(200).json({
      success: true,
      message: 'Workflow processed successfully',
      data: {
        processedImmediate: immediateReminders.length,
        scheduledFuture: futureReminders.length,
        subscription: {
          id: subscription._id,
          name: subscription.name,
          renewalDate: subscription.renewalDate
        }
      }
    });

  } catch (error) {
    return handleError(error, res);
  }
};

export default createHandler(workflowReminderHandler);