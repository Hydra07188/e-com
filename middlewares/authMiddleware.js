const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth');

// Auth middleware boundary.
// Routes attach this middleware when an endpoint needs identity. Product routes
// do not use it, so guests can still browse catalog even if Auth is down.
function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization || '';
    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ error: 'Authentication token is required.' });
    }

    try {
        req.auth = jwt.verify(token, authConfig.jwtSecret);
        return next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token.' });
    }
}

module.exports = {
    authenticateToken
};
