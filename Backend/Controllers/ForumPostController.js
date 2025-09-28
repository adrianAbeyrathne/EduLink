const ForumPost = require('../Model/ForumPost');
const ForumReply = require('../Model/ForumReply');
const ForumVote = require('../Model/ForumVote');
const mongoose = require('mongoose');

// Get all forum posts with pagination and filtering
const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { status: { $ne: 'deleted' } };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.author) filter.author = req.query.author;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.is_pinned) filter.is_pinned = req.query.is_pinned === 'true';
    if (req.query.is_locked) filter.is_locked = req.query.is_locked === 'true';

    // Search functionality
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { content: { $regex: req.query.search, $options: 'i' } },
        { tags: { $in: [new RegExp(req.query.search, 'i')] } }
      ];
    }

    // Sorting
    let sortOption = { createdAt: -1 };
    if (req.query.sort) {
      switch (req.query.sort) {
        case 'popular':
          sortOption = { vote_count: -1, view_count: -1 };
          break;
        case 'most_replies':
          sortOption = { reply_count: -1 };
          break;
        case 'oldest':
          sortOption = { createdAt: 1 };
          break;
        case 'recent_activity':
          sortOption = { last_activity_at: -1 };
          break;
        default:
          sortOption = { is_pinned: -1, createdAt: -1 };
      }
    }

    const posts = await ForumPost.find(filter)
      .populate('author', 'name email')
      .populate('last_reply_by', 'name')
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    const total = await ForumPost.countDocuments(filter);

    res.json({
      success: true,
      data: posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching forum posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch forum posts',
      error: error.message
    });
  }
};

// Get post by ID
const getPostById = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id)
      .populate('author', 'name email')
      .populate('last_reply_by', 'name')
      .populate('moderated_by', 'name');

    if (!post || post.status === 'deleted') {
      return res.status(404).json({
        success: false,
        message: 'Forum post not found'
      });
    }

    // Increment view count
    await post.incrementViewCount();

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Error fetching forum post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch forum post',
      error: error.message
    });
  }
};

// Create new forum post
const createPost = async (req, res) => {
  try {
    const postData = {
      ...req.body,
      author: req.user?.id || req.body.author,
      created_by: req.user?.id || req.body.created_by
    };

    const post = new ForumPost(postData);
    await post.save();

    await post.populate('author', 'name email');

    res.status(201).json({
      success: true,
      message: 'Forum post created successfully',
      data: post
    });
  } catch (error) {
    console.error('Error creating forum post:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create forum post',
      error: error.message
    });
  }
};

// Update forum post
const updatePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);

    if (!post || post.status === 'deleted') {
      return res.status(404).json({
        success: false,
        message: 'Forum post not found'
      });
    }

    // Check if user has permission to update
    if (post.author.toString() !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this post'
      });
    }

    // Check if post is locked
    if (post.is_locked && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'This post is locked and cannot be edited'
      });
    }

    // Add to edit history if content is being changed
    if (req.body.content && req.body.content !== post.content) {
      post.edit_history.push({
        previous_content: post.content,
        edited_by: req.user?.id,
        edit_reason: req.body.edit_reason || 'Content updated'
      });
    }

    Object.assign(post, req.body);
    post.last_modified_by = req.user?.id;
    post.last_activity_at = new Date();
    
    await post.save();
    await post.populate('author', 'name email');

    res.json({
      success: true,
      message: 'Forum post updated successfully',
      data: post
    });
  } catch (error) {
    console.error('Error updating forum post:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update forum post',
      error: error.message
    });
  }
};

// Delete forum post (soft delete)
const deletePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);

    if (!post || post.status === 'deleted') {
      return res.status(404).json({
        success: false,
        message: 'Forum post not found'
      });
    }

    // Check if user has permission to delete
    if (post.author.toString() !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this post'
      });
    }

    await post.softDelete(req.user?.id, req.body.reason);

    res.json({
      success: true,
      message: 'Forum post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting forum post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete forum post',
      error: error.message
    });
  }
};

// Vote on forum post
const voteOnPost = async (req, res) => {
  try {
    const { vote_type } = req.body; // 'upvote' or 'downvote'
    const postId = req.params.id;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    const post = await ForumPost.findById(postId);

    if (!post || post.status === 'deleted') {
      return res.status(404).json({
        success: false,
        message: 'Forum post not found'
      });
    }

    // Check if user already voted
    const existingVote = await ForumVote.findOne({
      entity_type: 'forum_post',
      entity_id: postId,
      user: userId
    });

    let vote;

    if (existingVote) {
      if (existingVote.vote_type === vote_type) {
        // Remove vote if same type
        await ForumVote.findByIdAndDelete(existingVote._id);
        vote = null;
      } else {
        // Update vote type
        existingVote.vote_type = vote_type;
        vote = await existingVote.save();
      }
    } else {
      // Create new vote
      vote = new ForumVote({
        entity_type: 'forum_post',
        entity_id: postId,
        user: userId,
        vote_type: vote_type
      });
      await vote.save();
    }

    // Get updated post with vote counts
    const updatedPost = await ForumPost.findById(postId)
      .populate('author', 'name email');

    res.json({
      success: true,
      message: vote ? `Post ${vote_type}d successfully` : 'Vote removed successfully',
      data: {
        post: updatedPost,
        user_vote: vote?.vote_type || null
      }
    });
  } catch (error) {
    console.error('Error voting on post:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to vote on post',
      error: error.message
    });
  }
};

// Pin/Unpin post (admin/moderator only)
const togglePinPost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);

    if (!post || post.status === 'deleted') {
      return res.status(404).json({
        success: false,
        message: 'Forum post not found'
      });
    }

    post.is_pinned = !post.is_pinned;
    post.last_modified_by = req.user?.id;
    
    await post.save();

    res.json({
      success: true,
      message: `Post ${post.is_pinned ? 'pinned' : 'unpinned'} successfully`,
      data: post
    });
  } catch (error) {
    console.error('Error toggling pin status:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to toggle pin status',
      error: error.message
    });
  }
};

// Lock/Unlock post (admin/moderator only)
const toggleLockPost = async (req, res) => {
  try {
    const { reason } = req.body;
    const post = await ForumPost.findById(req.params.id);

    if (!post || post.status === 'deleted') {
      return res.status(404).json({
        success: false,
        message: 'Forum post not found'
      });
    }

    if (post.is_locked) {
      // Unlock post
      await post.unlock(req.user?.id, reason);
    } else {
      // Lock post
      await post.lock(req.user?.id, reason);
    }

    res.json({
      success: true,
      message: `Post ${post.is_locked ? 'locked' : 'unlocked'} successfully`,
      data: post
    });
  } catch (error) {
    console.error('Error toggling lock status:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to toggle lock status',
      error: error.message
    });
  }
};

// Mark post as solved
const markAsSolved = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);

    if (!post || post.status === 'deleted') {
      return res.status(404).json({
        success: false,
        message: 'Forum post not found'
      });
    }

    // Check if user is the author or admin
    if (post.author.toString() !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the post author or admin can mark as solved'
      });
    }

    await post.markAsSolved();

    res.json({
      success: true,
      message: 'Post marked as solved successfully',
      data: post
    });
  } catch (error) {
    console.error('Error marking post as solved:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to mark post as solved',
      error: error.message
    });
  }
};

// Get trending posts
const getTrendingPosts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const posts = await ForumPost.findTrending(limit)
      .populate('author', 'name')
      .populate('last_reply_by', 'name');

    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('Error fetching trending posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trending posts',
      error: error.message
    });
  }
};

// Get posts by author
const getPostsByAuthor = async (req, res) => {
  try {
    const authorId = req.params.authorId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await ForumPost.find({ 
      author: authorId, 
      status: { $ne: 'deleted' } 
    })
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ForumPost.countDocuments({ 
      author: authorId, 
      status: { $ne: 'deleted' } 
    });

    res.json({
      success: true,
      data: posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total
      }
    });
  } catch (error) {
    console.error('Error fetching posts by author:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts by author',
      error: error.message
    });
  }
};

module.exports = {
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
};