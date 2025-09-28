const express = require('express');
const router = express.Router();
const {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  confirmBooking,
  cancelBooking,
  completeBooking,
  processRefund,
  rescheduleBooking,
  getStudentBookings,
  getTutorBookings,
  getMyBookings,
  getPendingPayments,
  getRevenueStats
} = require('../Controllers/BookingController');

// Public routes (limited access)
router.get('/stats/revenue', getRevenueStats);

// Protected routes (authentication required)
// In a real app, you would add authentication middleware here
router.get('/', getAllBookings);
router.get('/:id', getBookingById);
router.post('/', createBooking);
router.put('/:id', updateBooking);
router.post('/:id/confirm', confirmBooking);
router.post('/:id/cancel', cancelBooking);
router.post('/:id/complete', completeBooking);
router.post('/:id/reschedule', rescheduleBooking);

// Admin routes (admin authentication required)
router.get('/admin/pending-payments', getPendingPayments);
router.post('/:id/refund', processRefund);

// User-specific routes
router.get('/student/:studentId', getStudentBookings);
router.get('/tutor/:tutorId', getTutorBookings);
router.get('/my/bookings', getMyBookings);

module.exports = router;