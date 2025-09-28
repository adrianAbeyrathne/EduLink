const express = require('express');
const router = express.Router();
const PasswordResetController = require('../Controllers/PasswordResetController');

// GET /reset-tokens - Get all reset tokens (admin only)
router.get('/', PasswordResetController.getAllResetTokens);

// POST /reset-tokens/generate - Generate password reset token
router.post('/generate', PasswordResetController.generateResetToken);

// GET /reset-tokens/verify/:token - Verify reset token
router.get('/verify/:token', PasswordResetController.verifyResetToken);

// PUT /reset-tokens/use/:token - Mark token as used
router.put('/use/:token', PasswordResetController.useResetToken);

// GET /reset-tokens/user/:userId - Get all reset tokens for a user
router.get('/user/:userId', PasswordResetController.getUserResetTokens);

// DELETE /reset-tokens/cleanup - Clean up expired tokens
router.delete('/cleanup', PasswordResetController.cleanupExpiredTokens);

module.exports = router;