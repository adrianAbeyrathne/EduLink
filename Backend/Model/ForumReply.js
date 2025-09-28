const mongoose = require('mongoose');

const ForumReplySchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Reply content is required'],
    trim: true,
    minlength: [5, 'Content must be at least 5 characters long'],
    maxlength: [3000, 'Content cannot exceed 3000 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reply author is required']
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumPost',
    required: [true, 'Post reference is required']
  },
  parent_reply: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumReply',
    default: null // null means it's a direct reply to the post, not a nested reply
  },
  is_anonymous: {
    type: Boolean,
    default: false
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
  is_best_answer: {
    type: Boolean,
    default: false
  },
  marked_as_best_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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
  is_edited: {
    type: Boolean,
    default: false
  },
  edit_history: [{
    edited_at: {
      type: Date,
      default: Date.now
    },
    previous_content: {
      type: String,
      trim: true
    },
    edit_reason: {
      type: String,
      trim: true,
      maxlength: [200, 'Edit reason cannot exceed 200 characters']
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
  is_deleted: {
    type: Boolean,
    default: false
  },
  deleted_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deleted_at: {
    type: Date
  },
  deletion_reason: {
    type: String,
    trim: true,
    maxlength: [200, 'Deletion reason cannot exceed 200 characters']
  },
  moderated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderation_notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Moderation notes cannot exceed 500 characters']
  },
  nested_reply_count: {
    type: Number,
    default: 0,
    min: [0, 'Nested reply count cannot be negative']
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes for better query performance
ForumReplySchema.index({ post: 1, createdAt: 1 });
ForumReplySchema.index({ author: 1 });
ForumReplySchema.index({ parent_reply: 1 });
ForumReplySchema.index({ is_best_answer: -1 });
ForumReplySchema.index({ is_deleted: 1 });

// Virtual for net votes (upvotes - downvotes)
ForumReplySchema.virtual('net_votes').get(function() {
  return this.upvote_count - this.downvote_count;
});

// Virtual to check if this is a nested reply
ForumReplySchema.virtual('is_nested').get(function() {
  return this.parent_reply !== null;
});

// Pre-save middleware to update post's reply count and last activity
ForumReplySchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const ForumPost = mongoose.model('ForumPost');
      await ForumPost.findByIdAndUpdate(this.post, {
        $inc: { reply_count: 1 },
        $set: { 
          last_activity: new Date(),
          last_reply_by: this.author
        }
      });

      // If this is a nested reply, update parent reply's nested count
      if (this.parent_reply) {
        await mongoose.model('ForumReply').findByIdAndUpdate(this.parent_reply, {
          $inc: { nested_reply_count: 1 }
        });
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Pre-remove middleware to update post's reply count
ForumReplySchema.pre('remove', async function(next) {
  try {
    const ForumPost = mongoose.model('ForumPost');
    await ForumPost.findByIdAndUpdate(this.post, {
      $inc: { reply_count: -1 }
    });

    // If this is a nested reply, update parent reply's nested count
    if (this.parent_reply) {
      await mongoose.model('ForumReply').findByIdAndUpdate(this.parent_reply, {
        $inc: { nested_reply_count: -1 }
      });
    }
  } catch (error) {
    return next(error);
  }
  next();
});

// Instance method to mark as best answer
ForumReplySchema.methods.markAsBestAnswer = function(markedBy) {
  this.is_best_answer = true;
  this.marked_as_best_by = markedBy;
  return this.save();
};

// Instance method to add edit history
ForumReplySchema.methods.addEditHistory = function(previousContent, editReason = '') {
  this.is_edited = true;
  this.edit_history.push({
    previous_content: previousContent,
    edit_reason: editReason
  });
  return this.save();
};

// Instance method to soft delete
ForumReplySchema.methods.softDelete = function(deletedBy, reason = '') {
  this.is_deleted = true;
  this.deleted_by = deletedBy;
  this.deleted_at = new Date();
  this.deletion_reason = reason;
  return this.save();
};

// Static method to find replies for a post with nested structure
ForumReplySchema.statics.findRepliesForPost = function(postId, includeDeleted = false) {
  const filter = { post: postId };
  if (!includeDeleted) {
    filter.is_deleted = false;
  }

  return this.find(filter)
    .populate('author', 'name email')
    .populate('marked_as_best_by', 'name')
    .populate({
      path: 'parent_reply',
      populate: {
        path: 'author',
        select: 'name'
      }
    })
    .sort({ is_best_answer: -1, createdAt: 1 });
};

// Static method to find nested replies for a parent reply
ForumReplySchema.statics.findNestedReplies = function(parentReplyId) {
  return this.find({ 
    parent_reply: parentReplyId,
    is_deleted: false
  })
  .populate('author', 'name email')
  .sort({ createdAt: 1 });
};

module.exports = mongoose.model('ForumReply', ForumReplySchema);