const express = require('express');
const router = express.Router();
const {
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
} = require('../Controllers/PaymentController');

// Public routes (webhook endpoint)
router.post('/webhook', handleWebhook);

// Protected routes (authentication required)
// In a real app, you would add authentication middleware here
router.get('/', getAllPayments);
router.get('/:id', getPaymentById);
router.post('/', createPayment);
router.put('/:id', updatePayment);
router.post('/:id/complete', completePayment);
router.post('/:id/fail', failPayment);
router.post('/:id/retry', retryPayment);

// Admin routes (admin authentication required)
router.get('/admin/pending-settlements', getPendingSettlements);
router.get('/admin/retryable', getRetryablePayments);
router.get('/admin/stats', getPaymentStats);
router.post('/:id/refund', processRefund);

// User-specific routes
router.get('/user/:userId', getUserPayments);
router.get('/my/payments', getMyPayments);

module.exports = router;