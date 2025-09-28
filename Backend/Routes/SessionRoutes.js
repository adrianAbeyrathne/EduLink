const express = require('express');
const router = express.Router();
const {
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
} = require('../Controllers/SessionController');

// Public routes (no authentication required)
router.get('/', getAllSessions);
router.get('/available', getAvailableSessions);
router.get('/upcoming', getUpcomingSessions);
router.get('/:id', getSessionById);

// Protected routes (authentication required)
// In a real app, you would add authentication middleware here
router.post('/', createSession);
router.put('/:id', updateSession);
router.delete('/:id', deleteSession);
router.post('/:id/cancel', cancelSession);
router.post('/:id/complete', completeSession);
router.post('/:id/participants', addParticipant);
router.delete('/:id/participants', removeParticipant);

// User-specific routes
router.get('/tutor/:tutorId', getSessionsByTutor);
router.get('/my/sessions', getMySessions);

module.exports = router;