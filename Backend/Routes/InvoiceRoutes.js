const express = require('express');
const router = express.Router();
const {
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
} = require('../Controllers/InvoiceController');

// Public routes (limited access)
router.get('/stats/revenue', getRevenueStats);

// Protected routes (authentication required)
// In a real app, you would add authentication middleware here
router.get('/', getAllInvoices);
router.get('/:id', getInvoiceById);
router.post('/', createInvoice);
router.put('/:id', updateInvoice);
router.post('/:id/send', sendInvoice);
router.post('/:id/cancel', cancelInvoice);
router.post('/:id/payment', addPayment);

// Customer routes
router.get('/:id/pdf', downloadInvoicePDF);
router.get('/my/summary', getInvoiceSummary);
router.get('/my/invoices', getMyInvoices);

// Admin routes (admin authentication required)
router.get('/admin/overdue', getOverdueInvoices);
router.get('/admin/recurring-due', getRecurringInvoicesDue);
router.post('/:id/refund', processRefund);

// User-specific routes
router.get('/customer/:customerId', getCustomerInvoices);

module.exports = router;