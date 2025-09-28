const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recipient is required']
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  type: {
    type: String,
    required: [true, 'Notification type is required'],
    enum: {
      values: [
        'system', 'booking_confirmation', 'booking_cancellation', 'booking_reminder',
        'payment_success', 'payment_failed', 'payment_refund',
        'session_starting', 'session_completed', 'session_cancelled',
        'new_message', 'forum_reply', 'forum_vote',
        'resource_approved', 'resource_rejected',
        'tutor_verification', 'account_update',
        'maintenance', 'security_alert', 'promotional'
      ],
      message: 'Invalid notification type'
    }
  },
  category: {
    type: String,
    required: [true, 'Notification category is required'],
    enum: {
      values: ['info', 'success', 'warning', 'error', 'promotional'],
      message: 'Invalid notification category'
    }
  },
  priority: {
    type: String,
    required: [true, 'Notification priority is required'],
    enum: {
      values: ['low', 'medium', 'high', 'urgent'],
      message: 'Invalid notification priority'
    },
    default: 'medium'
  },
  channel: {
    type: String,
    required: [true, 'Notification channel is required'],
    enum: {
      values: ['in_app', 'email', 'sms', 'push', 'webhook'],
      message: 'Invalid notification channel'
    }
  },
  status: {
    type: String,
    required: [true, 'Notification status is required'],
    enum: {
      values: ['pending', 'sent', 'delivered', 'read', 'failed', 'expired'],
      message: 'Invalid notification status'
    },
    default: 'pending'
  },
  delivery_status: {
    email: {
      status: {
        type: String,
        enum: ['pending', 'sent', 'delivered', 'bounced', 'failed']
      },
      sent_at: Date,
      delivered_at: Date,
      opened_at: Date,
      clicked_at: Date,
      bounce_reason: String,
      email_id: String
    },
    sms: {
      status: {
        type: String,
        enum: ['pending', 'sent', 'delivered', 'failed']
      },
      sent_at: Date,
      delivered_at: Date,
      failure_reason: String,
      sms_id: String
    },
    push: {
      status: {
        type: String,
        enum: ['pending', 'sent', 'delivered', 'failed']
      },
      sent_at: Date,
      delivered_at: Date,
      failure_reason: String,
      device_tokens: [String]
    }
  },
  related_entity: {
    entity_type: {
      type: String,
      enum: ['booking', 'session', 'payment', 'user', 'forum_post', 'resource', 'none'],
      default: 'none'
    },
    entity_id: {
      type: mongoose.Schema.Types.ObjectId,
      validate: {
        validator: function(v) {
          return this.related_entity.entity_type === 'none' || v != null;
        },
        message: 'Entity ID is required when entity type is specified'
      }
    }
  },
  action_required: {
    type: Boolean,
    default: false
  },
  action_url: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Please provide a valid action URL'
    }
  },
  action_text: {
    type: String,
    trim: true,
    maxlength: [50, 'Action text cannot exceed 50 characters']
  },
  template: {
    template_id: String,
    template_data: mongoose.Schema.Types.Mixed,
    template_version: String
  },
  personalization: {
    user_name: String,
    user_email: String,
    dynamic_content: mongoose.Schema.Types.Mixed
  },
  scheduled_for: {
    type: Date,
    validate: {
      validator: function(v) {
        return !v || v >= new Date();
      },
      message: 'Scheduled time must be in the future'
    }
  },
  expires_at: {
    type: Date,
    validate: {
      validator: function(v) {
        return !v || v > this.scheduled_for || v > new Date();
      },
      message: 'Expiry time must be after scheduled time'
    }
  },
  read_at: Date,
  clicked_at: Date,
  dismissed_at: Date,
  retry_count: {
    type: Number,
    default: 0,
    min: [0, 'Retry count cannot be negative']
  },
  max_retries: {
    type: Number,
    default: 3,
    min: [0, 'Max retries cannot be negative']
  },
  next_retry_at: Date,
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Each tag cannot exceed 30 characters']
  }],
  metadata: {
    campaign_id: String,
    batch_id: String,
    source: String,
    tracking_id: String,
    user_segment: String,
    ab_test_variant: String
  },
  preferences: {
    allow_email: {
      type: Boolean,
      default: true
    },
    allow_sms: {
      type: Boolean,
      default: false
    },
    allow_push: {
      type: Boolean,
      default: true
    },
    frequency_cap: {
      type: String,
      enum: ['none', 'daily', 'weekly', 'monthly'],
      default: 'none'
    }
  },
  localization: {
    language: {
      type: String,
      default: 'en',
      minlength: [2, 'Language code must be at least 2 characters']
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    locale: String
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },
  last_modified_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes for better query performance
NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ recipient: 1, status: 1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ category: 1 });
NotificationSchema.index({ priority: 1 });
NotificationSchema.index({ status: 1, scheduled_for: 1 });
NotificationSchema.index({ expires_at: 1 });
NotificationSchema.index({ 'related_entity.entity_type': 1, 'related_entity.entity_id': 1 });
NotificationSchema.index({ tags: 1 });

// Compound indexes for common queries
NotificationSchema.index({ recipient: 1, read_at: 1, createdAt: -1 });
NotificationSchema.index({ status: 1, priority: 1, scheduled_for: 1 });
NotificationSchema.index({ channel: 1, status: 1 });

// Virtual for notification age
NotificationSchema.virtual('age_minutes').get(function() {
  return Math.floor((new Date() - this.createdAt) / (1000 * 60));
});

// Virtual for read status
NotificationSchema.virtual('is_read').get(function() {
  return !!this.read_at;
});

// Virtual for expiry status
NotificationSchema.virtual('is_expired').get(function() {
  return this.expires_at && this.expires_at < new Date();
});

// Virtual for delivery eligibility
NotificationSchema.virtual('can_deliver').get(function() {
  const now = new Date();
  return this.status === 'pending' && 
         (!this.scheduled_for || this.scheduled_for <= now) &&
         (!this.expires_at || this.expires_at > now);
});

// Pre-save middleware
NotificationSchema.pre('save', function(next) {
  // Set personalization data from recipient
  if (this.isNew && this.recipient) {
    // In a real app, you would populate recipient data
    this.personalization = this.personalization || {};
  }

  // Set expiry date if not provided (default 30 days)
  if (!this.expires_at && this.isNew) {
    this.expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }

  // Auto-expire if past expiry date
  if (this.expires_at && this.expires_at < new Date() && this.status === 'pending') {
    this.status = 'expired';
  }

  // Set next retry time for failed notifications
  if (this.isModified('status') && this.status === 'failed' && this.retry_count < this.max_retries) {
    const retryDelayMinutes = Math.pow(2, this.retry_count) * 5; // Exponential backoff
    this.next_retry_at = new Date(Date.now() + retryDelayMinutes * 60 * 1000);
  }

  // Set last_modified_by if document is being updated
  if (this.isModified() && !this.isNew) {
    this.last_modified_by = this.created_by; // In a real app, this would come from the request context
  }

  next();
});

// Instance method to mark as read
NotificationSchema.methods.markAsRead = function() {
  if (!this.read_at) {
    this.read_at = new Date();
    this.status = 'read';
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method to mark as clicked
NotificationSchema.methods.markAsClicked = function() {
  this.clicked_at = new Date();
  if (!this.read_at) {
    this.read_at = new Date();
    this.status = 'read';
  }
  return this.save();
};

// Instance method to dismiss notification
NotificationSchema.methods.dismiss = function() {
  this.dismissed_at = new Date();
  if (!this.read_at) {
    this.read_at = new Date();
  }
  return this.save();
};

// Instance method to retry delivery
NotificationSchema.methods.retry = function() {
  if (this.status !== 'failed') {
    throw new Error('Can only retry failed notifications');
  }

  if (this.retry_count >= this.max_retries) {
    throw new Error('Maximum retry attempts exceeded');
  }

  this.status = 'pending';
  this.retry_count += 1;
  this.next_retry_at = null;
  return this.save();
};

// Instance method to mark as delivered
NotificationSchema.methods.markDelivered = function(channel, deliveryData = {}) {
  this.status = 'delivered';
  
  if (this.delivery_status[channel]) {
    this.delivery_status[channel] = {
      ...this.delivery_status[channel],
      status: 'delivered',
      delivered_at: new Date(),
      ...deliveryData
    };
  }
  
  return this.save();
};

// Instance method to mark as failed
NotificationSchema.methods.markFailed = function(channel, reason) {
  this.status = 'failed';
  
  if (this.delivery_status[channel]) {
    this.delivery_status[channel] = {
      ...this.delivery_status[channel],
      status: 'failed',
      failure_reason: reason
    };
  }
  
  return this.save();
};

// Static method to find unread notifications for user
NotificationSchema.statics.findUnreadByUser = function(userId, limit = 50) {
  return this.find({
    recipient: userId,
    read_at: { $exists: false },
    status: { $in: ['sent', 'delivered'] },
    $or: [
      { expires_at: { $exists: false } },
      { expires_at: { $gt: new Date() } }
    ]
  })
  .sort({ priority: -1, createdAt: -1 })
  .limit(limit)
  .populate('sender', 'name');
};

// Static method to find pending notifications
NotificationSchema.statics.findPendingDelivery = function(channel = null, limit = 100) {
  const query = {
    status: 'pending',
    $or: [
      { scheduled_for: { $exists: false } },
      { scheduled_for: { $lte: new Date() } }
    ],
    $or: [
      { expires_at: { $exists: false } },
      { expires_at: { $gt: new Date() } }
    ]
  };

  if (channel) {
    query.channel = channel;
  }

  return this.find(query)
    .sort({ priority: -1, scheduled_for: 1 })
    .limit(limit)
    .populate('recipient', 'name email phone');
};

// Static method to find notifications for retry
NotificationSchema.statics.findForRetry = function() {
  return this.find({
    status: 'failed',
    retry_count: { $lt: this.max_retries },
    next_retry_at: { $lte: new Date() }
  })
  .sort({ next_retry_at: 1 })
  .populate('recipient', 'name email phone');
};

// Static method to cleanup expired notifications
NotificationSchema.statics.cleanupExpired = function() {
  return this.updateMany(
    {
      status: 'pending',
      expires_at: { $lte: new Date() }
    },
    { 
      status: 'expired' 
    }
  );
};

// Static method to get notification statistics
NotificationSchema.statics.getNotificationStats = function(startDate, endDate, filters = {}) {
  const matchConditions = {
    createdAt: { $gte: startDate, $lte: endDate },
    ...filters
  };

  return this.aggregate([
    { $match: matchConditions },
    {
      $group: {
        _id: null,
        total_notifications: { $sum: 1 },
        sent_notifications: {
          $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] }
        },
        delivered_notifications: {
          $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
        },
        read_notifications: {
          $sum: { $cond: [{ $ne: ['$read_at', null] }, 1, 0] }
        },
        failed_notifications: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        }
      }
    },
    {
      $project: {
        total_notifications: 1,
        sent_notifications: 1,
        delivered_notifications: 1,
        read_notifications: 1,
        failed_notifications: 1,
        delivery_rate: {
          $multiply: [
            { $divide: ['$delivered_notifications', '$total_notifications'] },
            100
          ]
        },
        read_rate: {
          $multiply: [
            { $divide: ['$read_notifications', '$delivered_notifications'] },
            100
          ]
        }
      }
    }
  ]);
};

// Static method to find notifications by entity
NotificationSchema.statics.findByEntity = function(entityType, entityId) {
  return this.find({
    'related_entity.entity_type': entityType,
    'related_entity.entity_id': entityId
  })
  .sort({ createdAt: -1 })
  .populate('recipient', 'name email')
  .populate('sender', 'name');
};

module.exports = mongoose.model('Notification', NotificationSchema);