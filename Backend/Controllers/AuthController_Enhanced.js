const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../Model/UserModel');
const ValidationUtils = require('../utils/ValidationUtils');
const rateLimit = require('express-rate-limit');

// Rate limiting for authentication endpoints
const createRateLimiter = (windowMs, max, message) => {
    return rateLimit({
        windowMs,
        max,
        message: { 
            success: false,
            message,
            retryAfter: Math.ceil(windowMs / 1000)
        },
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            res.status(429).json({
                success: false,
                message,
                retryAfter: Math.ceil(windowMs / 1000)
            });
        }
    });
};

// Rate limiters
const loginLimiter = createRateLimiter(15 * 60 * 1000, 5, 'Too many login attempts. Please try again later.');
const registerLimiter = createRateLimiter(60 * 60 * 1000, 3, 'Too many registration attempts. Please try again later.');
const passwordChangeLimiter = createRateLimiter(15 * 60 * 1000, 3, 'Too many password change attempts. Please try again later.');

// Helper function to generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        { 
            userId: user._id, 
            email: user.email, 
            role: user.role,
            iat: Math.floor(Date.now() / 1000)
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// Helper function to sanitize user data for response
const sanitizeUserForResponse = (user) => {
    const userObj = user.toObject ? user.toObject() : user;
    delete userObj.password;
    delete userObj.loginAttempts;
    return userObj;
};

// Register new user
exports.register = async (req, res) => {
    console.log('🔐 Registration attempt:', { email: req.body.email, role: req.body.role });
    
    try {
        // Apply rate limiting
        registerLimiter(req, res, async () => {
            // Comprehensive validation
            const validation = ValidationUtils.validateUserData(req.body, false);
            
            if (!validation.isValid) {
                console.log('❌ Registration validation failed:', validation.errors);
                return res.status(400).json({
                    success: false,
                    message: "Registration validation failed. Please check your input data.",
                    errors: validation.errors
                });
            }

            const sanitizedData = validation.sanitized;

            // Additional password requirement for registration
            if (!req.body.password || req.body.password.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: "Password is required for registration",
                    errors: { password: ['Password is required'] }
                });
            }

            // Validate password strength
            const passwordValidation = ValidationUtils.validatePassword(req.body.password, {
                name: sanitizedData.name,
                email: sanitizedData.email
            });

            if (!passwordValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: "Password does not meet security requirements",
                    errors: { password: passwordValidation.errors }
                });
            }

            // Check if user already exists
            const existingUser = await User.findOne({ email: sanitizedData.email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: "An account with this email address already exists",
                    errors: { email: ['Email address is already registered'] }
                });
            }

            // Hash password
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

            // Create new user with validated data
            const userData = {
                ...sanitizedData,
                password: hashedPassword,
                status: 'active',
                isVerified: false, // Email verification would be implemented here
                isAdminCreated: false
            };

            const user = new User(userData);
            await user.save();

            // Generate JWT token
            const token = generateToken(user);

            // Prepare response
            const userResponse = sanitizeUserForResponse(user);

            console.log('✅ User registered successfully:', { id: user._id, email: user.email });

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                user: userResponse,
                token,
                note: 'Please verify your email address to activate all features'
            });
        });

    } catch (error) {
        console.error('Registration error:', error);
        
        // Handle specific errors
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Email address is already registered",
                errors: { email: ['Email address is already taken'] }
            });
        }
        
        if (error.name === 'ValidationError') {
            const validationErrors = {};
            Object.keys(error.errors).forEach(key => {
                validationErrors[key] = [error.errors[key].message];
            });
            
            return res.status(400).json({
                success: false,
                message: "Registration validation failed",
                errors: validationErrors
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Registration failed. Please try again.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Login user with comprehensive security
exports.login = async (req, res) => {
    console.log('🔐 Login attempt:', { email: req.body.email, role: req.body.role });
    
    try {
        // Apply rate limiting
        loginLimiter(req, res, async () => {
            const { email, password, role } = req.body;

            // Input validation
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and password are required',
                    errors: {
                        email: !email ? ['Email is required'] : [],
                        password: !password ? ['Password is required'] : []
                    }
                });
            }

            // Validate email format
            const emailValidation = ValidationUtils.validateEmail(email);
            if (!emailValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid email format',
                    errors: { email: emailValidation.errors }
                });
            }

            const sanitizedEmail = emailValidation.sanitized;

            // Find user by email
            const user = await User.findOne({ email: sanitizedEmail });
            if (!user) {
                console.log('❌ Login failed: User not found:', sanitizedEmail);
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password',
                    errors: { credentials: ['Invalid login credentials'] }
                });
            }

            // Check account status
            if (user.status === 'suspended') {
                const suspensionInfo = {
                    reason: user.suspensionReason || 'Account suspended',
                    expiry: user.suspensionExpiry
                };
                
                // Check if suspension has expired
                if (user.suspensionExpiry && user.suspensionExpiry <= new Date()) {
                    // Auto-reactivate expired suspensions
                    user.status = 'active';
                    user.suspensionReason = '';
                    user.suspensionExpiry = null;
                    await user.save();
                    console.log('✅ Auto-reactivated expired suspension for:', user.email);
                } else {
                    console.log('❌ Login failed: Account suspended:', sanitizedEmail);
                    return res.status(401).json({
                        success: false,
                        message: 'Account is suspended',
                        suspensionInfo,
                        errors: { account: ['Account is currently suspended'] }
                    });
                }
            }

            if (user.status === 'inactive') {
                console.log('❌ Login failed: Account inactive:', sanitizedEmail);
                return res.status(401).json({
                    success: false,
                    message: 'Account is inactive. Please contact administrator.',
                    errors: { account: ['Account is inactive'] }
                });
            }

            // Check if account is locked due to too many failed attempts
            if (user.isLocked || (user.loginAttempts.lockedUntil && user.loginAttempts.lockedUntil > new Date())) {
                console.log('❌ Login failed: Account locked:', sanitizedEmail);
                return res.status(401).json({
                    success: false,
                    message: 'Account is temporarily locked due to too many failed login attempts',
                    errors: { account: ['Account is temporarily locked'] },
                    lockedUntil: user.loginAttempts.lockedUntil
                });
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                console.log('❌ Login failed: Invalid password:', sanitizedEmail);
                
                // Update failed login attempts
                user.loginAttempts.count = (user.loginAttempts.count || 0) + 1;
                user.loginAttempts.lastAttempt = new Date();
                
                // Lock account after 5 failed attempts
                if (user.loginAttempts.count >= 5) {
                    user.loginAttempts.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
                    console.log('🔒 Account locked due to failed attempts:', sanitizedEmail);
                }
                
                await user.save();
                
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password',
                    errors: { credentials: ['Invalid login credentials'] },
                    remainingAttempts: Math.max(0, 5 - user.loginAttempts.count)
                });
            }

            // Check role if specified
            if (role && user.role !== role) {
                console.log('❌ Login failed: Role mismatch:', { userRole: user.role, requestedRole: role });
                return res.status(401).json({
                    success: false,
                    message: `Access denied. This account is not registered as ${role}.`,
                    errors: { role: [`Account role is ${user.role}, not ${role}`] }
                });
            }

            // Check if password reset is required
            if (user.forcePasswordReset) {
                const tempToken = jwt.sign(
                    { userId: user._id, purpose: 'password-reset' },
                    process.env.JWT_SECRET || 'your-secret-key',
                    { expiresIn: '30m' }
                );
                
                return res.status(200).json({
                    success: true,
                    message: 'Password reset required',
                    requiresPasswordReset: true,
                    tempToken,
                    user: { _id: user._id, email: user.email, name: user.name }
                });
            }

            // Successful login - reset failed attempts and update last login
            user.loginAttempts.count = 0;
            user.loginAttempts.lastAttempt = null;
            user.loginAttempts.lockedUntil = null;
            user.lastLogin = new Date();
            await user.save();

            // Generate JWT token
            const token = generateToken(user);

            // Prepare response
            const userResponse = sanitizeUserForResponse(user);

            console.log('✅ Login successful:', { id: user._id, email: user.email, role: user.role });

            res.status(200).json({
                success: true,
                message: 'Login successful',
                user: userResponse,
                token
            });
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed. Please try again.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get current user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password -loginAttempts');
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        res.status(200).json({
            success: true,
            message: 'Profile retrieved successfully',
            user
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving profile',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Change password with comprehensive validation
exports.changePassword = async (req, res) => {
    try {
        // Apply rate limiting
        passwordChangeLimiter(req, res, async () => {
            const { currentPassword, newPassword, confirmPassword } = req.body;

            // Validation
            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password and new password are required',
                    errors: {
                        currentPassword: !currentPassword ? ['Current password is required'] : [],
                        newPassword: !newPassword ? ['New password is required'] : []
                    }
                });
            }

            // Check password confirmation
            if (confirmPassword && newPassword !== confirmPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'New password and confirmation do not match',
                    errors: { confirmPassword: ['Passwords do not match'] }
                });
            }

            // Find user
            const user = await User.findById(req.user.userId);
            if (!user) {
                return res.status(404).json({ 
                    success: false,
                    message: 'User not found' 
                });
            }

            // Verify current password
            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                console.log('❌ Password change failed: Invalid current password:', user.email);
                return res.status(400).json({
                    success: false,
                    message: 'Current password is incorrect',
                    errors: { currentPassword: ['Current password is incorrect'] }
                });
            }

            // Validate new password strength
            const passwordValidation = ValidationUtils.validatePassword(newPassword, {
                name: user.name,
                email: user.email
            });

            if (!passwordValidation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: 'New password does not meet security requirements',
                    errors: { newPassword: passwordValidation.errors }
                });
            }

            // Check if new password is different from current
            const isSamePassword = await bcrypt.compare(newPassword, user.password);
            if (isSamePassword) {
                return res.status(400).json({
                    success: false,
                    message: 'New password must be different from current password',
                    errors: { newPassword: ['New password must be different from current password'] }
                });
            }

            // Hash new password
            const saltRounds = 12;
            const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

            // Update password and clear force reset flag
            user.password = hashedNewPassword;
            user.forcePasswordReset = false;
            await user.save();

            console.log('✅ Password changed successfully:', user.email);

            res.status(200).json({
                success: true,
                message: 'Password changed successfully'
            });
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error changing password',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Logout (client-side token invalidation, server can track if needed)
exports.logout = async (req, res) => {
    try {
        // In a more advanced setup, you could blacklist the token
        // For now, we'll just send a success response
        res.status(200).json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging out',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Export rate limiters for use in routes
exports.loginLimiter = loginLimiter;
exports.registerLimiter = registerLimiter;
exports.passwordChangeLimiter = passwordChangeLimiter;