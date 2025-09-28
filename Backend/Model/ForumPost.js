const mongoose = require('mongoose');

const ForumPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Post title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters long'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Post content is required'],
    trim: true,
    minlength: [10, 'Content must be at least 10 characters long'],
    maxlength: [5000, 'Content cannot exceed 5000 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Post author is required']
  },
  category: {
    type: String,
    required: [true, 'Post category is required'],
    enum: {
      values: ['general_discussion', 'study_help', 'homework_help', 'exam_prep', 'course_specific', 'announcements', 'feedback', 'technical_support'],
      message: 'Invalid post category'
    }
  },
  subject: {
    type: String,
    trim: true,
    maxlength: [100, 'Subject cannot exceed 100 characters']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Each tag cannot exceed 30 characters']
  }],
  is_pinned: {
    type: Boolean,
    default: false
  },
  is_locked: {
    type: Boolean,
    default: false
  },
  is_solved: {
    type: Boolean,
    default: false
  },
  solved_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumReply'
  },
  view_count: {
    type: Number,
    default: 0,
    min: [0, 'View count cannot be negative']
  },
  reply_count: {
    type: Number,
    default: 0,
    min: [0, 'Reply count cannot be negative']
  },
  last_activity: {
    type: Date,
    default: Date.now
  },
  last_reply_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  upvote_count: {
    type: Number,
    default: 0,
    min: [0, 'Upvote count cannot be negative']
  },
  downvote_count: {
    type: Number,
    default: 0,
    min: [0, 'Downvote count cannot be negative']
  },
  is_anonymous: {
    type: Boolean,
    default: false
  },
  attachments: [{
    file_name: {
      type: String,
      trim: true
    },
    file_url: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+\..+/.test(v);
        },
        message: 'Please provide a valid file URL'
      }
    },
    file_size: {
      type: Number,
      min: [1, 'File size must be at least 1 byte']
    }
  }],
  is_reported: {
    type: Boolean,
    default: false
  },
  report_count: {
    type: Number,
    default: 0,
    min: [0, 'Report count cannot be negative']
  },
  moderated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderation_notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Moderation notes cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes for better query performance
ForumPostSchema.index({ category: 1, createdAt: -1 });
ForumPostSchema.index({ author: 1 });
ForumPostSchema.index({ subject: 1 });
ForumPostSchema.index({ tags: 1 });
ForumPostSchema.index({ is_pinned: -1, last_activity: -1 });
ForumPostSchema.index({ is_solved: 1 });

// Virtual for net votes (upvotes - downvotes)
ForumPostSchema.virtual('net_votes').get(function() {
  return this.upvote_count - this.downvote_count;
});

// Virtual to check if post is hot (active in last 24 hours with good engagement)
ForumPostSchema.virtual('is_hot').get(function() {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return this.last_activity > twentyFourHoursAgo && (this.reply_count >= 3 || this.net_votes >= 5);
});

// Pre-save middleware to update last_activity when post is modified
ForumPostSchema.pre('save', function(next) {
  if (this.isModified() && !this.isModified('view_count')) {
    this.last_activity = new Date();
  }
  next();
});

// Instance method to increment view count
ForumPostSchema.methods.incrementViewCount = function() {
  this.view_count += 1;
  return this.save();
};

// Instance method to mark as solved
ForumPostSchema.methods.markAsSolved = function(replyId) {
  this.is_solved = true;
  this.solved_by = replyId;
  this.last_activity = new Date();
  return this.save();
};

// Static method to find trending posts
ForumPostSchema.statics.findTrendingPosts = function(limit = 10) {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return this.find({
    last_activity: { $gte: twentyFourHoursAgo }
  })
  .sort({ upvote_count: -1, reply_count: -1, view_count: -1 })
  .limit(limit)
  .populate('author', 'name email')
  .populate('last_reply_by', 'name');
};

// Static method to find posts by category with pagination
ForumPostSchema.statics.findByCategory = function(category, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  return this.find({ category })
    .sort({ is_pinned: -1, last_activity: -1 })
    .skip(skip)
    .limit(limit)
    .populate('author', 'name email')
    .populate('last_reply_by', 'name');
};

module.exports = mongoose.model('ForumPost', ForumPostSchema);