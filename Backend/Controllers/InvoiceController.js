const Invoice = require('../Model/Invoice');
const Booking = require('../Model/Booking');
const Payment = require('../Model/Payment');
const mongoose = require('mongoose');

// Get all invoices with pagination and filtering
const getAllInvoices = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (req.query.customer) filter['customer.user'] = req.query.customer;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.payment_status) filter.payment_status = req.query.payment_status;
    if (req.query.invoice_type) filter.invoice_type = req.query.invoice_type;
    if (req.query.currency) filter.currency = req.query.currency;

    // Date range filters
    if (req.query.issue_start_date || req.query.issue_end_date) {
      filter.issue_date = {};
      if (req.query.issue_start_date) filter.issue_date.$gte = new Date(req.query.issue_start_date);
      if (req.query.issue_end_date) filter.issue_date.$lte = new Date(req.query.issue_end_date);
    }

    if (req.query.due_start_date || req.query.due_end_date) {
      filter.due_date = {};
      if (req.query.due_start_date) filter.due_date.$gte = new Date(req.query.due_start_date);
      if (req.query.due_end_date) filter.due_date.$lte = new Date(req.query.due_end_date);
    }

    // Amount range filter
    if (req.query.min_amount || req.query.max_amount) {
      filter.total_amount = {};
      if (req.query.min_amount) filter.total_amount.$gte = parseFloat(req.query.min_amount);
      if (req.query.max_amount) filter.total_amount.$lte = parseFloat(req.query.max_amount);
    }

    // Search by invoice number
    if (req.query.search) {
      filter.invoice_number = { $regex: req.query.search, $options: 'i' };
    }

    // Overdue filter
    if (req.query.overdue === 'true') {
      filter.due_date = { $lt: new Date() };
      filter.payment_status = { $in: ['unpaid', 'partially_paid'] };
    }

    const invoices = await Invoice.find(filter)
      .populate('customer.user', 'name email')
      .populate('booking', 'booking_reference')
      .populate('payment', 'transaction_id payment_status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Invoice.countDocuments(filter);

    res.json({
      success: true,
      data: invoices,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoices',
      error: error.message
    });
  }
};

// Get invoice by ID
const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customer.user', 'name email phone')
      .populate('booking', 'booking_reference session participants')
      .populate('payment', 'transaction_id payment_status provider_transaction_id');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Mark as viewed if customer is viewing
    if (invoice.customer.user._id.toString() === req.user?.id && invoice.status === 'sent') {
      await invoice.markAsViewed();
    }

    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoice',
      error: error.message
    });
  }
};

// Create new invoice
const createInvoice = async (req, res) => {
  try {
    const { booking_id, ...invoiceData } = req.body;

    // Verify booking exists
    const booking = await Booking.findById(booking_id)
      .populate('student', 'name email phone')
      .populate('session', 'title scheduled_date price_per_participant currency');
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Create line items from booking
    const lineItems = [{
      description: `${booking.session.title} - Tutoring Session`,
      session_title: booking.session.title,
      session_date: booking.session.scheduled_date,
      quantity: booking.total_participants,
      unit_price: booking.session.price_per_participant,
      subtotal: booking.amount_total,
      tax_amount: 0, // Calculate based on your tax rules
      total: booking.amount_total
    }];

    // Set customer details from booking
    const customerData = {
      user: booking.student._id,
      name: booking.student.name,
      email: booking.student.email,
      phone: booking.student.phone || ''
    };

    const invoice = new Invoice({
      ...invoiceData,
      booking: booking_id,
      customer: customerData,
      line_items: lineItems,
      subtotal_amount: booking.amount_total,
      total_amount: booking.amount_total,
      currency: booking.currency || booking.session.currency,
      created_by: req.user?.id || invoiceData.created_by
    });

    await invoice.save();

    await invoice.populate([
      { path: 'customer.user', select: 'name email' },
      { path: 'booking', select: 'booking_reference' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: invoice
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create invoice',
      error: error.message
    });
  }
};

// Update invoice
const updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Check if invoice can be updated
    if (['paid', 'refunded'].includes(invoice.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update a paid or refunded invoice'
      });
    }

    // Add audit trail entry
    invoice.audit_trail.push({
      action: 'modified',
      details: 'Invoice updated',
      user: req.user?.id
    });

    Object.assign(invoice, req.body);
    invoice.last_modified_by = req.user?.id;
    
    await invoice.save();

    await invoice.populate([
      { path: 'customer.user', select: 'name email' },
      { path: 'booking', select: 'booking_reference' }
    ]);

    res.json({
      success: true,
      message: 'Invoice updated successfully',
      data: invoice
    });
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update invoice',
      error: error.message
    });
  }
};

// Send invoice to customer
const sendInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    if (invoice.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft invoices can be sent'
      });
    }

    await invoice.markAsSent();

    res.json({
      success: true,
      message: 'Invoice sent successfully',
      data: invoice
    });
  } catch (error) {
    console.error('Error sending invoice:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to send invoice',
      error: error.message
    });
  }
};

// Cancel invoice
const cancelInvoice = async (req, res) => {
  try {
    const { reason } = req.body;
    
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    await invoice.cancel(reason, req.user?.id);

    res.json({
      success: true,
      message: 'Invoice cancelled successfully',
      data: invoice
    });
  } catch (error) {
    console.error('Error cancelling invoice:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to cancel invoice',
      error: error.message
    });
  }
};

// Add payment to invoice
const addPayment = async (req, res) => {
  try {
    const { amount, payment_method, transaction_id, notes } = req.body;
    
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    await invoice.addPayment(amount, payment_method, transaction_id, notes);

    res.json({
      success: true,
      message: 'Payment added successfully',
      data: invoice
    });
  } catch (error) {
    console.error('Error adding payment:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to add payment',
      error: error.message
    });
  }
};

// Process refund for invoice
const processRefund = async (req, res) => {
  try {
    const { refund_amount, reason } = req.body;
    
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Only admin can process refunds
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can process refunds'
      });
    }

    await invoice.processRefund(refund_amount, reason, req.user?.id);

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: invoice
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to process refund',
      error: error.message
    });
  }
};

// Get overdue invoices
const getOverdueInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.findOverdue();

    res.json({
      success: true,
      data: invoices
    });
  } catch (error) {
    console.error('Error fetching overdue invoices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch overdue invoices',
      error: error.message
    });
  }
};

// Get invoices by customer
const getCustomerInvoices = async (req, res) => {
  try {
    const customerId = req.params.customerId || req.user?.id;
    const status = req.query.status;
    
    const invoices = await Invoice.findByCustomer(customerId, status);

    res.json({
      success: true,
      data: invoices
    });
  } catch (error) {
    console.error('Error fetching customer invoices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer invoices',
      error: error.message
    });
  }
};

// Get my invoices (for authenticated user)
const getMyInvoices = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const invoices = await Invoice.findByCustomer(userId);

    res.json({
      success: true,
      data: invoices
    });
  } catch (error) {
    console.error('Error fetching user invoices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user invoices',
      error: error.message
    });
  }
};

// Get recurring invoices due
const getRecurringInvoicesDue = async (req, res) => {
  try {
    const invoices = await Invoice.findRecurringDue();

    res.json({
      success: true,
      data: invoices
    });
  } catch (error) {
    console.error('Error fetching recurring invoices due:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recurring invoices due',
      error: error.message
    });
  }
};

// Get revenue statistics
const getRevenueStats = async (req, res) => {
  try {
    const startDate = req.query.start_date ? new Date(req.query.start_date) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = req.query.end_date ? new Date(req.query.end_date) : new Date();
    
    const stats = await Invoice.getRevenueStats(startDate, endDate);

    res.json({
      success: true,
      data: stats[0] || {
        total_invoices: 0,
        total_amount: 0,
        paid_amount: 0,
        outstanding_amount: 0,
        average_invoice_value: 0
      }
    });
  } catch (error) {
    console.error('Error fetching revenue statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue statistics',
      error: error.message
    });
  }
};

// Download invoice PDF
const downloadInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customer.user', 'name email phone')
      .populate('booking', 'booking_reference');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Check if user has permission to download
    if (invoice.customer.user._id.toString() !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to download this invoice'
      });
    }

    // Update download tracking
    invoice.delivery_details.download_count += 1;
    invoice.delivery_details.last_downloaded_at = new Date();
    await invoice.save();

    // In a real application, you would generate and return the PDF here
    // For now, we'll just return the invoice data with a message
    res.json({
      success: true,
      message: 'Invoice PDF download would be initiated here',
      data: invoice,
      pdf_url: `/api/invoices/${invoice._id}/pdf` // Mock PDF URL
    });
  } catch (error) {
    console.error('Error downloading invoice PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download invoice PDF',
      error: error.message
    });
  }
};

// Get invoice summary/dashboard data
const getInvoiceSummary = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    // Get counts for different statuses
    const [
      totalInvoices,
      paidInvoices,
      unpaidInvoices,
      overdueInvoices,
      totalAmount,
      paidAmount
    ] = await Promise.all([
      Invoice.countDocuments({ 'customer.user': userId }),
      Invoice.countDocuments({ 'customer.user': userId, status: 'paid' }),
      Invoice.countDocuments({ 'customer.user': userId, payment_status: 'unpaid' }),
      Invoice.countDocuments({ 
        'customer.user': userId, 
        due_date: { $lt: new Date() },
        payment_status: { $in: ['unpaid', 'partially_paid'] }
      }),
      Invoice.aggregate([
        { $match: { 'customer.user': new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, total: { $sum: '$total_amount' } } }
      ]),
      Invoice.aggregate([
        { $match: { 'customer.user': new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, total: { $sum: '$amount_paid' } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        total_invoices: totalInvoices,
        paid_invoices: paidInvoices,
        unpaid_invoices: unpaidInvoices,
        overdue_invoices: overdueInvoices,
        total_amount: totalAmount[0]?.total || 0,
        paid_amount: paidAmount[0]?.total || 0,
        outstanding_amount: (totalAmount[0]?.total || 0) - (paidAmount[0]?.total || 0)
      }
    });
  } catch (error) {
    console.error('Error fetching invoice summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoice summary',
      error: error.message
    });
  }
};

module.exports = {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  sendInvoice,
  cancelInvoice,
  addPayment,
  processRefund,
  getOverdueInvoices,
  getCustomerInvoices,
  getMyInvoices,
  getRecurringInvoicesDue,
  getRevenueStats,
  downloadInvoicePDF,
  getInvoiceSummary
};