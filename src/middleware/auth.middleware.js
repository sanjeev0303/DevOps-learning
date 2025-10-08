import logger from '#config/logger.js';
import { jwttoken } from '#utils/jwt.js';
import { cookies } from '#utils/cookies.js';

export const authenticate = async (req, res, next) => {
    try {
        // Get token from cookie or Authorization header
        let token = cookies.get(req, 'token');

        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        // Verify token
        const decoded = jwttoken.verify(token);
        req.user = decoded; // Attach user info to request object
        next();

    } catch (error) {
        logger.error('Authentication middleware error:', error);
        return res.status(401).json({ error: 'Invalid token.' });
    }
};

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Access denied. Please authenticate first.' });
        }

        if (roles.length && !roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Access denied. Insufficient privileges.' });
        }

        next();
    };
};
