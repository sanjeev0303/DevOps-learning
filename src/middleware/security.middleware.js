import aj from "#config/arcjet.js"
import logger from "#config/logger.js";
import { slidingWindow } from "@arcjet/node";

export const securityMiddleware = async (req, res, next) => {
    try {
        const role = req.user?.role || "guest"
        const userAgent = req.get("User-Agent") || ""

        // Skip security checks for requests without User-Agent (internal/health checks)
        if (!userAgent || userAgent === "") {
            logger.info("Request without User-Agent header allowed (likely internal/health check)", {
                ip: req.ip,
                path: req.path,
                method: req.method
            });
            return next();
        }

        // Allow development tools in development mode
        if (process.env.NODE_ENV === 'development') {
            const isDevelopmentTool = userAgent.includes('PostmanRuntime') ||
                                    userAgent.includes('Insomnia') ||
                                    userAgent.includes('curl') ||
                                    userAgent.includes('HTTPie') ||
                                    userAgent.includes('Thunder Client');

            if (isDevelopmentTool) {
                logger.info("Development tool request allowed", {
                    ip: req.ip,
                    userAgent: userAgent,
                    path: req.path
                });
                return next();
            }
        }

        let limit;
        let message;

        switch (role) {
            case "admin":
                limit=20;
                message="Admin request limit exceeded (20 per minute). Slow down."
                break;
            case "user":
                limit=10;
                message="User request limit exceeded (10 per minute). Slow down."
                break;
            case "guest":
                limit=5;
                message="Guest request limit exceeded (5 per minute). Slow down."
                break;

            default:
                break;
        }

        const client = aj.withRule(slidingWindow({
            mode: 'LIVE',
            interval: '1m',
            max: limit,
            name: `${role}-rate-limit`
        }))

        const decision = await client.protect(req, {
            userId: req.user?.id || undefined,
            requested: 1
        })

        if (decision.isDenied() && decision.reason.isBot()) {
            logger.warn("Bot request blocked", { ip: req.ip, userAgent: req.get("User-Agent"), path: req.path })

            return res.status(403).json({ error: "Forbidden", message: "Automated requests are not allowed"})
        }

        if (decision.isDenied() && decision.reason.isShield()) {
            logger.warn("Shield request blocked", { ip: req.ip, userAgent: req.get("User-Agent"), path: req.path, method: req.method })

            return res.status(403).json({ error: "Forbidden", message: "Request blocked by security policy"})
        }

        if (decision.isDenied() && decision.reason.isRateLimit()) {
            logger.warn("Rate limit exceeded", { ip: req.ip, userAgent: req.get("User-Agent"), path: req.path, method: req.method })

            return res.status(403).json({ error: "Forbidden", message: "Too many requests"})
        }

        next()
    } catch (error) {
        logger.error("Arcjet middleware error: ", error)
        res.status(500).json({ error: "Internal server error", message: "Something went wrong with security middleware"})
    }
}
