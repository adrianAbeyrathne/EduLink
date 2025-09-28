const express = require('express');
const router = express.Router();
const TutorVerificationController = require('../Controllers/TutorVerificationController');

// GET /verifications - Get all tutor verifications with pagination
router.get('/', TutorVerificationController.getAllVerifications);

// POST /verifications - Submit tutor verification
router.post('/', TutorVerificationController.submitVerification);

// GET /verifications/:id - Get verification by ID
router.get('/:id', TutorVerificationController.getVerificationById);

// GET /verifications/user/:userId - Get verification by user ID
router.get('/user/:userId', TutorVerificationController.getVerificationByUserId);

// PUT /verifications/:id/status - Update verification status (admin only)
router.put('/:id/status', TutorVerificationController.updateVerificationStatus);

// PUT /verifications/:id - Update verification details
router.put('/:id', TutorVerificationController.updateVerification);

// DELETE /verifications/:id - Delete verification
router.delete('/:id', TutorVerificationController.deleteVerification);

module.exports = router;