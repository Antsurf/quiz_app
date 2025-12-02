// JWT authentication middleware to protect routes
const jwt = require('jsonwebtoken');

// Secret key for JWT signing and verification
// store this in environment variables (not needed here but should be in production)
const SECRET_KEY = 'the-secret-key-of-god';

// Middleware function to verify JWT tokens
// This runs before route handlers else it doesn't work :(
function verifyToken(req, res, next) {
    // Get token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract token part

    // If no token provided, user is not authenticated => access denied 
    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Access denied. No token provided.' 
        });
    }

    // This checks if token is valid and not expired (only stays for 24h then it expires)

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            // Token is invalid or expired
            return res.status(403).json({ // thank you stackoverflow, 403 is for not authorized access
                success: false, 
                message: 'Invalid or expired token.' 
            });
        }

        // Token is valid, all info will be taken (id name etc..;)
        req.user = decoded;
        next();
    });
}

// Function to check user roles between ["student","instructor","admin"]
// This function will also check if someone is on the right and authorized page
function checkRole(allowedRoles) {
    return (req, res, next) => {
        // User info should be attached by verifyToken
        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Authentication required.' 
            });
        }

        // Check if user's role is in the allowed roles array
        if (allowedRoles.includes(req.user.role)) {
            next(); // User has permission
        } else {
            // Ex: student can't create a quiz, so no good GET OUT 
            res.status(403).json({ 
                success: false, 
                message: 'Access denied. Insufficient permissions.' 
            });
        }
    };
}

// Export functions and secret key (once again secret key shouldnt be here but we are not Microsoft)
module.exports = {
    verifyToken,
    checkRole,
    SECRET_KEY
};