const mongoose = require('mongoose');

const ForumVoteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required for voting']
  },
  target_type: {
    type: String,
    required: [true, 'Target type is required'],
    enum: {
      values: ['post', 'reply'],
      message: 'Target type must be either post or reply'
    }
  },
  target_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Target ID is required'],
    refPath: 'target_model'
  },
  target_model: {
    type: String,
    required: [true, 'Target model is required'],
    enum: {
      values: ['ForumPost', 'ForumReply'],
      message: 'Target model must be either ForumPost or ForumReply'
    }
  },
  vote_type: {
    type: String,
    required: [true, 'Vote type is required'],
    enum: {
      values: ['upvote', 'downvote'],
      message: 'Vote type must be either upvote or downvote'
    }
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  versionKey: false
});

// Compound index to ensure one vote per user per target
ForumVoteSchema.index({ user: 1, target_id: 1 }, { unique: true });

// Indexes for better query performance
ForumVoteSchema.index({ target_type: 1, target_id: 1 });
ForumVoteSchema.index({ user: 1 });
ForumVoteSchema.index({ is_active: 1 });

// Pre-save middleware to set target_model based on target_type
ForumVoteSchema.pre('save', function(next) {
  if (this.target_type === 'post') {
    this.target_model = 'ForumPost';
  } else if (this.target_type === 'reply') {
    this.target_model = 'ForumReply';
  }
  next();
});

// Post-save middleware to update vote counts on target document
ForumVoteSchema.post('save', async function() {
  try {
    let TargetModel;
    if (this.target_model === 'ForumPost') {
      TargetModel = mongoose.model('ForumPost');
    } else if (this.target_model === 'ForumReply') {
      TargetModel = mongoose.model('ForumReply');
    }

    if (TargetModel) {
      // Count current votes for this target
      const upvotes = await mongoose.model('ForumVote').countDocuments({
        target_id: this.target_id,
        vote_type: 'upvote',
        is_active: true
      });

      const downvotes = await mongoose.model('ForumVote').countDocuments({
        target_id: this.target_id,
        vote_type: 'downvote',
        is_active: true
      });

      // Update the target document with current vote counts
      await TargetModel.findByIdAndUpdate(this.target_id, {
        upvote_count: upvotes,
        downvote_count: downvotes
      });
    }
  } catch (error) {
    console.error('Error updating vote counts:', error);
  }
});

// Post-remove middleware to update vote counts when vote is removed
ForumVoteSchema.post('remove', async function() {
  try {
    let TargetModel;
    if (this.target_model === 'ForumPost') {
      TargetModel = mongoose.model('ForumPost');
    } else if (this.target_model === 'ForumReply') {
      TargetModel = mongoose.model('ForumReply');
    }

    if (TargetModel) {
      // Count current votes for this target
      const upvotes = await mongoose.model('ForumVote').countDocuments({
        target_id: this.target_id,
        vote_type: 'upvote',
        is_active: true
      });

      const downvotes = await mongoose.model('ForumVote').countDocuments({
        target_id: this.target_id,
        vote_type: 'downvote',
        is_active: true
      });

      // Update the target document with current vote counts
      await TargetModel.findByIdAndUpdate(this.target_id, {
        upvote_count: upvotes,
        downvote_count: downvotes
      });
    }
  } catch (error) {
    console.error('Error updating vote counts after removal:', error);
  }
});

// Static method to toggle vote (upvote/downvote or remove vote)
ForumVoteSchema.statics.toggleVote = async function(userId, targetType, targetId, voteType) {
  try {
    // Check if user has already voted on this target
    const existingVote = await this.findOne({
      user: userId,
      target_id: targetId,
      is_active: true
    });

    if (existingVote) {
      if (existingVote.vote_type === voteType) {
        // Same vote type - remove the vote
        existingVote.is_active = false;
        await existingVote.save();
        return { action: 'removed', vote: existingVote };
      } else {
        // Different vote type - change the vote
        existingVote.vote_type = voteType;
        await existingVote.save();
        return { action: 'changed', vote: existingVote };
      }
    } else {
      // No existing vote - create new vote
      const newVote = new this({
        user: userId,
        target_type: targetType,
        target_id: targetId,
        vote_type: voteType
      });
      await newVote.save();
      return { action: 'created', vote: newVote };
    }
  } catch (error) {
    if (error.code === 11000) {
      throw new Error('You have already voted on this item');
    }
    throw error;
  }
};

// Static method to get user's vote on a specific target
ForumVoteSchema.statics.getUserVote = function(userId, targetId) {
  return this.findOne({
    user: userId,
    target_id: targetId,
    is_active: true
  });
};

// Static method to get vote statistics for a target
ForumVoteSchema.statics.getVoteStats = async function(targetId) {
  const upvotes = await this.countDocuments({
    target_id: targetId,
    vote_type: 'upvote',
    is_active: true
  });

  const downvotes = await this.countDocuments({
    target_id: targetId,
    vote_type: 'downvote',
    is_active: true
  });

  return {
    upvotes,
    downvotes,
    net_votes: upvotes - downvotes,
    total_votes: upvotes + downvotes
  };
};

// Static method to get all votes by a user
ForumVoteSchema.statics.getUserVotes = function(userId, limit = 50) {
  return this.find({
    user: userId,
    is_active: true
  })
  .populate('target_id')
  .sort({ createdAt: -1 })
  .limit(limit);
};

module.exports = mongoose.model('ForumVote', ForumVoteSchema);