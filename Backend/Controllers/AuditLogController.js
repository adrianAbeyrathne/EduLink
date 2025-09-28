const AuditLog = require('../Model/AuditLog');

// Get all audit logs
const getAllAuditLogs = async (req, res) => {
    const ready = AuditLog.db.readyState;
    if (ready !== 1) {
        return res.status(503).json({ message: 'Database not connected', readyState: ready });
    }

    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const logs = await AuditLog.find()
            .populate('admin_id', 'name email')
            .populate('target_user_id', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await AuditLog.countDocuments();

        return res.status(200).json({ 
            logs, 
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.error('Error fetching audit logs:', err);
        return res.status(500).json({ message: 'Failed to fetch audit logs' });
    }
};

// Create new audit log
const createAuditLog = async (req, res) => {
    const { admin_id, action_type, target_user_id, details } = req.body;

    try {
        const auditLog = new AuditLog({
            admin_id,
            action_type,
            target_user_id,
            details
        });
        await auditLog.save();
        
        const populatedLog = await AuditLog.findById(auditLog._id)
            .populate('admin_id', 'name email')
            .populate('target_user_id', 'name email');

        return res.status(201).json({ auditLog: populatedLog });
    } catch (err) {
        console.error('Error creating audit log:', err);
        return res.status(500).json({ message: 'Failed to create audit log' });
    }
};

// Get audit logs by admin
const getLogsByAdmin = async (req, res) => {
    const { adminId } = req.params;

    try {
        const logs = await AuditLog.find({ admin_id: adminId })
            .populate('admin_id', 'name email')
            .populate('target_user_id', 'name email')
            .sort({ createdAt: -1 });

        return res.status(200).json({ logs });
    } catch (err) {
        console.error('Error fetching admin logs:', err);
        return res.status(500).json({ message: 'Failed to fetch admin logs' });
    }
};

// Get audit logs by target user
const getLogsByTargetUser = async (req, res) => {
    const { userId } = req.params;

    try {
        const logs = await AuditLog.find({ target_user_id: userId })
            .populate('admin_id', 'name email')
            .populate('target_user_id', 'name email')
            .sort({ createdAt: -1 });

        return res.status(200).json({ logs });
    } catch (err) {
        console.error('Error fetching user logs:', err);
        return res.status(500).json({ message: 'Failed to fetch user logs' });
    }
};

// Get audit logs by action type
const getLogsByActionType = async (req, res) => {
    const { actionType } = req.params;

    try {
        const logs = await AuditLog.find({ action_type: actionType })
            .populate('admin_id', 'name email')
            .populate('target_user_id', 'name email')
            .sort({ createdAt: -1 });

        return res.status(200).json({ logs });
    } catch (err) {
        console.error('Error fetching action logs:', err);
        return res.status(500).json({ message: 'Failed to fetch action logs' });
    }
};

// Delete audit log (admin only)
const deleteAuditLog = async (req, res) => {
    const { id } = req.params;

    try {
        const log = await AuditLog.findByIdAndDelete(id);
        if (!log) {
            return res.status(404).json({ message: 'Audit log not found' });
        }
        return res.status(200).json({ message: 'Audit log deleted successfully' });
    } catch (err) {
        console.error('Error deleting audit log:', err);
        return res.status(500).json({ message: 'Failed to delete audit log' });
    }
};

module.exports = {
    getAllAuditLogs,
    createAuditLog,
    getLogsByAdmin,
    getLogsByTargetUser,
    getLogsByActionType,
    deleteAuditLog
};