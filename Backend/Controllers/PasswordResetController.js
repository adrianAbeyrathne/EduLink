const PasswordResetToken = require('../Model/PasswordResetToken');
const crypto = require('crypto');

// Generate password reset token
const generateResetToken = async (req, res) => {
    const { userId } = req.body;

    try {
        // Generate secure random token
        const token = crypto.randomBytes(32).toString('hex');
        
        // Set expiry time (24 hours from now)
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        // Delete any existing tokens for this user
        await PasswordResetToken.deleteMany({ user: userId, used: false });

        // Create new token
        const resetToken = new PasswordResetToken({
            user: userId,
            token,
            expires_at: expiresAt
        });

        await resetToken.save();

        const populatedToken = await PasswordResetToken.findById(resetToken._id)
            .populate('user', 'name email');

        return res.status(201).json({ 
            message: 'Reset token generated successfully',
            resetToken: populatedToken 
        });
    } catch (err) {
        console.error('Error generating reset token:', err);
        return res.status(500).json({ message: 'Failed to generate reset token' });
    }
};

// Verify reset token
const verifyResetToken = async (req, res) => {
    const { token } = req.params;

    try {
        const resetToken = await PasswordResetToken.findOne({ 
            token,
            used: false,
            expires_at: { $gt: new Date() }
        }).populate('user', 'name email');

        if (!resetToken) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        return res.status(200).json({ 
            message: 'Token is valid',
            resetToken 
        });
    } catch (err) {
        console.error('Error verifying reset token:', err);
        return res.status(500).json({ message: 'Failed to verify reset token' });
    }
};

// Mark token as used
const useResetToken = async (req, res) => {
    const { token } = req.params;

    try {
        const resetToken = await PasswordResetToken.findOneAndUpdate(
            { 
                token,
                used: false,
                expires_at: { $gt: new Date() }
            },
            { used: true },
            { new: true }
        ).populate('user', 'name email');

        if (!resetToken) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        return res.status(200).json({ 
            message: 'Token marked as used',
            resetToken 
        });
    } catch (err) {
        console.error('Error using reset token:', err);
        return res.status(500).json({ message: 'Failed to use reset token' });
    }
};

// Get all reset tokens for a user
const getUserResetTokens = async (req, res) => {
    const { userId } = req.params;

    try {
        const tokens = await PasswordResetToken.find({ user: userId })
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        return res.status(200).json({ tokens });
    } catch (err) {
        console.error('Error fetching user reset tokens:', err);
        return res.status(500).json({ message: 'Failed to fetch user reset tokens' });
    }
};

// Clean up expired tokens
const cleanupExpiredTokens = async (req, res) => {
    try {
        const result = await PasswordResetToken.deleteMany({
            expires_at: { $lt: new Date() }
        });

        return res.status(200).json({ 
            message: 'Expired tokens cleaned up',
            deletedCount: result.deletedCount 
        });
    } catch (err) {
        console.error('Error cleaning up expired tokens:', err);
        return res.status(500).json({ message: 'Failed to cleanup expired tokens' });
    }
};

// Get all reset tokens (admin only)
const getAllResetTokens = async (req, res) => {
    const ready = PasswordResetToken.db.readyState;
    if (ready !== 1) {
        return res.status(503).json({ message: 'Database not connected', readyState: ready });
    }

    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const tokens = await PasswordResetToken.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await PasswordResetToken.countDocuments();

        return res.status(200).json({ 
            tokens, 
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.error('Error fetching reset tokens:', err);
        return res.status(500).json({ message: 'Failed to fetch reset tokens' });
    }
};

module.exports = {
    generateResetToken,
    verifyResetToken,
    useResetToken,
    getUserResetTokens,
    cleanupExpiredTokens,
    getAllResetTokens
};