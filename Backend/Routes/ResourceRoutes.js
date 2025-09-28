const express = require('express');
const router = express.Router();
const {
  getAllResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  approveResource,
  rejectResource,
  addReview,
  getPendingResources,
  getPopularResources,
  getResourcesByUploader
} = require('../Controllers/ResourceController');

// Public routes (no authentication required)
router.get('/', getAllResources);
router.get('/popular', getPopularResources);
router.get('/:id', getResourceById);

// Protected routes (authentication required)
// In a real app, you would add authentication middleware here
router.post('/', createResource);
router.put('/:id', updateResource);
router.delete('/:id', deleteResource);
router.post('/:id/review', addReview);

// Admin routes (admin authentication required)
router.get('/admin/pending', getPendingResources);
router.post('/:id/approve', approveResource);
router.post('/:id/reject', rejectResource);

// User-specific routes
router.get('/uploader/:uploaderId', getResourcesByUploader);

module.exports = router;