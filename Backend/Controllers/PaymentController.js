const Payment = require('../Model/Payment');
const Booking = require('../Model/Booking');
const mongoose = require('mongoose');

// Get all payments with pagination and filtering
const getAllPayments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (req.query.payer) filter.payer = req.query.payer;
    if (req.query.recipient) filter.recipient = req.query.recipient;
    if (req.query.payment_status) filter.payment_status = req.query.payment_status;
    if (req.query.payment_method) filter.payment_method = req.query.payment_method;
    if (req.query.payment_provider) filter.payment_provider = req.query.payment_provider;
    if (req.query.currency) filter.currency = req.query.currency;

    // Date range filter
    if (req.query.start_date || req.query.end_date) {
      filter.createdAt = {};
      if (req.query.start_date) filter.createdAt.$gte = new Date(req.query.start_date);
      if (req.query.end_date) filter.createdAt.$lte = new Date(req.query.end_date);
    }

    // Amount range filter
    if (req.query.min_amount || req.query.max_amount) {
      filter.amount_gross = {};
      if (req.query.min_amount) filter.amount_gross.$gte = parseFloat(req.query.min_amount);
      if (req.query.max_amount) filter.amount_gross.$lte = parseFloat(req.query.max_amount);
    }

    // Search by transaction ID or payment reference
    if (req.query.search) {
      filter.$or = [
        { transaction_id: { $regex: req.query.search, $options: 'i' } },
        { payment_reference: { $regex: req.query.search, $options: 'i' } },
        { provider_transaction_id: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const payments = await Payment.find(filter)
      .populate('booking', 'booking_reference')
      .populate('payer', 'name email')
      .populate('recipient', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Payment.countDocuments(filter);

    res.json({
      success: true,
      data: payments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
      error: error.message
    });
  }
};

// Get payment by ID
const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('booking', 'booking_reference amount_total')
      .populate('payer', 'name email')
      .populate('recipient', 'name email')
      .populate('refund_details.refunded_by', 'name');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment',
      error: error.message
    });
  }
};

// Create new payment
const createPayment = async (req, res) => {
  try {
    const { booking_id, ...paymentData } = req.body;

    // Verify booking exists
    const booking = await Booking.findById(booking_id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Generate unique transaction ID if not provided
    if (!paymentData.transaction_id) {
      paymentData.transaction_id = 'TXN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }

    const payment = new Payment({
      ...paymentData,
      booking: booking_id,
      payer: booking.student,
      recipient: booking.tutor,
      amount_gross: paymentData.amount_gross || booking.amount_total,
      currency: paymentData.currency || booking.currency,
      created_by: req.user?.id || paymentData.created_by
    });

    await payment.save();

    await payment.populate([
      { path: 'booking', select: 'booking_reference' },
      { path: 'payer', select: 'name email' },
      { path: 'recipient', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      data: payment
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create payment',
      error: error.message
    });
  }
};

// Update payment
const updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check if payment can be updated
    if (['completed', 'refunded'].includes(payment.payment_status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update a completed or refunded payment'
      });
    }

    Object.assign(payment, req.body);
    payment.last_modified_by = req.user?.id;
    
    await payment.save();

    await payment.populate([
      { path: 'booking', select: 'booking_reference' },
      { path: 'payer', select: 'name email' },
      { path: 'recipient', select: 'name email' }
    ]);

    res.json({
      success: true,
      message: 'Payment updated successfully',
      data: payment
    });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update payment',
      error: error.message
    });
  }
};

// Mark payment as completed
const completePayment = async (req, res) => {
  try {
    const { provider_transaction_id } = req.body;
    
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    await payment.markCompleted(provider_transaction_id);

    await payment.populate([
      { path: 'booking', select: 'booking_reference' },
      { path: 'payer', select: 'name email' },
      { path: 'recipient', select: 'name email' }
    ]);

    res.json({
      success: true,
      message: 'Payment marked as completed successfully',
      data: payment
    });
  } catch (error) {
    console.error('Error completing payment:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to complete payment',
      error: error.message
    });
  }
};

// Mark payment as failed
const failPayment = async (req, res) => {
  try {
    const { error_code, error_message, failure_reason } = req.body;
    
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    await payment.markFailed(error_code, error_message, failure_reason);

    res.json({
      success: true,
      message: 'Payment marked as failed',
      data: payment
    });
  } catch (error) {
    console.error('Error marking payment as failed:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to mark payment as failed',
      error: error.message
    });
  }
};

// Retry failed payment
const retryPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    await payment.retry();

    res.json({
      success: true,
      message: 'Payment retry initiated successfully',
      data: payment
    });
  } catch (error) {
    console.error('Error retrying payment:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to retry payment',
      error: error.message
    });
  }
};

// Process refund for payment
const processRefund = async (req, res) => {
  try {
    const { refund_amount, reason } = req.body;
    
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Only admin can process refunds
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can process refunds'
      });
    }

    await payment.processRefund(refund_amount, reason, req.user?.id);

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: payment
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

// Get payments by user (as payer or recipient)
const getUserPayments = async (req, res) => {
  try {
    const userId = req.params.userId || req.user?.id;
    const role = req.query.role || 'payer'; // 'payer' or 'recipient'
    
    const payments = await Payment.findByUser(userId, role);

    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error('Error fetching user payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user payments',
      error: error.message
    });
  }
};

// Get my payments (for authenticated user)
const getMyPayments = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    // Get both payments made and received
    const paymentsMade = await Payment.findByUser(userId, 'payer');
    const paymentsReceived = await Payment.findByUser(userId, 'recipient');

    res.json({
      success: true,
      data: {
        payments_made: paymentsMade,
        payments_received: paymentsReceived
      }
    });
  } catch (error) {
    console.error('Error fetching user payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user payments',
      error: error.message
    });
  }
};

// Get pending settlements
const getPendingSettlements = async (req, res) => {
  try {
    const payments = await Payment.findPendingSettlements();

    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error('Error fetching pending settlements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending settlements',
      error: error.message
    });
  }
};

// Get retryable payments
const getRetryablePayments = async (req, res) => {
  try {
    const payments = await Payment.findRetryablePayments();

    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error('Error fetching retryable payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch retryable payments',
      error: error.message
    });
  }
};

// Get payment statistics
const getPaymentStats = async (req, res) => {
  try {
    const startDate = req.query.start_date ? new Date(req.query.start_date) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = req.query.end_date ? new Date(req.query.end_date) : new Date();
    
    // Build filters
    const filters = {};
    if (req.query.payment_provider) filters.payment_provider = req.query.payment_provider;
    if (req.query.currency) filters.currency = req.query.currency;
    
    const stats = await Payment.getPaymentStats(startDate, endDate, filters);

    res.json({
      success: true,
      data: stats[0] || {
        total_payments: 0,
        total_amount: 0,
        completed_payments: 0,
        failed_payments: 0,
        total_fees: 0,
        total_refunds: 0,
        average_payment: 0
      }
    });
  } catch (error) {
    console.error('Error fetching payment statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment statistics',
      error: error.message
    });
  }
};

// Handle webhook from payment provider
const handleWebhook = async (req, res) => {
  try {
    const { payment_id, event_type, event_data } = req.body;
    
    const payment = await Payment.findById(payment_id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Add webhook event to payment
    payment.webhook_events.push({
      event_type,
      event_data,
      received_at: new Date()
    });

    // Process webhook based on event type
    switch (event_type) {
      case 'payment.completed':
        if (payment.payment_status !== 'completed') {
          await payment.markCompleted(event_data.provider_transaction_id);
        }
        break;
        
      case 'payment.failed':
        if (payment.payment_status !== 'failed') {
          await payment.markFailed(
            event_data.error_code,
            event_data.error_message,
            event_data.failure_reason
          );
        }
        break;
        
      case 'payment.refunded':
        // Handle refund webhook
        break;
        
      default:
        console.log('Unhandled webhook event type:', event_type);
    }

    await payment.save();

    res.json({
      success: true,
      message: 'Webhook processed successfully'
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to process webhook',
      error: error.message
    });
  }
};

module.exports = {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  completePayment,
  failPayment,
  retryPayment,
  processRefund,
  getUserPayments,
  getMyPayments,
  getPendingSettlements,
  getRetryablePayments,
  getPaymentStats,
  handleWebhook
};