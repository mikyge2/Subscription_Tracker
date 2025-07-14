// Import arcjet main function and helpers for security features
import arcjet, { shield, detectBot, tokenBucket } from '@arcjet/node';

// Import your Arcjet API key from environment variables
import { ARCJET_KEY } from "./env.js";

// Initialize Arcjet instance with configuration
const aj = arcjet({
    key: ARCJET_KEY, // Your unique API key for Arcjet service

    // Characteristics to track for each request, here tracking by source IP address
    characteristics: ["ip.src"],

    // Define security rules to protect your app
    rules: [
        // Shield: protects app against common attacks like SQL injection
        shield({ mode: "LIVE" }), // LIVE mode actively blocks threats (use "DRY_RUN" to just log)

        // Bot detection rule to identify and block bots
        detectBot({
            mode: "LIVE", // Actively block detected bots (DRY_RUN logs only)
            allow: [
                "CATEGORY:SEARCH_ENGINE", // Allow legitimate search engine bots like Google, Bing
                // You can also allow other categories by uncommenting below:
                // "CATEGORY:MONITOR",   // Uptime monitoring bots
                // "CATEGORY:PREVIEW",   // Link preview bots (Slack, Discord, etc)
                "POSTMAN",              // Allow Postman client for testing API calls
            ],
        }),

        // Rate limiting using token bucket algorithm
        tokenBucket({
            mode: "LIVE",        // Enforce limits, blocks requests when exceeded
            refillRate: 5,       // Add 5 tokens every interval
            interval: 10,        // Interval in seconds to refill tokens
            capacity: 5,         // Maximum number of tokens in the bucket
        }),
    ],
});

// Export the configured Arcjet instance for use in your app middleware
export default aj;
