const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  transaction_id: {
    type: String,
    required: [true, 'Transaction ID is required'],
    trim: true
  },
  payment_reference: {
    type: String,
    required: [true, 'Payment reference is required'],
    trim: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Booking reference is required']
  },
  payer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Payer is required']
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recipient (tutor) is required']
  },
  amount_gross: {
    type: Number,
    required: [true, 'Gross amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  amount_fee: {
    type: Number,
    default: 0,
    min: [0, 'Fee cannot be negative']
  },
  amount_net: {
    type: Number,
    required: [true, 'Net amount is required'],
    min: [0, 'Net amount cannot be negative']
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    enum: {
      values: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'LKR'],
      message: 'Invalid currency'
    }
  },
  exchange_rate: {
    rate: {
      type: Number,
      min: [0, 'Exchange rate cannot be negative']
    },
    base_currency: String,
    target_currency: String,
    rate_date: Date
  },
  payment_method: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: {
      values: ['credit_card', 'debit_card', 'paypal', 'stripe', 'bank_transfer', 'crypto', 'wallet'],
      message: 'Invalid payment method'
    }
  },
  payment_provider: {
    type: String,
    required: [true, 'Payment provider is required'],
    enum: {
      values: ['stripe', 'paypal', 'square', 'razorpay', 'bank', 'crypto_wallet'],
      message: 'Invalid payment provider'
    }
  },
  provider_transaction_id: {
    type: String,
    trim: true
  },
  payment_status: {
    type: String,
    required: [true, 'Payment status is required'],
    enum: {
      values: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partial_refund'],
      message: 'Invalid payment status'
    },
    default: 'pending'
  },
  payment_intent_id: {
    type: String,
    trim: true
  },
  payment_details: {
    card_last_four: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^\d{4}$/.test(v);
        },
        message: 'Card last four must be 4 digits'
      }
    },
    card_brand: {
      type: String,
      enum: ['visa', 'mastercard', 'amex', 'discover', 'diners', 'jcb', 'unionpay']
    },
    paypal_email: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: 'Please enter a valid PayPal email'
      }
    },
    bank_name: String,
    account_last_four: String,
    crypto_wallet_address: String,
    crypto_currency: String
  },
  discount_applied: {
    code: {
      type: String,
      trim: true,
      uppercase: true
    },
    type: {
      type: String,
      enum: ['percentage', 'fixed_amount']
    },
    value: {
      type: Number,
      min: [0, 'Discount value cannot be negative']
    },
    amount_discounted: {
      type: Number,
      min: [0, 'Discount amount cannot be negative']
    }
  },
  tax_details: {
    tax_rate: {
      type: Number,
      min: [0, 'Tax rate cannot be negative'],
      max: [100, 'Tax rate cannot exceed 100%']
    },
    tax_amount: {
      type: Number,
      min: [0, 'Tax amount cannot be negative']
    },
    tax_type: {
      type: String,
      enum: ['vat', 'gst', 'sales_tax', 'service_tax']
    },
    tax_jurisdiction: String
  },
  refund_details: {
    refund_amount: {
      type: Number,
      min: [0, 'Refund amount cannot be negative']
    },
    refund_reason: {
      type: String,
      enum: ['customer_request', 'duplicate_charge', 'fraud', 'service_not_delivered', 'technical_error', 'other']
    },
    refund_status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    },
    refunded_at: Date,
    refunded_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    provider_refund_id: String
  },
  platform_fee: {
    percentage: {
      type: Number,
      min: [0, 'Platform fee percentage cannot be negative'],
      max: [100, 'Platform fee percentage cannot exceed 100%']
    },
    amount: {
      type: Number,
      min: [0, 'Platform fee amount cannot be negative']
    }
  },
  settlement_details: {
    settlement_status: {
      type: String,
      enum: ['pending', 'processing', 'settled', 'failed'],
      default: 'pending'
    },
    settlement_date: Date,
    settlement_amount: {
      type: Number,
      min: [0, 'Settlement amount cannot be negative']
    },
    settlement_currency: String,
    settlement_reference: String
  },
  payment_notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Payment notes cannot exceed 500 characters']
  },
  failure_details: {
    error_code: String,
    error_message: String,
    failure_reason: {
      type: String,
      enum: ['insufficient_funds', 'invalid_card', 'expired_card', 'network_error', 'fraud_detected', 'other']
    },
    retry_count: {
      type: Number,
      default: 0,
      min: [0, 'Retry count cannot be negative']
    },
    max_retries: {
      type: Number,
      default: 3,
      min: [0, 'Max retries cannot be negative']
    }
  },
  webhook_events: [{
    event_type: {
      type: String,
      required: true
    },
    received_at: {
      type: Date,
      default: Date.now
    },
    processed: {
      type: Boolean,
      default: false
    },
    event_data: mongoose.Schema.Types.Mixed
  }],
  metadata: {
    ip_address: String,
    user_agent: String,
    payment_page_url: String,
    session_id: String,
    device_fingerprint: String
  },
  processed_at: Date,
  completed_at: Date,
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
PaymentSchema.index({ transaction_id: 1 }, { unique: true });
PaymentSchema.index({ payment_reference: 1 }, { unique: true });
PaymentSchema.index({ booking: 1 });
PaymentSchema.index({ payer: 1, createdAt: -1 });
PaymentSchema.index({ recipient: 1, createdAt: -1 });
PaymentSchema.index({ payment_status: 1 });
PaymentSchema.index({ payment_provider: 1, provider_transaction_id: 1 });
PaymentSchema.index({ createdAt: -1 });

// Compound indexes for common queries
PaymentSchema.index({ payer: 1, payment_status: 1 });
PaymentSchema.index({ recipient: 1, payment_status: 1 });
PaymentSchema.index({ payment_status: 1, createdAt: -1 });

// Virtual for total refunded amount
PaymentSchema.virtual('total_refunded').get(function() {
  return this.refund_details?.refund_amount || 0;
});

// Virtual for net settlement amount
PaymentSchema.virtual('net_settlement').get(function() {
  const platformFee = this.platform_fee?.amount || 0;
  const refunded = this.total_refunded;
  return Math.max(0, this.amount_net - platformFee - refunded);
});

// Virtual for payment completion status
PaymentSchema.virtual('is_completed').get(function() {
  return this.payment_status === 'completed';
});

// Virtual for refund eligibility
PaymentSchema.virtual('can_refund').get(function() {
  const maxRefundDays = 30; // 30 days refund policy
  const daysSincePayment = (new Date() - this.completed_at) / (1000 * 60 * 60 * 24);
  
  return this.payment_status === 'completed' && 
         daysSincePayment <= maxRefundDays &&
         !this.refund_details?.refund_amount;
});

// Pre-save middleware
PaymentSchema.pre('save', function(next) {
  // Generate payment reference if not exists
  if (!this.payment_reference && this.isNew) {
    this.payment_reference = 'PAY' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase();
  }

  // Calculate net amount if not provided
  if (this.isModified('amount_gross') || this.isModified('amount_fee')) {
    this.amount_net = this.amount_gross - this.amount_fee;
  }

  // Set processed timestamp
  if (this.isModified('payment_status') && this.payment_status === 'processing' && !this.processed_at) {
    this.processed_at = new Date();
  }

  // Set completed timestamp
  if (this.isModified('payment_status') && this.payment_status === 'completed' && !this.completed_at) {
    this.completed_at = new Date();
  }

  // Set last_modified_by if document is being updated
  if (this.isModified() && !this.isNew) {
    this.last_modified_by = this.created_by; // In a real app, this would come from the request context
  }

  next();
});

// Post-save middleware to update booking payment status
PaymentSchema.post('save', async function(doc) {
  if (doc.isModified('payment_status')) {
    try {
      const Booking = mongoose.model('Booking');
      const booking = await Booking.findById(doc.booking);
      
      if (booking) {
        // Update booking payment status based on payment status
        let bookingPaymentStatus = 'pending';
        if (doc.payment_status === 'completed') {
          bookingPaymentStatus = 'paid';
        } else if (doc.payment_status === 'failed' || doc.payment_status === 'cancelled') {
          bookingPaymentStatus = 'failed';
        } else if (doc.payment_status === 'refunded') {
          bookingPaymentStatus = 'refunded';
        } else if (doc.payment_status === 'partial_refund') {
          bookingPaymentStatus = 'partial_refund';
        }

        await Booking.findByIdAndUpdate(doc.booking, {
          payment_status: bookingPaymentStatus,
          amount_paid: doc.payment_status === 'completed' ? doc.amount_gross : 0
        });
      }
    } catch (error) {
      console.error('Error updating booking payment status:', error);
    }
  }
});

// Instance method to process refund
PaymentSchema.methods.processRefund = function(refundAmount, reason, refundedBy) {
  if (!this.can_refund) {
    throw new Error('Payment is not eligible for refund');
  }

  if (refundAmount > this.amount_gross) {
    throw new Error('Refund amount cannot exceed payment amount');
  }

  this.refund_details = {
    refund_amount: refundAmount,
    refund_reason: reason,
    refund_status: 'pending',
    refunded_at: new Date(),
    refunded_by: refundedBy
  };

  if (refundAmount === this.amount_gross) {
    this.payment_status = 'refunded';
  } else {
    this.payment_status = 'partial_refund';
  }

  return this.save();
};

// Instance method to mark as completed
PaymentSchema.methods.markCompleted = function(providerTransactionId) {
  this.payment_status = 'completed';
  this.completed_at = new Date();
  if (providerTransactionId) {
    this.provider_transaction_id = providerTransactionId;
  }
  return this.save();
};

// Instance method to mark as failed
PaymentSchema.methods.markFailed = function(errorCode, errorMessage, failureReason) {
  this.payment_status = 'failed';
  this.failure_details = {
    error_code: errorCode,
    error_message: errorMessage,
    failure_reason: failureReason,
    retry_count: (this.failure_details?.retry_count || 0) + 1
  };
  return this.save();
};

// Instance method to retry payment
PaymentSchema.methods.retry = function() {
  if (this.payment_status !== 'failed') {
    throw new Error('Can only retry failed payments');
  }

  const retryCount = this.failure_details?.retry_count || 0;
  const maxRetries = this.failure_details?.max_retries || 3;

  if (retryCount >= maxRetries) {
    throw new Error('Maximum retry attempts exceeded');
  }

  this.payment_status = 'pending';
  this.failure_details.retry_count = retryCount + 1;
  return this.save();
};

// Static method to find payments by user
PaymentSchema.statics.findByUser = function(userId, role = 'payer') {
  const query = {};
  query[role] = userId;

  return this.find(query)
    .populate('booking', 'booking_reference')
    .populate('payer', 'name email')
    .populate('recipient', 'name email')
    .sort({ createdAt: -1 });
};

// Static method to find pending settlements
PaymentSchema.statics.findPendingSettlements = function() {
  return this.find({
    payment_status: 'completed',
    'settlement_details.settlement_status': 'pending'
  })
  .populate('recipient', 'name email')
  .sort({ completed_at: 1 });
};

// Static method to get payment statistics
PaymentSchema.statics.getPaymentStats = function(startDate, endDate, filters = {}) {
  const matchConditions = {
    createdAt: { $gte: startDate, $lte: endDate },
    ...filters
  };

  return this.aggregate([
    { $match: matchConditions },
    {
      $group: {
        _id: null,
        total_payments: { $sum: 1 },
        total_amount: { $sum: '$amount_gross' },
        completed_payments: {
          $sum: { $cond: [{ $eq: ['$payment_status', 'completed'] }, 1, 0] }
        },
        failed_payments: {
          $sum: { $cond: [{ $eq: ['$payment_status', 'failed'] }, 1, 0] }
        },
        total_fees: { $sum: '$amount_fee' },
        total_refunds: { $sum: '$refund_details.refund_amount' },
        average_payment: { $avg: '$amount_gross' }
      }
    }
  ]);
};

// Static method to find failed payments for retry
PaymentSchema.statics.findRetryablePayments = function() {
  return this.find({
    payment_status: 'failed',
    $expr: {
      $lt: [
        { $ifNull: ['$failure_details.retry_count', 0] },
        { $ifNull: ['$failure_details.max_retries', 3] }
      ]
    }
  })
  .populate('payer', 'name email')
  .sort({ createdAt: 1 });
};

module.exports = mongoose.model('Payment', PaymentSchema);