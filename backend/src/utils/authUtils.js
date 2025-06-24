// backend/src/utils/authUtils.js
const jwt = require('jsonwebtoken');

exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token == null) {
        return res.status(401).json({ message: 'Authentication token required.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token.' });
        }
        req.user = user; // Attach user payload (including role) to request
        next();
    });
};

// New: Middleware for role-based authorization
exports.authorizeRole = (requiredRole) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ message: 'Access denied: User role not found.' });
        }
        if (req.user.role !== requiredRole) {
            return res.status(403).json({ message: `Access denied: Requires ${requiredRole} role.` });
        }
        next();
    };
};