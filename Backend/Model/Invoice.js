const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  invoice_number: {
    type: String,
    required: [true, 'Invoice number is required'],
    trim: true
  },
  invoice_type: {
    type: String,
    required: [true, 'Invoice type is required'],
    enum: {
      values: ['standard', 'credit_note', 'debit_note', 'proforma', 'recurring'],
      message: 'Invalid invoice type'
    },
    default: 'standard'
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Booking reference is required']
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  customer: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer is required']
    },
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Customer email is required'],
      validate: {
        validator: function(v) {
          return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: 'Please enter a valid email address'
      }
    },
    phone: {
      type: String,
      trim: true
    },
    company: {
      type: String,
      trim: true
    },
    tax_id: {
      type: String,
      trim: true
    }
  },
  billing_address: {
    address_line_1: {
      type: String,
      required: [true, 'Address line 1 is required'],
      trim: true
    },
    address_line_2: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    postal_code: {
      type: String,
      required: [true, 'Postal code is required'],
      trim: true
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true
    }
  },
  vendor: {
    name: {
      type: String,
      required: [true, 'Vendor name is required'],
      trim: true,
      default: 'EduLink Platform'
    },
    email: {
      type: String,
      required: [true, 'Vendor email is required'],
      default: 'billing@edulink.com'
    },
    phone: String,
    website: String,
    tax_id: String,
    registration_number: String
  },
  vendor_address: {
    address_line_1: {
      type: String,
      required: [true, 'Vendor address is required']
    },
    address_line_2: String,
    city: {
      type: String,
      required: [true, 'Vendor city is required']
    },
    state: {
      type: String,
      required: [true, 'Vendor state is required']
    },
    postal_code: {
      type: String,
      required: [true, 'Vendor postal code is required']
    },
    country: {
      type: String,
      required: [true, 'Vendor country is required']
    }
  },
  line_items: [{
    description: {
      type: String,
      required: [true, 'Item description is required'],
      trim: true
    },
    session_title: String,
    session_date: Date,
    tutor_name: String,
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 1
    },
    unit_price: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0, 'Unit price cannot be negative']
    },
    discount_percentage: {
      type: Number,
      min: [0, 'Discount percentage cannot be negative'],
      max: [100, 'Discount percentage cannot exceed 100%'],
      default: 0
    },
    discount_amount: {
      type: Number,
      min: [0, 'Discount amount cannot be negative'],
      default: 0
    },
    subtotal: {
      type: Number,
      required: [true, 'Subtotal is required'],
      min: [0, 'Subtotal cannot be negative']
    },
    tax_rate: {
      type: Number,
      min: [0, 'Tax rate cannot be negative'],
      max: [100, 'Tax rate cannot exceed 100%'],
      default: 0
    },
    tax_amount: {
      type: Number,
      min: [0, 'Tax amount cannot be negative'],
      default: 0
    },
    total: {
      type: Number,
      required: [true, 'Line item total is required'],
      min: [0, 'Total cannot be negative']
    }
  }],
  subtotal_amount: {
    type: Number,
    required: [true, 'Subtotal amount is required'],
    min: [0, 'Subtotal cannot be negative']
  },
  discount_details: {
    code: {
      type: String,
      trim: true,
      uppercase: true
    },
    description: String,
    type: {
      type: String,
      enum: ['percentage', 'fixed_amount']
    },
    value: {
      type: Number,
      min: [0, 'Discount value cannot be negative']
    },
    amount: {
      type: Number,
      min: [0, 'Discount amount cannot be negative'],
      default: 0
    }
  },
  tax_details: [{
    tax_name: {
      type: String,
      required: [true, 'Tax name is required'],
      trim: true
    },
    tax_rate: {
      type: Number,
      required: [true, 'Tax rate is required'],
      min: [0, 'Tax rate cannot be negative'],
      max: [100, 'Tax rate cannot exceed 100%']
    },
    taxable_amount: {
      type: Number,
      required: [true, 'Taxable amount is required'],
      min: [0, 'Taxable amount cannot be negative']
    },
    tax_amount: {
      type: Number,
      required: [true, 'Tax amount is required'],
      min: [0, 'Tax amount cannot be negative']
    },
    jurisdiction: String
  }],
  total_tax_amount: {
    type: Number,
    required: [true, 'Total tax amount is required'],
    min: [0, 'Total tax cannot be negative'],
    default: 0
  },
  total_amount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
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
    rate: Number,
    base_currency: String,
    target_currency: String,
    rate_date: Date
  },
  issue_date: {
    type: Date,
    required: [true, 'Issue date is required'],
    default: Date.now
  },
  due_date: {
    type: Date,
    required: [true, 'Due date is required'],
    validate: {
      validator: function(v) {
        return v >= this.issue_date;
      },
      message: 'Due date must be on or after issue date'
    }
  },
  payment_terms: {
    type: String,
    enum: {
      values: ['immediate', 'net_7', 'net_15', 'net_30', 'net_60', 'net_90', 'custom'],
      message: 'Invalid payment terms'
    },
    default: 'immediate'
  },
  status: {
    type: String,
    required: [true, 'Invoice status is required'],
    enum: {
      values: ['draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled', 'refunded'],
      message: 'Invalid invoice status'
    },
    default: 'draft'
  },
  payment_status: {
    type: String,
    required: [true, 'Payment status is required'],
    enum: {
      values: ['unpaid', 'partially_paid', 'paid', 'overdue', 'refunded'],
      message: 'Invalid payment status'
    },
    default: 'unpaid'
  },
  amount_paid: {
    type: Number,
    min: [0, 'Amount paid cannot be negative'],
    default: 0
  },
  payment_history: [{
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0, 'Payment amount cannot be negative']
    },
    payment_date: {
      type: Date,
      default: Date.now
    },
    payment_method: {
      type: String,
      enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash', 'other']
    },
    transaction_id: String,
    notes: String
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  terms_conditions: {
    type: String,
    trim: true,
    default: 'Payment is due within the specified terms. Late payments may incur additional charges.'
  },
  footer_text: {
    type: String,
    trim: true,
    default: 'Thank you for using EduLink Platform!'
  },
  attachments: [{
    file_name: {
      type: String,
      required: [true, 'File name is required'],
      trim: true
    },
    file_url: {
      type: String,
      required: [true, 'File URL is required']
    },
    file_size: Number,
    file_type: String,
    description: String
  }],
  delivery_details: {
    method: {
      type: String,
      enum: ['email', 'postal_mail', 'download', 'api'],
      default: 'email'
    },
    email_sent_at: Date,
    email_opened_at: Date,
    download_count: {
      type: Number,
      default: 0
    },
    last_downloaded_at: Date
  },
  recurring_details: {
    is_recurring: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['weekly', 'monthly', 'quarterly', 'annually']
    },
    next_invoice_date: Date,
    end_date: Date,
    remaining_cycles: Number,
    parent_invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice'
    }
  },
  dispute_details: {
    is_disputed: {
      type: Boolean,
      default: false
    },
    dispute_date: Date,
    dispute_reason: String,
    dispute_amount: Number,
    resolution_status: {
      type: String,
      enum: ['pending', 'resolved', 'escalated']
    },
    resolution_date: Date,
    resolution_notes: String
  },
  audit_trail: [{
    action: {
      type: String,
      required: [true, 'Action is required'],
      enum: ['created', 'sent', 'viewed', 'paid', 'cancelled', 'refunded', 'disputed', 'modified']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    details: String,
    ip_address: String
  }],
  metadata: {
    pdf_url: String,
    pdf_generated_at: Date,
    template_used: String,
    locale: {
      type: String,
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'UTC'
    }
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
InvoiceSchema.index({ invoice_number: 1 }, { unique: true });
InvoiceSchema.index({ 'customer.user': 1, createdAt: -1 });
InvoiceSchema.index({ booking: 1 });
InvoiceSchema.index({ payment: 1 });
InvoiceSchema.index({ status: 1 });
InvoiceSchema.index({ payment_status: 1 });
InvoiceSchema.index({ due_date: 1 });
InvoiceSchema.index({ issue_date: -1 });

// Compound indexes for common queries
InvoiceSchema.index({ status: 1, due_date: 1 });
InvoiceSchema.index({ payment_status: 1, due_date: 1 });
InvoiceSchema.index({ 'customer.user': 1, status: 1 });

// Virtual for outstanding balance
InvoiceSchema.virtual('outstanding_balance').get(function() {
  return Math.max(0, this.total_amount - this.amount_paid);
});

// Virtual for full payment status
InvoiceSchema.virtual('is_fully_paid').get(function() {
  return this.amount_paid >= this.total_amount;
});

// Virtual for overdue status
InvoiceSchema.virtual('is_overdue').get(function() {
  return this.due_date < new Date() && !this.is_fully_paid;
});

// Virtual for days overdue
InvoiceSchema.virtual('days_overdue').get(function() {
  if (this.is_overdue) {
    return Math.floor((new Date() - this.due_date) / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Pre-save middleware
InvoiceSchema.pre('save', function(next) {
  // Generate invoice number if not exists
  if (!this.invoice_number && this.isNew) {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    this.invoice_number = `INV-${year}${month}-${random}`;
  }

  // Calculate totals
  if (this.isModified('line_items')) {
    this.subtotal_amount = this.line_items.reduce((sum, item) => sum + item.subtotal, 0);
    this.total_tax_amount = this.line_items.reduce((sum, item) => sum + item.tax_amount, 0);
    this.total_amount = this.subtotal_amount + this.total_tax_amount - (this.discount_details?.amount || 0);
  }

  // Set due date based on payment terms
  if (this.isModified('payment_terms') && this.isNew) {
    const terms = {
      'immediate': 0,
      'net_7': 7,
      'net_15': 15,
      'net_30': 30,
      'net_60': 60,
      'net_90': 90
    };
    
    if (terms[this.payment_terms] !== undefined) {
      this.due_date = new Date(this.issue_date.getTime() + terms[this.payment_terms] * 24 * 60 * 60 * 1000);
    }
  }

  // Update payment status based on amount paid
  if (this.isModified('amount_paid')) {
    if (this.amount_paid >= this.total_amount) {
      this.payment_status = 'paid';
      this.status = 'paid';
    } else if (this.amount_paid > 0) {
      this.payment_status = 'partially_paid';
    } else {
      this.payment_status = 'unpaid';
    }
  }

  // Check for overdue status
  if (this.due_date < new Date() && !this.is_fully_paid) {
    this.payment_status = 'overdue';
    if (this.status === 'sent' || this.status === 'viewed') {
      this.status = 'overdue';
    }
  }

  // Set last_modified_by if document is being updated
  if (this.isModified() && !this.isNew) {
    this.last_modified_by = this.created_by; // In a real app, this would come from the request context
  }

  next();
});

// Instance method to add payment
InvoiceSchema.methods.addPayment = function(amount, paymentMethod, transactionId, notes = '') {
  if (amount <= 0) {
    throw new Error('Payment amount must be positive');
  }

  if (this.amount_paid + amount > this.total_amount) {
    throw new Error('Payment amount exceeds outstanding balance');
  }

  this.payment_history.push({
    amount: amount,
    payment_method: paymentMethod,
    transaction_id: transactionId,
    notes: notes
  });

  this.amount_paid += amount;
  
  // Add audit trail entry
  this.audit_trail.push({
    action: 'paid',
    details: `Payment of ${amount} ${this.currency} received`
  });

  return this.save();
};

// Instance method to mark as sent
InvoiceSchema.methods.markAsSent = function(emailSentAt = new Date()) {
  this.status = 'sent';
  this.delivery_details.email_sent_at = emailSentAt;
  
  this.audit_trail.push({
    action: 'sent',
    details: 'Invoice sent to customer'
  });

  return this.save();
};

// Instance method to mark as viewed
InvoiceSchema.methods.markAsViewed = function(viewedAt = new Date()) {
  if (this.status === 'sent') {
    this.status = 'viewed';
  }
  this.delivery_details.email_opened_at = viewedAt;

  this.audit_trail.push({
    action: 'viewed',
    details: 'Invoice viewed by customer'
  });

  return this.save();
};

// Instance method to cancel invoice
InvoiceSchema.methods.cancel = function(reason, cancelledBy) {
  if (['paid', 'refunded'].includes(this.status)) {
    throw new Error('Cannot cancel a paid or refunded invoice');
  }

  this.status = 'cancelled';
  
  this.audit_trail.push({
    action: 'cancelled',
    details: reason,
    user: cancelledBy
  });

  return this.save();
};

// Instance method to process refund
InvoiceSchema.methods.processRefund = function(refundAmount, reason, refundedBy) {
  if (this.status !== 'paid') {
    throw new Error('Can only refund paid invoices');
  }

  if (refundAmount > this.amount_paid) {
    throw new Error('Refund amount cannot exceed paid amount');
  }

  this.amount_paid -= refundAmount;
  this.status = refundAmount === this.total_amount ? 'refunded' : 'partially_paid';
  this.payment_status = refundAmount === this.total_amount ? 'refunded' : 'partially_paid';

  this.payment_history.push({
    amount: -refundAmount,
    payment_date: new Date(),
    payment_method: 'refund',
    notes: reason
  });

  this.audit_trail.push({
    action: 'refunded',
    details: `Refund of ${refundAmount} ${this.currency} processed: ${reason}`,
    user: refundedBy
  });

  return this.save();
};

// Static method to find overdue invoices
InvoiceSchema.statics.findOverdue = function() {
  return this.find({
    due_date: { $lt: new Date() },
    payment_status: { $in: ['unpaid', 'partially_paid'] },
    status: { $ne: 'cancelled' }
  })
  .populate('customer.user', 'name email')
  .sort({ due_date: 1 });
};

// Static method to find invoices by customer
InvoiceSchema.statics.findByCustomer = function(customerId, status = null) {
  const query = { 'customer.user': customerId };
  if (status) {
    query.status = status;
  }

  return this.find(query)
    .sort({ createdAt: -1 })
    .populate('booking', 'booking_reference')
    .populate('payment', 'transaction_id');
};

// Static method to get revenue statistics
InvoiceSchema.statics.getRevenueStats = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        issue_date: { $gte: startDate, $lte: endDate },
        status: { $ne: 'cancelled' }
      }
    },
    {
      $group: {
        _id: null,
        total_invoices: { $sum: 1 },
        total_amount: { $sum: '$total_amount' },
        paid_amount: { $sum: '$amount_paid' },
        outstanding_amount: { $sum: { $subtract: ['$total_amount', '$amount_paid'] } },
        average_invoice_value: { $avg: '$total_amount' }
      }
    }
  ]);
};

// Static method to find recurring invoices due
InvoiceSchema.statics.findRecurringDue = function() {
  return this.find({
    'recurring_details.is_recurring': true,
    'recurring_details.next_invoice_date': { $lte: new Date() },
    status: { $ne: 'cancelled' }
  })
  .populate('customer.user', 'name email');
};

module.exports = mongoose.model('Invoice', InvoiceSchema);