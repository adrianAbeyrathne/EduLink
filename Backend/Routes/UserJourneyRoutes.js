const express = require('express');
const router = express.Router();
const UserJourneyController = require('../Controllers/UserJourneyController');

// Get personalized dashboard data
router.get('/dashboard/:userId', UserJourneyController.getDashboard);

// Update onboarding progress
router.put('/onboarding/:userId', UserJourneyController.updateOnboarding);

// Award achievement or milestone
router.post('/achievement/:userId', UserJourneyController.awardAchievement);

// Track user activity
router.post('/activity/:userId', UserJourneyController.trackActivity);

// Get user progress details
router.get('/progress/:userId', UserJourneyController.getProgress);

// Reset user progress (admin only)
router.delete('/progress/:userId', UserJourneyController.resetProgress);

module.exports = router;