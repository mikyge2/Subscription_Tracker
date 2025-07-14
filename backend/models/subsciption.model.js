// Import Mongoose library for MongoDB object modeling
import mongoose from "mongoose";

// Define the schema for the Subscription model
const subscriptionSchema = new mongoose.Schema({
    // Name of the subscription (e.g., Netflix, Spotify)
    name: {
        type: String,
        required: [true, "Subscription Name is required"],
        trim: true,
        minlength: 2,
        maxlength: 100,
    },
    // Cost of the subscription
    price: {
        type: Number,
        required: [true, "Price is required"],
        min: [0, "Price must be greater than 0"],
    },
    // Currency in which the subscription is billed
    currency: {
        type: String,
        enum: ['USD', 'EUR', 'GP', 'ETB'], // Only these currencies are allowed
        default: 'USD',
    },
    // Frequency of billing
    frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly'], // Allowed billing intervals
    },
    // Category to classify the subscription
    category: {
        type: String,
        enum: ['sports', 'news', 'entertainment', 'other'],
        required: [true, "Category is required"],
    },
    // Payment method used for the subscription
    payment: {
        type: String,
        required: [true, "Payment is required"],
        trim: true,
    },
    // Current status of the subscription
    status: {
        type: String,
        enum: ['active', 'canceled', 'expired'],
        default: 'active',
    },
    // When the subscription started
    startDate: {
        type: Date,
        required: true,
        validate: {
            validator: (value) => value <= new Date(), // Start date can't be in the future
            message: 'Start date must be in the past',
        },
    },
    // When the subscription will renew next
    renewalDate: {
        type: Date,
        validate: {
            validator: function (value) {
                return value > this.startDate; // Must be after the start date
            },
            message: 'Renewal date must be after start date',
        }
    },
    // Reference to the user who owns this subscription
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true, // Adds an index for efficient lookups
    }

}, {timestamps: true}); // Automatically add createdAt and updatedAt fields

// Middleware to automatically calculate renewalDate before saving if it's not provided
subscriptionSchema.pre('save', function (next) {
    if (!this.renewalDate) {
        const renewalPeriods = {
            daily: 1,
            weekly: 7,
            monthly: 30,
            yearly: 365,
        };
        // Set renewalDate by adding the frequency period to startDate
        this.renewalDate = new Date(this.startDate);
        this.renewalDate.setDate(this.renewalDate.getDate() + renewalPeriods[this.frequency]);
    }

    // Automatically set status to 'expired' if the renewal date is already past
    if (this.renewalDate < new Date()) {
        this.status = 'expired';
    }

    next(); // Continue with saving
});

// Create and export the Subscription model
const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;
