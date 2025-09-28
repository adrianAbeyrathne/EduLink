const Notification = require('../Model/Notification');
const mongoose = require('mongoose');

// Get all notifications with pagination and filtering
const getAllNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (req.query.recipient) filter.recipient = req.query.recipient;
    if (req.query.sender) filter.sender = req.query.sender;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.channel) filter.channel = req.query.channel;
    if (req.query.status) filter.status = req.query.status;

    // Filter by read status
    if (req.query.read === 'true') {
      filter.read_at = { $exists: true };
    } else if (req.query.read === 'false') {
      filter.read_at = { $exists: false };
    }

    // Date range filter
    if (req.query.start_date || req.query.end_date) {
      filter.createdAt = {};
      if (req.query.start_date) filter.createdAt.$gte = new Date(req.query.start_date);
      if (req.query.end_date) filter.createdAt.$lte = new Date(req.query.end_date);
    }

    // Search functionality
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { message: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const notifications = await Notification.find(filter)
      .populate('recipient', 'name email')
      .populate('sender', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments(filter);

    res.json({
      success: true,
      data: notifications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

// Get notification by ID
const getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)
      .populate('recipient', 'name email')
      .populate('sender', 'name email');

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Auto-mark as read if recipient is viewing
    if (notification.recipient._id.toString() === req.user?.id && !notification.read_at) {
      await notification.markAsRead();
    }

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error fetching notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification',
      error: error.message
    });
  }
};

// Create new notification
const createNotification = async (req, res) => {
  try {
    const notificationData = {
      ...req.body,
      sender: req.user?.id || req.body.sender,
      created_by: req.user?.id || req.body.created_by
    };

    const notification = new Notification(notificationData);
    await notification.save();

    await notification.populate([
      { path: 'recipient', select: 'name email' },
      { path: 'sender', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: notification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create notification',
      error: error.message
    });
  }
};

// Update notification
const updateNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check if notification can be updated
    if (['sent', 'delivered', 'expired'].includes(notification.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update a notification that has been sent, delivered, or expired'
      });
    }

    Object.assign(notification, req.body);
    notification.last_modified_by = req.user?.id;
    
    await notification.save();

    await notification.populate([
      { path: 'recipient', select: 'name email' },
      { path: 'sender', select: 'name email' }
    ]);

    res.json({
      success: true,
      message: 'Notification updated successfully',
      data: notification
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update notification',
      error: error.message
    });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check if user has permission to delete
    if (notification.recipient.toString() !== req.user?.id && 
        notification.sender?.toString() !== req.user?.id && 
        req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this notification'
      });
    }

    await Notification.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check if user is the recipient
    if (notification.recipient.toString() !== req.user?.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only mark your own notifications as read'
      });
    }

    await notification.markAsRead();

    res.json({
      success: true,
      message: 'Notification marked as read successfully',
      data: notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

// Mark notification as clicked
const markAsClicked = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check if user is the recipient
    if (notification.recipient.toString() !== req.user?.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only click your own notifications'
      });
    }

    await notification.markAsClicked();

    res.json({
      success: true,
      message: 'Notification marked as clicked successfully',
      data: notification
    });
  } catch (error) {
    console.error('Error marking notification as clicked:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to mark notification as clicked',
      error: error.message
    });
  }
};

// Dismiss notification
const dismissNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check if user is the recipient
    if (notification.recipient.toString() !== req.user?.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only dismiss your own notifications'
      });
    }

    await notification.dismiss();

    res.json({
      success: true,
      message: 'Notification dismissed successfully',
      data: notification
    });
  } catch (error) {
    console.error('Error dismissing notification:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to dismiss notification',
      error: error.message
    });
  }
};

// Retry failed notification
const retryNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Only admin can retry notifications
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can retry notifications'
      });
    }

    await notification.retry();

    res.json({
      success: true,
      message: 'Notification retry initiated successfully',
      data: notification
    });
  } catch (error) {
    console.error('Error retrying notification:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to retry notification',
      error: error.message
    });
  }
};

// Mark notification as delivered
const markAsDelivered = async (req, res) => {
  try {
    const { channel, delivery_data } = req.body;
    
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.markDelivered(channel, delivery_data);

    res.json({
      success: true,
      message: 'Notification marked as delivered successfully',
      data: notification
    });
  } catch (error) {
    console.error('Error marking notification as delivered:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to mark notification as delivered',
      error: error.message
    });
  }
};

// Mark notification as failed
const markAsFailed = async (req, res) => {
  try {
    const { channel, reason } = req.body;
    
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.markFailed(channel, reason);

    res.json({
      success: true,
      message: 'Notification marked as failed',
      data: notification
    });
  } catch (error) {
    console.error('Error marking notification as failed:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to mark notification as failed',
      error: error.message
    });
  }
};

// Get unread notifications for user
const getUnreadNotifications = async (req, res) => {
  try {
    const userId = req.params.userId || req.user?.id;
    const limit = parseInt(req.query.limit) || 50;
    
    const notifications = await Notification.findUnreadByUser(userId, limit);

    res.json({
      success: true,
      data: notifications,
      count: notifications.length
    });
  } catch (error) {
    console.error('Error fetching unread notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread notifications',
      error: error.message
    });
  }
};

// Get my notifications (for authenticated user)
const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = { recipient: userId };
    if (req.query.read === 'false') {
      filter.read_at = { $exists: false };
    } else if (req.query.read === 'true') {
      filter.read_at = { $exists: true };
    }

    const notifications = await Notification.find(filter)
      .populate('sender', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({ 
      recipient: userId, 
      read_at: { $exists: false } 
    });

    res.json({
      success: true,
      data: notifications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total
      },
      unread_count: unreadCount
    });
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user notifications',
      error: error.message
    });
  }
};

// Get pending notifications for delivery
const getPendingNotifications = async (req, res) => {
  try {
    const channel = req.query.channel;
    const limit = parseInt(req.query.limit) || 100;
    
    const notifications = await Notification.findPendingDelivery(channel, limit);

    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Error fetching pending notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending notifications',
      error: error.message
    });
  }
};

// Get notification statistics
const getNotificationStats = async (req, res) => {
  try {
    const startDate = req.query.start_date ? new Date(req.query.start_date) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = req.query.end_date ? new Date(req.query.end_date) : new Date();
    
    // Build filters
    const filters = {};
    if (req.query.type) filters.type = req.query.type;
    if (req.query.channel) filters.channel = req.query.channel;
    
    const stats = await Notification.getNotificationStats(startDate, endDate, filters);

    res.json({
      success: true,
      data: stats[0] || {
        total_notifications: 0,
        sent_notifications: 0,
        delivered_notifications: 0,
        read_notifications: 0,
        failed_notifications: 0,
        delivery_rate: 0,
        read_rate: 0
      }
    });
  } catch (error) {
    console.error('Error fetching notification statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification statistics',
      error: error.message
    });
  }
};

// Cleanup expired notifications
const cleanupExpiredNotifications = async (req, res) => {
  try {
    const result = await Notification.cleanupExpired();

    res.json({
      success: true,
      message: 'Expired notifications cleaned up successfully',
      data: {
        modified_count: result.modifiedCount
      }
    });
  } catch (error) {
    console.error('Error cleaning up expired notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup expired notifications',
      error: error.message
    });
  }
};

module.exports = {
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
};