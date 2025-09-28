const jwt = require('jsonwebtoken');
const User = require('../Model/UserModel');
const ValidationUtils = require('../utils/ValidationUtils');

/**
 * Enhanced JWT authentication middleware
 */
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token is required',
                errors: { auth: ['Authentication token is required'] }
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Check if user still exists and is active
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User account no longer exists',
                errors: { auth: ['User account not found'] }
            });
        }

        // Check if account is still active
        if (user.status !== 'active') {
            return res.status(401).json({
                success: false,
                message: 'Account is not active',
                errors: { auth: ['Account is not active'] }
            });
        }

        // Check if account is locked
        if (user.isLocked || (user.loginAttempts.lockedUntil && user.loginAttempts.lockedUntil > new Date())) {
            return res.status(401).json({
                success: false,
                message: 'Account is locked',
                errors: { auth: ['Account is temporarily locked'] }
            });
        }

        // Add user info to request
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
            fullUser: user
        };

        next();

    } catch (error) {
        console.error('Token verification error:', error);
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Access token has expired',
                errors: { auth: ['Token has expired'] }
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid access token',
                errors: { auth: ['Invalid token'] }
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Authentication error',
            errors: { auth: ['Authentication failed'] }
        });
    }
};

/**
 * Role-based authorization middleware
 */
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
                errors: { auth: ['User not authenticated'] }
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
                errors: { 
                    auth: [`Insufficient permissions. User role: ${req.user.role}`] 
                },
                userRole: req.user.role,
                requiredRoles: allowedRoles
            });
        }

        next();
    };
};

/**
 * Permission-based authorization middleware
 */
const requirePermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
                errors: { auth: ['User not authenticated'] }
            });
        }

        // Define role permissions
        const rolePermissions = {
            student: ['read_profile', 'update_profile', 'read_courses', 'enroll_courses'],
            tutor: ['read_profile', 'update_profile', 'read_courses', 'create_courses', 'manage_sessions'],
            admin: ['*'] // Admin has all permissions
        };

        const userPermissions = rolePermissions[req.user.role] || [];
        
        // Check if user has permission or is admin
        if (!userPermissions.includes('*') && !userPermissions.includes(permission)) {
            return res.status(403).json({
                success: false,
                message: `Permission denied. Required permission: ${permission}`,
                errors: { 
                    auth: [`Missing required permission: ${permission}`] 
                },
                userRole: req.user.role,
                requiredPermission: permission
            });
        }

        next();
    };
};

/**
 * Self or admin access middleware
 */
const requireSelfOrAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required',
            errors: { auth: ['User not authenticated'] }
        });
    }

    const targetUserId = req.params.id || req.body.userId;
    
    // Validate target user ID format
    if (targetUserId) {
        const idValidation = ValidationUtils.validateObjectId(targetUserId);
        if (!idValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID format',
                errors: { id: idValidation.errors }
            });
        }
    }

    // Allow if user is admin or accessing their own data
    if (req.user.role === 'admin' || req.user.userId.toString() === targetUserId) {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Access denied. You can only access your own data or must be an admin.',
            errors: { 
                auth: ['Insufficient permissions for this resource'] 
            }
        });
    }
};

/**
 * Input validation middleware factory
 */
const validateInput = (validationSchema) => {
    return (req, res, next) => {
        const validation = ValidationUtils.validateUserData(req.body, validationSchema.isUpdate || false);
        
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Input validation failed',
                errors: validation.errors
            });
        }

        // Add sanitized data to request
        req.sanitizedData = validation.sanitized;
        next();
    };
};

/**
 * Request sanitization middleware
 */
const sanitizeRequest = (req, res, next) => {
    // Sanitize common fields
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = ValidationUtils.sanitizeInput(req.body[key]);
            }
        });
    }

    if (req.query) {
        Object.keys(req.query).forEach(key => {
            if (typeof req.query[key] === 'string') {
                req.query[key] = ValidationUtils.sanitizeInput(req.query[key]);
            }
        });
    }

    next();
};

/**
 * Admin-only middleware
 */
const requireAdmin = (req, res, next) => {
    return requireRole('admin')(req, res, next);
};

/**
 * Tutor or Admin middleware
 */
const requireTutorOrAdmin = (req, res, next) => {
    return requireRole('tutor', 'admin')(req, res, next);
};

/**
 * Security headers middleware
 */
const securityHeaders = (req, res, next) => {
    // Set security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Remove server fingerprinting
    res.removeHeader('X-Powered-By');
    
    next();
};

/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        const user = req.user ? `${req.user.email} (${req.user.role})` : 'anonymous';
        
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms - ${user}`);
        
        // Log failed authentication attempts
        if (res.statusCode === 401 || res.statusCode === 403) {
            console.warn(`🚨 Authentication/Authorization failed: ${req.method} ${req.originalUrl} - IP: ${req.ip} - User: ${user}`);
        }
    });
    
    next();
};

module.exports = {
    authenticateToken,
    requireRole,
    requirePermission,
    requireSelfOrAdmin,
    requireAdmin,
    requireTutorOrAdmin,
    validateInput,
    sanitizeRequest,
    securityHeaders,
    requestLogger
};