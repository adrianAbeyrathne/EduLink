const express = require('express');
const router = express.Router();
const {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  voteOnPost,
  togglePinPost,
  toggleLockPost,
  markAsSolved,
  getTrendingPosts,
  getPostsByAuthor
} = require('../Controllers/ForumPostController');

// Public routes (no authentication required)
router.get('/', getAllPosts);
router.get('/trending', getTrendingPosts);
router.get('/:id', getPostById);

// Protected routes (authentication required)
// In a real app, you would add authentication middleware here
router.post('/', createPost);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);
router.post('/:id/vote', voteOnPost);
router.post('/:id/solve', markAsSolved);

// Admin/Moderator routes (admin authentication required)
router.post('/:id/pin', togglePinPost);
router.post('/:id/lock', toggleLockPost);

// User-specific routes
router.get('/author/:authorId', getPostsByAuthor);

module.exports = router;