import aj from "../config/arcjet.js";

/**
 * Middleware to protect routes using Arcjet security service
 * It checks incoming requests for rate limiting, bot detection, and other rules
 */
const arcjetMiddleware = async (req, res, next) => {
    try {
        // Call Arcjet's protect method on the incoming request
        // 'requested: 1' indicates 1 token/request consumption for rate limiting
        const decision = await aj.protect(req, { requested: 1 });

        // If the request is denied by Arcjet rules, handle the rejection reason
        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) {
                // Respond with HTTP 429 Too Many Requests if rate limited
                return res.status(429).json({ error: "Too many requests" });
            }
            if (decision.reason.isBot()) {
                // Respond with HTTP 403 Forbidden if request is identified as a bot
                return res.status(403).json({ error: "Bot Detected" });
            }
            // Generic access denied for other reasons
            return res.status(403).json({ error: "Access Denied" });
        }

        // If allowed, continue to the next middleware or route handler
        next();
    } catch (error) {
        // Log any errors during Arcjet processing
        console.log(`Arcjet Middleware Error: ${error}`);
        next(error); // Pass error to Express error handling middleware
    }
};

export default arcjetMiddleware;
