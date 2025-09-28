const express = require('express');
const router = express.Router();
const passport = require('passport'); // Use the main passport module
const AuthController = require('../Controllers/AuthController');
const { authenticateToken } = require('../middleware/auth');

// Make sure passport is initialized before defining routes
console.log('🔄 AuthRoutes: Checking available strategies...');
console.log('📋 Available strategies:', Object.keys(passport._strategies || {}));

// Google OAuth routes with detailed logging
router.get('/google', (req, res, next) => {
    console.log('📍 Google OAuth route hit');
    console.log('📋 Current strategies:', Object.keys(passport._strategies || {}));
    
    if (!passport._strategies['google']) {
        console.error('❌ Google strategy not found in registered strategies');
        return res.status(500).json({ error: 'Google authentication strategy not configured' });
    }
    
    console.log('✅ Google strategy found, proceeding with authentication...');
    next();
}, passport.authenticate('google', { 
    scope: ['profile', 'email'] 
}));

// Debug endpoint for testing OAuth setup
router.get('/google/status', (req, res) => {
    const hasGoogleStrategy = !!passport._strategies['google'];
    const hasCredentials = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
    
    res.json({
        message: 'Google OAuth Status Check',
        googleStrategy: hasGoogleStrategy ? 'Registered' : 'Not Registered',
        googleCredentials: hasCredentials ? 'Configured' : 'Missing',
        availableStrategies: Object.keys(passport._strategies || {}),
        oauthUrl: hasGoogleStrategy && hasCredentials ? `${req.protocol}://${req.get('host')}/api/auth/google` : 'Not Available',
        callbackUrl: process.env.GOOGLE_CALLBACK_URL,
        instructions: {
            postman: 'Cannot test OAuth flow directly in Postman - OAuth requires browser interaction',
            browser: `Visit ${req.protocol}://${req.get('host')}/api/auth/google in browser to test`,
            frontend: 'Use Google sign-in buttons in React frontend for full flow'
        }
    });
});

// Test endpoint for API tools
router.get('/google/init', (req, res) => {
    const hasGoogleStrategy = !!passport._strategies['google'];
    const hasCredentials = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
    
    if (!hasGoogleStrategy || !hasCredentials) {
        return res.status(500).json({
            error: 'Google OAuth not properly configured',
            googleStrategy: hasGoogleStrategy ? 'OK' : 'Missing',
            googleCredentials: hasCredentials ? 'OK' : 'Missing'
        });
    }
    
    // Instead of redirecting, return the URL for manual testing
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.GOOGLE_CALLBACK_URL)}&scope=profile%20email&response_type=code&access_type=offline`;
    
    res.json({
        message: 'Google OAuth initialization successful',
        authUrl: googleAuthUrl,
        instructions: {
            step1: 'Copy the authUrl above and paste it in your browser',
            step2: 'Complete Google authentication',
            step3: 'You will be redirected to the callback URL',
            note: 'This is how OAuth works - it requires browser interaction'
        },
        callbackUrl: process.env.GOOGLE_CALLBACK_URL
    });
});

// Public routes (no authentication required)

// POST /auth/register - Register new user
router.post('/register', AuthController.register);

// POST /auth/login - User login
router.post('/login', AuthController.login);

router.get('/google/callback', 
    passport.authenticate('google', { 
        failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/signin?error=google_auth_failed` 
    }),
    AuthController.googleCallback
);

// 2FA routes
router.post('/verify-2fa', AuthController.verify2FA);

// Protected routes (authentication required)

// GET /auth/profile - Get current user profile
router.get('/profile', authenticateToken, AuthController.getProfile);

// PUT /auth/change-password - Change password
router.put('/change-password', authenticateToken, AuthController.changePassword);

// POST /auth/enable-2fa - Enable Two-Factor Authentication
router.post('/enable-2fa', authenticateToken, AuthController.enable2FA);

// POST /auth/disable-2fa - Disable Two-Factor Authentication
router.post('/disable-2fa', authenticateToken, AuthController.disable2FA);

// POST /auth/logout - Logout user
router.post('/logout', authenticateToken, AuthController.logout);

module.exports = router;