// middleware/auth.js
// JWT authentication middleware to protect routes

const jwt = require('jsonwebtoken');

// Secret key for JWT signing and verification
// store this in environment variables (not needed here but should be in production)
const SECRET_KEY = 'the-secret-key-of-god';

// Middleware function to verify JWT tokens
// This runs before protected route handlers
function verifyToken(req, res, next) {
    // Get token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract token part

    // If no token provided, user is not authenticated
    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Access denied. No token provided.' 
        });
    }

    // Verify the token using jwt.verify()
    // This checks if token is valid and not expired
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            // Token is invalid or expired
            return res.status(403).json({ 
                success: false, 
                message: 'Invalid or expired token.' 
            });
        }

        // Token is valid - attach user info to request object
        // decoded contains the payload we put in the token (user id, role, etc.)
        req.user = decoded;
        
        // Call next() to proceed to the actual route handler
        next();
    });
}

// Middleware to check if user has specific role(s)
// Usage: checkRole(['admin', 'instructor'])
function checkRole(allowedRoles) {
    return (req, res, next) => {
        // User info should be attached by verifyToken middleware
        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Authentication required.' 
            });
        }

        // Check if user's role is in the allowed roles array
        if (allowedRoles.includes(req.user.role)) {
            next(); // User has permission, proceed
        } else {
            res.status(403).json({ 
                success: false, 
                message: 'Access denied. Insufficient permissions.' 
            });
        }
    };
}

// Export middleware functions and secret key
module.exports = {
    verifyToken,
    checkRole,
    SECRET_KEY
};