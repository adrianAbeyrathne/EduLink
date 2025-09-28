const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const User = require('../Model/UserModel');
const ValidationUtils = require('../utils/ValidationUtils');

// Email transporter configuration
const createEmailTransporter = () => {
    return nodemailer.createTransporter({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// Generate OTP for email-based 2FA
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp, userName) => {
    const transporter = createEmailTransporter();
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'EduLink - Two-Factor Authentication Code',
        html: `
            <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
                    <h1 style="margin: 0;">EduLink</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Two-Factor Authentication</p>
                </div>
                <div style="padding: 30px; background: #f9f9f9;">
                    <h2 style="color: #333; margin-top: 0;">Hello ${userName}!</h2>
                    <p style="color: #666; line-height: 1.6;">
                        Your verification code for signing in to EduLink is:
                    </p>
                    <div style="background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0;">
                        <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px;">${otp}</span>
                    </div>
                    <p style="color: #666; line-height: 1.6;">
                        This code will expire in <strong>10 minutes</strong>. If you didn't request this code, please ignore this email.
                    </p>
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                        <p style="color: #999; font-size: 12px; margin: 0;">
                            This is an automated message from EduLink. Please do not reply to this email.
                        </p>
                    </div>
                </div>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
};

// Register new user
exports.register = async (req, res) => {
    try {
        const { name, email, password, role, age } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({ 
                message: 'Name, email, and password are required' 
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                message: 'User with this email already exists' 
            });
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user
        const user = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'student',
            age: age || 18,
            status: 'active'
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user._id, 
                email: user.email, 
                role: user.role 
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        // Return user data (without password) and token
        const userData = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            age: user.age,
            status: user.status,
            profilePic: user.profilePic
        };

        res.status(201).json({
            message: 'User registered successfully',
            user: userData,
            token
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            message: 'Error registering user', 
            error: error.message 
        });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ 
                message: 'Email and password are required' 
            });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ 
                message: 'Invalid email or password' 
            });
        }

        // Check if account is active
        if (user.status !== 'active') {
            return res.status(401).json({ 
                message: 'Account is inactive. Please contact administrator.' 
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                message: 'Invalid email or password' 
            });
        }

        // Check role if specified
        if (role && user.role !== role) {
            return res.status(401).json({ 
                message: `Access denied. This account is not registered as ${role}.` 
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user._id, 
                email: user.email, 
                role: user.role 
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Return user data (without password) and token
        const userData = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            age: user.age,
            status: user.status,
            profilePic: user.profilePic,
            lastLogin: user.lastLogin
        };

        res.status(200).json({
            message: 'Login successful',
            user: userData,
            token
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            message: 'Error logging in', 
            error: error.message 
        });
    }
};

// Get current user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'Profile retrieved successfully',
            user
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ 
            message: 'Error retrieving profile', 
            error: error.message 
        });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ 
                message: 'Current password and new password are required' 
            });
        }

        // Find user
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({ 
                message: 'Current password is incorrect' 
            });
        }

        // Hash new password
        const saltRounds = 12;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update password
        user.password = hashedNewPassword;
        await user.save();

        res.status(200).json({
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ 
            message: 'Error changing password', 
            error: error.message 
        });
    }
};

// Logout (client-side token invalidation, server can track if needed)
exports.logout = async (req, res) => {
    try {
        // In a more advanced setup, you could blacklist the token
        // For now, we'll just send a success response
        res.status(200).json({
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ 
            message: 'Error logging out', 
            error: error.message 
        });
    }
};

// Verify 2FA OTP
exports.verify2FA = async (req, res) => {
    try {
        const { userId, otp } = req.body;

        if (!userId || !otp) {
            return res.status(400).json({
                success: false,
                message: 'User ID and OTP are required'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if OTP exists and hasn't expired
        if (!user.emailOTP || !user.emailOTP.code) {
            return res.status(400).json({
                success: false,
                message: 'No OTP found. Please request a new one.'
            });
        }

        if (new Date() > user.emailOTP.expires) {
            return res.status(400).json({
                success: false,
                message: 'OTP has expired. Please request a new one.'
            });
        }

        // Check attempt limit
        if (user.emailOTP.attempts >= 3) {
            return res.status(429).json({
                success: false,
                message: 'Too many OTP attempts. Please request a new code.'
            });
        }

        // Verify OTP
        if (user.emailOTP.code !== otp) {
            await User.findByIdAndUpdate(userId, {
                $inc: { 'emailOTP.attempts': 1 }
            });

            return res.status(401).json({
                success: false,
                message: 'Invalid OTP code'
            });
        }

        // Clear OTP and update login info
        await User.findByIdAndUpdate(userId, {
            $unset: { emailOTP: 1 },
            lastLogin: new Date(),
            $push: {
                loginHistory: {
                    timestamp: new Date(),
                    ipAddress: req.ip,
                    userAgent: req.get('User-Agent'),
                    method: '2fa'
                }
            }
        });

        // Generate token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: '2FA verification successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                authProvider: user.authProvider,
                twoFactorEnabled: user.twoFactorEnabled
            },
            token
        });

    } catch (error) {
        console.error('2FA verification error:', error);
        res.status(500).json({
            success: false,
            message: '2FA verification failed. Please try again.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Google OAuth success callback
exports.googleCallback = async (req, res) => {
    try {
        if (!req.user) {
            return res.redirect(`${process.env.FRONTEND_URL}/signin?error=google_auth_failed`);
        }

        // Update login info
        await User.findByIdAndUpdate(req.user._id, {
            lastLogin: new Date(),
            $push: {
                loginHistory: {
                    timestamp: new Date(),
                    ipAddress: req.ip,
                    userAgent: req.get('User-Agent'),
                    method: 'google'
                }
            }
        });

        // Generate token
        const token = generateToken(req.user._id);

        // Redirect to frontend with token and user info
        const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            authProvider: req.user.authProvider
        }))}`;

        res.redirect(redirectUrl);

    } catch (error) {
        console.error('Google callback error:', error);
        res.redirect(`${process.env.FRONTEND_URL}/signin?error=callback_failed`);
    }
};

// Enable 2FA
exports.enable2FA = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.twoFactorEnabled) {
            return res.status(400).json({
                success: false,
                message: '2FA is already enabled'
            });
        }

        // Enable 2FA
        await User.findByIdAndUpdate(userId, {
            twoFactorEnabled: true
        });

        res.status(200).json({
            success: true,
            message: '2FA has been enabled successfully'
        });

    } catch (error) {
        console.error('Enable 2FA error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to enable 2FA',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Disable 2FA
exports.disable2FA = async (req, res) => {
    try {
        const userId = req.user.id;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Password is required to disable 2FA'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid password'
            });
        }

        // Disable 2FA
        await User.findByIdAndUpdate(userId, {
            twoFactorEnabled: false,
            $unset: { twoFactorSecret: 1, twoFactorBackupCodes: 1 }
        });

        res.status(200).json({
            success: true,
            message: '2FA has been disabled successfully'
        });

    } catch (error) {
        console.error('Disable 2FA error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to disable 2FA',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};