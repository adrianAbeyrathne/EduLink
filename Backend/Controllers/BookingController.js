const Booking = require('../Model/Booking');
const Session = require('../Model/Session');
const mongoose = require('mongoose');

// Get all bookings with pagination and filtering
const getAllBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (req.query.student) filter.student = req.query.student;
    if (req.query.tutor) filter.tutor = req.query.tutor;
    if (req.query.booking_status) filter.booking_status = req.query.booking_status;
    if (req.query.payment_status) filter.payment_status = req.query.payment_status;
    if (req.query.booking_source) filter.booking_source = req.query.booking_source;

    // Date range filter
    if (req.query.start_date || req.query.end_date) {
      filter.createdAt = {};
      if (req.query.start_date) filter.createdAt.$gte = new Date(req.query.start_date);
      if (req.query.end_date) filter.createdAt.$lte = new Date(req.query.end_date);
    }

    // Search by booking reference
    if (req.query.search) {
      filter.booking_reference = { $regex: req.query.search, $options: 'i' };
    }

    const bookings = await Booking.find(filter)
      .populate('session', 'title scheduled_date start_time end_time')
      .populate('student', 'name email')
      .populate('tutor', 'name email')
      .populate('participants.user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Booking.countDocuments(filter);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
};

// Get booking by ID
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('session', 'title scheduled_date start_time end_time tutor')
      .populate('student', 'name email phone')
      .populate('tutor', 'name email')
      .populate('participants.user', 'name email phone')
      .populate('cancellation_details.cancelled_by', 'name');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking',
      error: error.message
    });
  }
};

// Create new booking
const createBooking = async (req, res) => {
  try {
    const { session_id, participants, ...bookingData } = req.body;

    // Verify session exists and is available
    const session = await Session.findById(session_id);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    if (session.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Session is not available for booking'
      });
    }

    if (session.isFull()) {
      return res.status(400).json({
        success: false,
        message: 'Session is already full'
      });
    }

    // Calculate total amount
    const participantCount = participants?.length || 1;
    const totalAmount = session.price_per_participant * participantCount;

    const booking = new Booking({
      ...bookingData,
      session: session_id,
      tutor: session.tutor,
      student: req.user?.id || bookingData.student,
      participants: participants || [{
        user: req.user?.id || bookingData.student,
        name: req.user?.name || bookingData.student_name,
        email: req.user?.email || bookingData.student_email
      }],
      amount_total: totalAmount,
      currency: session.currency,
      created_by: req.user?.id || bookingData.created_by
    });

    await booking.save();

    await booking.populate([
      { path: 'session', select: 'title scheduled_date start_time end_time' },
      { path: 'student', select: 'name email' },
      { path: 'tutor', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message
    });
  }
};

// Update booking
const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user has permission to update
    if (booking.student.toString() !== req.user?.id && 
        booking.tutor.toString() !== req.user?.id && 
        req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this booking'
      });
    }

    // Check if booking can be updated
    if (['completed', 'cancelled'].includes(booking.booking_status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update a completed or cancelled booking'
      });
    }

    Object.assign(booking, req.body);
    booking.last_modified_by = req.user?.id;
    
    await booking.save();

    await booking.populate([
      { path: 'session', select: 'title scheduled_date start_time end_time' },
      { path: 'student', select: 'name email' },
      { path: 'tutor', select: 'name email' }
    ]);

    res.json({
      success: true,
      message: 'Booking updated successfully',
      data: booking
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update booking',
      error: error.message
    });
  }
};

// Confirm booking
const confirmBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user has permission to confirm
    if (booking.tutor.toString() !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the tutor or admin can confirm bookings'
      });
    }

    await booking.confirm();

    await booking.populate([
      { path: 'session', select: 'title scheduled_date start_time end_time' },
      { path: 'student', select: 'name email' },
      { path: 'tutor', select: 'name email' }
    ]);

    res.json({
      success: true,
      message: 'Booking confirmed successfully',
      data: booking
    });
  } catch (error) {
    console.error('Error confirming booking:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to confirm booking',
      error: error.message
    });
  }
};

// Cancel booking
const cancelBooking = async (req, res) => {
  try {
    const { cancellation_reason } = req.body;
    
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user has permission to cancel
    if (booking.student.toString() !== req.user?.id && 
        booking.tutor.toString() !== req.user?.id && 
        req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to cancel this booking'
      });
    }

    await booking.cancel(cancellation_reason, req.user?.id);

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to cancel booking',
      error: error.message
    });
  }
};

// Mark booking as completed
const completeBooking = async (req, res) => {
  try {
    const { notes } = req.body;
    
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user has permission to complete
    if (booking.tutor.toString() !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the tutor or admin can mark bookings as completed'
      });
    }

    await booking.markCompleted(notes);

    res.json({
      success: true,
      message: 'Booking marked as completed successfully',
      data: booking
    });
  } catch (error) {
    console.error('Error completing booking:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to complete booking',
      error: error.message
    });
  }
};

// Process refund for booking
const processRefund = async (req, res) => {
  try {
    const { refund_amount } = req.body;
    
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Only admin can process refunds
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can process refunds'
      });
    }

    await booking.processRefund(refund_amount);

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: booking
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

// Reschedule booking
const rescheduleBooking = async (req, res) => {
  try {
    const { new_session_id, reason } = req.body;
    
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Verify new session exists and is available
    const newSession = await Session.findById(new_session_id);
    if (!newSession) {
      return res.status(404).json({
        success: false,
        message: 'New session not found'
      });
    }

    await booking.reschedule(new_session_id, reason, req.user?.id);

    await booking.populate([
      { path: 'session', select: 'title scheduled_date start_time end_time' },
      { path: 'student', select: 'name email' },
      { path: 'tutor', select: 'name email' }
    ]);

    res.json({
      success: true,
      message: 'Booking rescheduled successfully',
      data: booking
    });
  } catch (error) {
    console.error('Error rescheduling booking:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to reschedule booking',
      error: error.message
    });
  }
};

// Get bookings by student
const getStudentBookings = async (req, res) => {
  try {
    const studentId = req.params.studentId || req.user?.id;
    const status = req.query.status;
    
    const bookings = await Booking.findByStudent(studentId, status);

    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching student bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student bookings',
      error: error.message
    });
  }
};

// Get bookings by tutor
const getTutorBookings = async (req, res) => {
  try {
    const tutorId = req.params.tutorId || req.user?.id;
    const status = req.query.status;
    
    const bookings = await Booking.findByTutor(tutorId, status);

    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching tutor bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tutor bookings',
      error: error.message
    });
  }
};

// Get my bookings (for authenticated user)
const getMyBookings = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    // Get both student and tutor bookings
    const studentBookings = await Booking.findByStudent(userId);
    const tutorBookings = await Booking.findByTutor(userId);

    res.json({
      success: true,
      data: {
        as_student: studentBookings,
        as_tutor: tutorBookings
      }
    });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user bookings',
      error: error.message
    });
  }
};

// Get pending payments
const getPendingPayments = async (req, res) => {
  try {
    const bookings = await Booking.findPendingPayments();

    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching pending payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending payments',
      error: error.message
    });
  }
};

// Get revenue statistics
const getRevenueStats = async (req, res) => {
  try {
    const startDate = req.query.start_date ? new Date(req.query.start_date) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = req.query.end_date ? new Date(req.query.end_date) : new Date();
    
    const stats = await Booking.getRevenueStats(startDate, endDate);

    res.json({
      success: true,
      data: stats[0] || {
        total_revenue: 0,
        total_bookings: 0,
        average_booking_value: 0
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

module.exports = {
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
};