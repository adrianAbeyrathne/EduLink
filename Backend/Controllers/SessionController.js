const Session = require('../Model/Session');
const Booking = require('../Model/Booking');
const mongoose = require('mongoose');

// Get all sessions with pagination and filtering
const getAllSessions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (req.query.tutor) filter.tutor = req.query.tutor;
    if (req.query.subject) filter.subject = req.query.subject;
    if (req.query.session_type) filter.session_type = req.query.session_type;
    if (req.query.format) filter.format = req.query.format;
    if (req.query.level) filter.level = req.query.level;
    if (req.query.status) filter.status = req.query.status;

    // Date range filter
    if (req.query.start_date || req.query.end_date) {
      filter.scheduled_date = {};
      if (req.query.start_date) filter.scheduled_date.$gte = new Date(req.query.start_date);
      if (req.query.end_date) filter.scheduled_date.$lte = new Date(req.query.end_date);
    }

    // Price range filter
    if (req.query.min_price || req.query.max_price) {
      filter.price_per_participant = {};
      if (req.query.min_price) filter.price_per_participant.$gte = parseFloat(req.query.min_price);
      if (req.query.max_price) filter.price_per_participant.$lte = parseFloat(req.query.max_price);
    }

    // Search functionality
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { subject: { $regex: req.query.search, $options: 'i' } },
        { tags: { $in: [new RegExp(req.query.search, 'i')] } }
      ];
    }

    // Availability filter (only sessions with spots available)
    if (req.query.available === 'true') {
      filter.$expr = { $lt: ['$current_participants', '$max_participants'] };
    }

    const sessions = await Session.find(filter)
      .populate('tutor', 'name email')
      .populate('created_by', 'name')
      .sort({ scheduled_date: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Session.countDocuments(filter);

    res.json({
      success: true,
      data: sessions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sessions',
      error: error.message
    });
  }
};

// Get session by ID
const getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('tutor', 'name email')
      .populate('created_by', 'name');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch session',
      error: error.message
    });
  }
};

// Create new session
const createSession = async (req, res) => {
  try {
    const sessionData = {
      ...req.body,
      tutor: req.body.tutor || req.user?.id,
      created_by: req.user?.id || req.body.created_by
    };

    const session = new Session(sessionData);
    await session.save();

    await session.populate('tutor', 'name email');

    res.status(201).json({
      success: true,
      message: 'Session created successfully',
      data: session
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create session',
      error: error.message
    });
  }
};

// Update session
const updateSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if user has permission to update
    if (session.tutor.toString() !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this session'
      });
    }

    // Check if session is in progress or completed
    if (['in_progress', 'completed'].includes(session.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update a session that is in progress or completed'
      });
    }

    Object.assign(session, req.body);
    session.last_modified_by = req.user?.id;
    
    await session.save();
    await session.populate('tutor', 'name email');

    res.json({
      success: true,
      message: 'Session updated successfully',
      data: session
    });
  } catch (error) {
    console.error('Error updating session:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update session',
      error: error.message
    });
  }
};

// Delete session
const deleteSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if user has permission to delete
    if (session.tutor.toString() !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this session'
      });
    }

    // Check if there are bookings for this session
    const bookingCount = await Booking.countDocuments({ 
      session: req.params.id, 
      booking_status: { $in: ['confirmed', 'pending'] } 
    });

    if (bookingCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete session with active bookings. Cancel the session instead.'
      });
    }

    await Session.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Session deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete session',
      error: error.message
    });
  }
};

// Cancel session
const cancelSession = async (req, res) => {
  try {
    const { cancellation_reason } = req.body;
    
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if user has permission to cancel
    if (session.tutor.toString() !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to cancel this session'
      });
    }

    if (session.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Session is already cancelled'
      });
    }

    session.status = 'cancelled';
    session.session_notes = cancellation_reason || 'Session cancelled';
    session.last_modified_by = req.user?.id;
    
    await session.save();

    // TODO: Handle booking cancellations and refunds here
    // This would typically involve updating all related bookings

    res.json({
      success: true,
      message: 'Session cancelled successfully',
      data: session
    });
  } catch (error) {
    console.error('Error cancelling session:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to cancel session',
      error: error.message
    });
  }
};

// Mark session as completed
const completeSession = async (req, res) => {
  try {
    const { session_notes } = req.body;
    
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Check if user has permission to complete
    if (session.tutor.toString() !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to complete this session'
      });
    }

    await session.markCompleted(session_notes);

    res.json({
      success: true,
      message: 'Session marked as completed successfully',
      data: session
    });
  } catch (error) {
    console.error('Error completing session:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to complete session',
      error: error.message
    });
  }
};

// Get available sessions
const getAvailableSessions = async (req, res) => {
  try {
    const filters = {};
    
    // Apply optional filters
    if (req.query.subject) filters.subject = req.query.subject;
    if (req.query.session_type) filters.session_type = req.query.session_type;
    if (req.query.level) filters.level = req.query.level;
    if (req.query.format) filters.format = req.query.format;

    const sessions = await Session.findAvailableSessions(filters);

    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error('Error fetching available sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available sessions',
      error: error.message
    });
  }
};

// Get sessions by tutor
const getSessionsByTutor = async (req, res) => {
  try {
    const tutorId = req.params.tutorId;
    const includeCompleted = req.query.include_completed === 'true';
    
    const sessions = await Session.findByTutor(tutorId, includeCompleted);

    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error('Error fetching sessions by tutor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sessions by tutor',
      error: error.message
    });
  }
};

// Get upcoming sessions
const getUpcomingSessions = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const sessions = await Session.findUpcoming(limit);

    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error('Error fetching upcoming sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming sessions',
      error: error.message
    });
  }
};

// Get my sessions (for authenticated user)
const getMySessions = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const sessions = await Session.find({ tutor: userId })
      .populate('created_by', 'name')
      .sort({ scheduled_date: -1 });

    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user sessions',
      error: error.message
    });
  }
};

// Add participant to session
const addParticipant = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    if (session.isFull()) {
      return res.status(400).json({
        success: false,
        message: 'Session is already full'
      });
    }

    await session.addParticipant();

    res.json({
      success: true,
      message: 'Participant added successfully',
      data: session
    });
  } catch (error) {
    console.error('Error adding participant:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to add participant',
      error: error.message
    });
  }
};

// Remove participant from session
const removeParticipant = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    await session.removeParticipant();

    res.json({
      success: true,
      message: 'Participant removed successfully',
      data: session
    });
  } catch (error) {
    console.error('Error removing participant:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to remove participant',
      error: error.message
    });
  }
};

module.exports = {
  getAllSessions,
  getSessionById,
  createSession,
  updateSession,
  deleteSession,
  cancelSession,
  completeSession,
  getAvailableSessions,
  getSessionsByTutor,
  getUpcomingSessions,
  getMySessions,
  addParticipant,
  removeParticipant
};