const express = require('express');
const router = express.Router();
const {
  getAllNotifications,
  getNotificationById,
  createNotification,
  updateNotification,
  deleteNotification,
  markAsRead,
  markAsClicked,
  dismissNotification,
  retryNotification,
  markAsDelivered,
  markAsFailed,
  getUnreadNotifications,
  getMyNotifications,
  getPendingNotifications,
  getNotificationStats,
  cleanupExpiredNotifications
} = require('../Controllers/NotificationController');

// Protected routes (authentication required)
// In a real app, you would add authentication middleware here
router.get('/', getAllNotifications);
router.get('/:id', getNotificationById);
router.post('/', createNotification);
router.put('/:id', updateNotification);
router.delete('/:id', deleteNotification);

// User interaction routes
router.post('/:id/read', markAsRead);
router.post('/:id/click', markAsClicked);
router.post('/:id/dismiss', dismissNotification);

// Admin routes (admin authentication required)
router.get('/admin/pending', getPendingNotifications);
router.get('/admin/stats', getNotificationStats);
router.post('/admin/cleanup-expired', cleanupExpiredNotifications);
router.post('/:id/retry', retryNotification);
router.post('/:id/delivered', markAsDelivered);
router.post('/:id/failed', markAsFailed);

// User-specific routes
router.get('/user/:userId/unread', getUnreadNotifications);
router.get('/my/notifications', getMyNotifications);

module.exports = router;