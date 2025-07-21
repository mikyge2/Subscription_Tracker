import Subscription from '../models/subsciption.model.js';
import workflowClient from "../config/upstash.js";
import { SERVER_URL, QSTASH_TOKEN } from "../config/env.js";
import { Client } from "@upstash/qstash";

/**
 * Create a new subscription for the authenticated user
 * Also triggers a reminder workflow for the new subscription
 */
export const createSubscription = async (req, res, next) => {
    try {
        // Create subscription with data from request body and attach the user ID
        const subscription = await Subscription.create({
            ...req.body,
            user: req.user._id,
        });
        if(process.env.NODE_ENV==='development'){
            // Trigger an Upstash workflow to send reminders related to this subscription for local development
            const { workflowRunId } = await workflowClient.trigger({
                url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
                body: {
                    subscriptionId: subscription.id,
                },
                headers: {
                    'content-type': 'application/json',
                },
                retries: 0,
            });

            // Respond with the created subscription and workflow ID for local development
            res.status(201).json({ success: true, data: { subscription, workflowRunId } });
        }else if(process.env.NODE_ENV==='production'){
            // Trigger an Upstash workflow to send reminders related to this subscription for production
            const qstash = new Client({
                token: QSTASH_TOKEN,
            });

            const response = await qstash.publish({
                url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
                body: JSON.stringify({
                        subscriptionId: subscription.id,
                }),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            // Respond with the created subscription and message ID for local development
            res.status(201).json({ success: true, data: { subscription, messageId: response.messageId } });
        }
    } catch (error) {
        next(error);
    }
};

/**
 * Get all subscriptions belonging to a specific user
 * User can only access their own subscriptions (authorization enforced)
 */
export const getUserSubscriptions = async (req, res, next) => {
    try {
        // Check if the authenticated user matches the requested user ID
        if (req.user.id !== req.params.id) {
            const error = new Error('You are not the owner of this account');
            error.statusCode = 401;
            throw error;
        }

        // Find subscriptions by user ID
        const subscriptions = await Subscription.find({ user: req.params.id });

        // Send response with subscriptions
        res.status(200).json({ success: true, data: subscriptions });
    } catch (error) {
        next(error);
    }
};

/**
 * Get a single subscription by its ID
 * No ownership check here; might be handled by route middleware or elsewhere
 */
export const getSubscription = async (req, res, next) => {
    try {
        // Find subscription by ID
        const subscription = await Subscription.findById(req.params.id);

        // If subscription does not exist, throw 404 error
        if (!subscription) {
            const error = new Error('Subscription Not Found');
            error.statusCode = 404;
            throw error;
        }

        // Return the subscription
        res.status(200).json({ success: true, data: subscription });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all subscriptions in the database
 * Typically used by admins or for general listing
 */
export const getSubscriptions = async (req, res, next) => {
    try {
        const subscription = await Subscription.find();
        res.status(200).json({ success: true, data: subscription });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a subscription by its ID
 */
export const deleteSubscription = async (req, res, next) => {
    try {
        // Find the subscription by ID
        const subscription = await Subscription.findById(req.params.id);

        // If not found, return 404 error
        if (!subscription) {
            const error = new Error('Subscription Not Found');
            error.statusCode = 404;
            throw error;
        }

        // Delete the subscription document
        await subscription.deleteOne();

        // Respond with success message
        res.status(200).json({
            success: true,
            message: 'Subscription deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Cancel a subscription by changing its status to 'canceled'
 */
export const cancelSubscription = async (req, res, next) => {
    try {
        // Find subscription by ID
        const subscription = await Subscription.findById(req.params.id);

        // If not found, throw 404
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
        next(error);
    }
};

/**
 * Get upcoming subscription renewals for a user within the next 7 days
 * Only accessible by the owner of the subscriptions
 */
export const upcomingUserRenewals = async (req, res, next) => {
    try {
        // Ensure user owns the subscriptions they're querying
        if (req.user.id !== req.params.id) {
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
            user: req.params.id,
            status: 'active',
            renewalDate: { $gte: now, $lte: sevenDaysFromNow },
        });

        // Return subscriptions due for renewal soon
        res.status(200).json({
            success: true,
            data: subscriptions,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update an existing subscription
 * Only allowed fields can be updated and only by the subscription owner
 */
export const updateSubscription = async (req, res, next) => {
    try {
        // Find subscription by ID
        const subscription = await Subscription.findById(req.params.id);

        // Throw 404 if not found
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

        // Respond with updated subscription
        res.status(200).json({
            success: true,
            message: 'Subscription updated successfully',
            data: subscription,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete all subscriptions from the database
 * Typically admin-only operation
 */
export const deleteAllSubscriptions = async (req, res, next) => {
    try {
        // Delete all subscription documents
        const result = await Subscription.deleteMany({});

        // Respond with how many were deleted
        res.status(200).json({
            success: true,
            message: `${result.deletedCount} subscriptions deleted successfully`,
        });
    } catch (error) {
        next(error);
    }
};
