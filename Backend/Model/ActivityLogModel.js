const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ActivityLogSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserModel',
        required: true
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserModel',
        required: false // For system-generated activities
    },
    action: {
        type: String,
        required: true,
        enum: [
            'USER_CREATED',
            'USER_UPDATED', 
            'USER_DELETED',
            'LOGIN_SUCCESS',
            'LOGIN_FAILED',
            'PASSWORD_CHANGED',
            'PASSWORD_RESET_FORCED',
            'STATUS_CHANGED',
            'ACCOUNT_SUSPENDED',
            'ACCOUNT_UNSUSPENDED',
            'ACCOUNT_LOCKED',
            'ACCOUNT_UNLOCKED',
            'EMAIL_VERIFIED',
            'ROLE_CHANGED',
            'ADMIN_NOTES_UPDATED'
        ]
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: [500, 'Activity description cannot exceed 500 characters']
    },
    details: {
        type: Object, // Store structured data about the change
        default: {}
    },
    metadata: {
        ipAddress: String,
        userAgent: String,
        location: String
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    }
}, {
    timestamps: true,
    versionKey: false
});

// Add indexes for better performance
ActivityLogSchema.index({ userId: 1, createdAt: -1 });
ActivityLogSchema.index({ adminId: 1 });
ActivityLogSchema.index({ action: 1 });
ActivityLogSchema.index({ createdAt: -1 });

// Static methods for common queries
ActivityLogSchema.statics.getUserActivity = function(userId, limit = 50) {
    return this.find({ userId })
        .populate('adminId', 'name email role')
        .sort({ createdAt: -1 })
        .limit(limit);
};

ActivityLogSchema.statics.getAdminActivity = function(adminId, limit = 50) {
    return this.find({ adminId })
        .populate('userId', 'name email role')
        .sort({ createdAt: -1 })
        .limit(limit);
};

ActivityLogSchema.statics.logActivity = async function(data) {
    try {
        const activity = new this(data);
        return await activity.save();
    } catch (error) {
        console.error('Error logging activity:', error);
        // Don't throw error to prevent blocking main operations
        return null;
    }
};

// Instance method to format for display
ActivityLogSchema.methods.getDisplayText = function() {
    const timeAgo = this.getTimeAgo();
    return `${this.description} - ${timeAgo}`;
};

ActivityLogSchema.methods.getTimeAgo = function() {
    const now = new Date();
    const diff = now - this.createdAt;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) {
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (hours < 24) {
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
        return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
};

module.exports = mongoose.model("ActivityLog", ActivityLogSchema);