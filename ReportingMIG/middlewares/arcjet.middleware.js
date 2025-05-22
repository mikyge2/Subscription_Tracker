// arcjetMiddleware.js
import { isSpoofedBot } from "@arcjet/inspect";
import aj from "../config/arcjet.js";

const arcjetMiddleware = async (req, res, next) => {
    try {
        const decision = await aj.protect(req, { requested: 5 });
        req.arcjetDecision = decision; // Optional: pass to route if needed

        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) {
                return res.status(429).json({ error: "Too Many Requests" });
            } else if (decision.reason.isBot()) {
                return res.status(403).json({ error: "No bots allowed" });
            } else {
                return res.status(403).json({ error: "Forbidden" });
            }
        }

        if (decision.results.some(isSpoofedBot)) {
            return res.status(403).json({ error: "Forbidden" });
        }

        next();
    } catch (err) {
        console.error("Arcjet error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export default arcjetMiddleware;
