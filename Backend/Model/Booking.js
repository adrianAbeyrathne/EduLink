const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: [true, 'Session is required']
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required']
  },
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Tutor is required']
  },
  booking_reference: {
    type: String,
    required: [true, 'Booking reference is required']
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: 'Please enter a valid email address'
      }
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          return !v || /^\+?[\d\s\-\(\)]+$/.test(v);
        },
        message: 'Please enter a valid phone number'
      }
    },
    additional_info: {
      type: String,
      trim: true,
      maxlength: [300, 'Additional info cannot exceed 300 characters']
    },
    attendance_status: {
      type: String,
      enum: {
        values: ['registered', 'confirmed', 'attended', 'no_show', 'cancelled'],
        message: 'Invalid attendance status'
      },
      default: 'registered'
    }
  }],
  total_participants: {
    type: Number,
    default: 1,
    min: [1, 'Must have at least 1 participant'],
    validate: {
      validator: function(v) {
        return v <= this.participants.length;
      },
      message: 'Total participants cannot exceed actual participants count'
    }
  },
  booking_status: {
    type: String,
    required: [true, 'Booking status is required'],
    enum: {
      values: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'],
      message: 'Invalid booking status'
    },
    default: 'pending'
  },
  payment_status: {
    type: String,
    required: [true, 'Payment status is required'],
    enum: {
      values: ['pending', 'paid', 'failed', 'refunded', 'partial_refund'],
      message: 'Invalid payment status'
    },
    default: 'pending'
  },
  amount_total: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  amount_paid: {
    type: Number,
    default: 0,
    min: [0, 'Amount paid cannot be negative']
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    enum: {
      values: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'LKR'],
      message: 'Invalid currency'
    }
  },
  discount: {
    code: {
      type: String,
      trim: true,
      uppercase: true
    },
    percentage: {
      type: Number,
      min: [0, 'Discount percentage cannot be negative'],
      max: [100, 'Discount percentage cannot exceed 100']
    },
    amount: {
      type: Number,
      min: [0, 'Discount amount cannot be negative']
    }
  },
  payment_method: {
    type: String,
    enum: {
      values: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'crypto', 'free'],
      message: 'Invalid payment method'
    }
  },
  transaction_id: {
    type: String,
    trim: true
  },
  special_requirements: {
    type: String,
    trim: true,
    maxlength: [500, 'Special requirements cannot exceed 500 characters']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  booking_source: {
    type: String,
    enum: {
      values: ['website', 'mobile_app', 'admin_panel', 'api', 'referral'],
      message: 'Invalid booking source'
    },
    default: 'website'
  },
  confirmation_email_sent: {
    type: Boolean,
    default: false
  },
  reminder_email_sent: {
    type: Boolean,
    default: false
  },
  feedback_submitted: {
    type: Boolean,
    default: false
  },
  cancellation_details: {
    cancelled_at: Date,
    cancelled_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    cancellation_reason: {
      type: String,
      enum: {
        values: ['student_request', 'tutor_unavailable', 'technical_issues', 'payment_failed', 'other'],
        message: 'Invalid cancellation reason'
      }
    },
    refund_amount: {
      type: Number,
      min: [0, 'Refund amount cannot be negative']
    },
    refund_processed: {
      type: Boolean,
      default: false
    }
  },
  reschedule_history: [{
    original_date: {
      type: Date,
      required: true
    },
    new_date: {
      type: Date,
      required: true
    },
    reason: {
      type: String,
      trim: true,
      maxlength: [200, 'Reschedule reason cannot exceed 200 characters']
    },
    requested_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    requested_at: {
      type: Date,
      default: Date.now
    }
  }],
  communication_preferences: {
    email_notifications: {
      type: Boolean,
      default: true
    },
    sms_notifications: {
      type: Boolean,
      default: false
    },
    reminder_timing: {
      type: String,
      enum: {
        values: ['24_hours', '2_hours', '30_minutes', 'none'],
        message: 'Invalid reminder timing'
      },
      default: '24_hours'
    }
  },
  metadata: {
    ip_address: String,
    user_agent: String,
    referrer: String,
    utm_source: String,
    utm_medium: String,
    utm_campaign: String
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
BookingSchema.index({ booking_reference: 1 }, { unique: true });
BookingSchema.index({ student: 1, createdAt: -1 });
BookingSchema.index({ tutor: 1, createdAt: -1 });
BookingSchema.index({ session: 1 });
BookingSchema.index({ booking_status: 1 });
BookingSchema.index({ payment_status: 1 });
BookingSchema.index({ createdAt: -1 });
BookingSchema.index({ 'participants.user': 1 });

// Compound indexes for common queries
BookingSchema.index({ student: 1, booking_status: 1 });
BookingSchema.index({ tutor: 1, booking_status: 1 });
BookingSchema.index({ session: 1, booking_status: 1 });

// Virtual for outstanding balance
BookingSchema.virtual('outstanding_balance').get(function() {
  return Math.max(0, this.amount_total - this.amount_paid);
});

// Virtual for full payment status
BookingSchema.virtual('is_fully_paid').get(function() {
  return this.amount_paid >= this.amount_total;
});

// Virtual for cancellation eligibility
BookingSchema.virtual('can_cancel').get(function() {
  const now = new Date();
  const sessionDate = new Date(this.session?.scheduled_date);
  const hoursDifference = (sessionDate - now) / (1000 * 60 * 60);
  
  return this.booking_status === 'confirmed' && hoursDifference > 24;
});

// Pre-save middleware
BookingSchema.pre('save', function(next) {
  // Generate booking reference if not exists
  if (!this.booking_reference) {
    this.booking_reference = 'BK' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
  }

  // Update total participants count
  this.total_participants = this.participants.length;

  // Set payment status based on amounts
  if (this.amount_paid >= this.amount_total) {
    this.payment_status = 'paid';
  } else if (this.amount_paid > 0) {
    this.payment_status = 'partial_refund';
  }

  // Auto-confirm booking if payment is complete
  if (this.payment_status === 'paid' && this.booking_status === 'pending') {
    this.booking_status = 'confirmed';
  }

  // Set last_modified_by if document is being updated
  if (this.isModified() && !this.isNew) {
    this.last_modified_by = this.created_by; // In a real app, this would come from the request context
  }

  next();
});

// Post-save middleware to update session participant count
BookingSchema.post('save', async function(doc) {
  if (doc.booking_status === 'confirmed' && doc.isModified('booking_status')) {
    try {
      await mongoose.model('Session').findByIdAndUpdate(
        doc.session,
        { $inc: { current_participants: doc.total_participants } }
      );
    } catch (error) {
      console.error('Error updating session participant count:', error);
    }
  }
});

// Post-remove middleware to decrease session participant count
BookingSchema.post('remove', async function(doc) {
  if (doc.booking_status === 'confirmed') {
    try {
      await mongoose.model('Session').findByIdAndUpdate(
        doc.session,
        { $inc: { current_participants: -doc.total_participants } }
      );
    } catch (error) {
      console.error('Error updating session participant count on removal:', error);
    }
  }
});

// Instance method to confirm booking
BookingSchema.methods.confirm = function() {
  if (this.booking_status === 'pending') {
    this.booking_status = 'confirmed';
    this.confirmation_email_sent = false; // Will trigger email sending
    return this.save();
  }
  throw new Error('Booking cannot be confirmed in current status');
};

// Instance method to cancel booking
BookingSchema.methods.cancel = function(reason, cancelledBy) {
  if (['pending', 'confirmed'].includes(this.booking_status)) {
    this.booking_status = 'cancelled';
    this.cancellation_details = {
      cancelled_at: new Date(),
      cancelled_by: cancelledBy,
      cancellation_reason: reason
    };
    return this.save();
  }
  throw new Error('Booking cannot be cancelled in current status');
};

// Instance method to process refund
BookingSchema.methods.processRefund = function(refundAmount) {
  if (this.booking_status === 'cancelled' && !this.cancellation_details.refund_processed) {
    this.cancellation_details.refund_amount = refundAmount;
    this.cancellation_details.refund_processed = true;
    
    if (refundAmount >= this.amount_paid) {
      this.payment_status = 'refunded';
    } else if (refundAmount > 0) {
      this.payment_status = 'partial_refund';
    }
    
    return this.save();
  }
  throw new Error('Refund cannot be processed for this booking');
};

// Instance method to mark as completed
BookingSchema.methods.markCompleted = function(notes = '') {
  this.booking_status = 'completed';
  if (notes) {
    this.notes = notes;
  }
  // Mark all participants as attended by default
  this.participants.forEach(participant => {
    if (participant.attendance_status === 'confirmed') {
      participant.attendance_status = 'attended';
    }
  });
  return this.save();
};

// Instance method to reschedule booking
BookingSchema.methods.reschedule = function(newSessionId, reason, requestedBy) {
  if (!['confirmed', 'pending'].includes(this.booking_status)) {
    throw new Error('Cannot reschedule booking in current status');
  }

  this.reschedule_history.push({
    original_date: this.session.scheduled_date,
    new_date: new Date(), // This would be the new session date in a real app
    reason: reason,
    requested_by: requestedBy
  });

  this.session = newSessionId;
  return this.save();
};

// Static method to find bookings by student
BookingSchema.statics.findByStudent = function(studentId, status = null) {
  const query = { student: studentId };
  if (status) {
    query.booking_status = status;
  }

  return this.find(query)
    .populate('session', 'title scheduled_date start_time end_time')
    .populate('tutor', 'name email')
    .sort({ createdAt: -1 });
};

// Static method to find bookings by tutor
BookingSchema.statics.findByTutor = function(tutorId, status = null) {
  const query = { tutor: tutorId };
  if (status) {
    query.booking_status = status;
  }

  return this.find(query)
    .populate('session', 'title scheduled_date start_time end_time')
    .populate('student', 'name email')
    .sort({ createdAt: -1 });
};

// Static method to find pending payments
BookingSchema.statics.findPendingPayments = function() {
  return this.find({
    payment_status: 'pending',
    booking_status: { $ne: 'cancelled' }
  })
  .populate('student', 'name email')
  .populate('session', 'title scheduled_date')
  .sort({ createdAt: 1 });
};

// Static method to get revenue statistics
BookingSchema.statics.getRevenueStats = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        payment_status: 'paid'
      }
    },
    {
      $group: {
        _id: null,
        total_revenue: { $sum: '$amount_paid' },
        total_bookings: { $sum: 1 },
        average_booking_value: { $avg: '$amount_paid' }
      }
    }
  ]);
};

// Static method to find bookings requiring reminders
BookingSchema.statics.findRemindersNeeded = function() {
  const twentyFourHoursFromNow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  
  return this.find({
    booking_status: 'confirmed',
    reminder_email_sent: false,
    'communication_preferences.email_notifications': true
  })
  .populate({
    path: 'session',
    match: { scheduled_date: { $lte: twentyFourHoursFromNow } }
  })
  .populate('student', 'name email');
};

module.exports = mongoose.model('Booking', BookingSchema);