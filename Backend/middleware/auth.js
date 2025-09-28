const jwt = require('jsonwebtoken');
const User = require('../Model/UserModel');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ 
                message: 'Access token is required' 
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Check if user still exists
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(401).json({ 
                message: 'Invalid token - user not found' 
            });
        }

        // Check if user is active
        if (user.status !== 'active') {
            return res.status(401).json({ 
                message: 'Account is inactive' 
            });
        }

        // Add user info to request
        req.user = decoded;
        req.userDetails = user;
        next();

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                message: 'Token has expired' 
            });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                message: 'Invalid token' 
            });
        } else {
            console.error('Authentication error:', error);
            return res.status(500).json({ 
                message: 'Error verifying token' 
            });
        }
    }
};

// Middleware to check if user has required role
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ 
                    message: 'Authentication required' 
                });
            }

            if (!allowedRoles.includes(req.user.role)) {
                return res.status(403).json({ 
                    message: `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.user.role}` 
                });
            }

            next();
        } catch (error) {
            console.error('Role authorization error:', error);
            return res.status(500).json({ 
                message: 'Error checking authorization' 
            });
        }
    };
};

// Middleware for admin-only access
const requireAdmin = requireRole('admin');

// Middleware for tutor or admin access
const requireTutorOrAdmin = requireRole('tutor', 'admin');

module.exports = {
    authenticateToken,
    requireRole,
    requireAdmin,
    requireTutorOrAdmin
};