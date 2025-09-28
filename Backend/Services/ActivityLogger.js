const ActivityLog = require('../Model/ActivityLogModel');

class ActivityLogger {
    static async logUserCreated(userId, adminId, userDetails) {
        return await ActivityLog.logActivity({
            userId,
            adminId,
            action: 'USER_CREATED',
            description: `User account created by admin: ${userDetails.name} (${userDetails.email})`,
            details: {
                userRole: userDetails.role,
                isAdminCreated: true,
                initialStatus: userDetails.status
            },
            severity: 'medium'
        });
    }

    static async logUserUpdated(userId, adminId, changes, previousData) {
        const changesList = Object.keys(changes)
            .filter(key => key !== 'password')
            .map(key => `${key}: ${previousData[key]} → ${changes[key]}`)
            .join(', ');

        return await ActivityLog.logActivity({
            userId,
            adminId,
            action: 'USER_UPDATED',
            description: `User profile updated: ${changesList}`,
            details: {
                changes,
                previousData: {
                    ...previousData,
                    password: '[HIDDEN]'
                }
            },
            severity: 'low'
        });
    }

    static async logUserDeleted(userId, adminId, userDetails) {
        return await ActivityLog.logActivity({
            userId,
            adminId,
            action: 'USER_DELETED',
            description: `User account deleted: ${userDetails.name} (${userDetails.email})`,
            details: {
                deletedUserRole: userDetails.role,
                deletedUserStatus: userDetails.status
            },
            severity: 'high'
        });
    }

    static async logLogin(userId, success, ipAddress, userAgent, reason = null) {
        const action = success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED';
        const description = success 
            ? 'User successfully logged in'
            : `Login failed: ${reason || 'Invalid credentials'}`;

        return await ActivityLog.logActivity({
            userId,
            action,
            description,
            details: {
                success,
                reason
            },
            metadata: {
                ipAddress,
                userAgent
            },
            severity: success ? 'low' : 'medium'
        });
    }

    static async logPasswordChanged(userId, adminId = null, forced = false) {
        return await ActivityLog.logActivity({
            userId,
            adminId,
            action: forced ? 'PASSWORD_RESET_FORCED' : 'PASSWORD_CHANGED',
            description: forced 
                ? 'Password reset forced by admin'
                : 'User changed password',
            details: { forced },
            severity: forced ? 'medium' : 'low'
        });
    }

    static async logStatusChange(userId, adminId, oldStatus, newStatus, reason = '') {
        let action = 'STATUS_CHANGED';
        let severity = 'medium';
        
        if (newStatus === 'suspended') {
            action = 'ACCOUNT_SUSPENDED';
            severity = 'high';
        } else if (oldStatus === 'suspended' && newStatus === 'active') {
            action = 'ACCOUNT_UNSUSPENDED';
            severity = 'medium';
        }

        return await ActivityLog.logActivity({
            userId,
            adminId,
            action,
            description: `Account status changed from ${oldStatus} to ${newStatus}${reason ? `: ${reason}` : ''}`,
            details: {
                oldStatus,
                newStatus,
                reason
            },
            severity
        });
    }

    static async logAccountLocked(userId, adminId, locked) {
        return await ActivityLog.logActivity({
            userId,
            adminId,
            action: locked ? 'ACCOUNT_LOCKED' : 'ACCOUNT_UNLOCKED',
            description: locked 
                ? 'Account locked by admin'
                : 'Account unlocked by admin',
            details: { locked },
            severity: locked ? 'high' : 'medium'
        });
    }

    static async logEmailVerified(userId, adminId = null) {
        return await ActivityLog.logActivity({
            userId,
            adminId,
            action: 'EMAIL_VERIFIED',
            description: adminId 
                ? 'Email verified by admin'
                : 'Email verified by user',
            severity: 'low'
        });
    }

    static async logRoleChanged(userId, adminId, oldRole, newRole) {
        return await ActivityLog.logActivity({
            userId,
            adminId,
            action: 'ROLE_CHANGED',
            description: `User role changed from ${oldRole} to ${newRole}`,
            details: {
                oldRole,
                newRole
            },
            severity: 'high'
        });
    }

    static async logAdminNotesUpdated(userId, adminId, hasNotes) {
        return await ActivityLog.logActivity({
            userId,
            adminId,
            action: 'ADMIN_NOTES_UPDATED',
            description: hasNotes 
                ? 'Admin notes added/updated'
                : 'Admin notes cleared',
            details: { hasNotes },
            severity: 'low'
        });
    }

    static async getUserRecentActivity(userId, limit = 20) {
        try {
            return await ActivityLog.getUserActivity(userId, limit);
        } catch (error) {
            console.error('Error fetching user activity:', error);
            return [];
        }
    }

    static async getAdminRecentActivity(adminId, limit = 50) {
        try {
            return await ActivityLog.getAdminActivity(adminId, limit);
        } catch (error) {
            console.error('Error fetching admin activity:', error);
            return [];
        }
    }
}

module.exports = ActivityLogger;