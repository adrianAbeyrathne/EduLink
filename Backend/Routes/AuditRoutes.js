const express = require('express');
const router = express.Router();
const AuditLogController = require('../Controllers/AuditLogController');

// GET /audit-logs - Get all audit logs with pagination
router.get('/', AuditLogController.getAllAuditLogs);

// POST /audit-logs - Create a new audit log
router.post('/', AuditLogController.createAuditLog);

// GET /audit-logs/admin/:adminId - Get logs by admin ID
router.get('/admin/:adminId', AuditLogController.getLogsByAdmin);

// GET /audit-logs/user/:userId - Get logs by target user ID
router.get('/user/:userId', AuditLogController.getLogsByTargetUser);

// GET /audit-logs/action/:actionType - Get logs by action type
router.get('/action/:actionType', AuditLogController.getLogsByActionType);

// DELETE /audit-logs/:id - Delete audit log (admin only)
router.delete('/:id', AuditLogController.deleteAuditLog);

module.exports = router;