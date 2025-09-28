const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Session title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters long'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Session description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters long'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Tutor is required']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [100, 'Subject cannot exceed 100 characters']
  },
  topics: [{
    type: String,
    trim: true,
    maxlength: [100, 'Each topic cannot exceed 100 characters']
  }],
  session_type: {
    type: String,
    required: [true, 'Session type is required'],
    enum: {
      values: ['one_on_one', 'group_session', 'workshop', 'webinar', 'study_group'],
      message: 'Invalid session type'
    }
  },
  format: {
    type: String,
    required: [true, 'Session format is required'],
    enum: {
      values: ['online', 'in_person', 'hybrid'],
      message: 'Invalid session format'
    }
  },
  scheduled_date: {
    type: Date,
    required: [true, 'Scheduled date is required'],
    validate: {
      validator: function(v) {
        return v > new Date();
      },
      message: 'Scheduled date must be in the future'
    }
  },
  start_time: {
    type: String,
    required: [true, 'Start time is required'],
    validate: {
      validator: function(v) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Start time must be in HH:MM format'
    }
  },
  end_time: {
    type: String,
    required: [true, 'End time is required'],
    validate: {
      validator: function(v) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'End time must be in HH:MM format'
    }
  },
  duration_minutes: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [15, 'Session must be at least 15 minutes'],
    max: [480, 'Session cannot exceed 8 hours (480 minutes)']
  },
  timezone: {
    type: String,
    required: [true, 'Timezone is required'],
    default: 'UTC'
  },
  max_participants: {
    type: Number,
    required: [true, 'Maximum participants is required'],
    min: [1, 'Must allow at least 1 participant'],
    max: [100, 'Cannot exceed 100 participants']
  },
  current_participants: {
    type: Number,
    default: 0,
    min: [0, 'Current participants cannot be negative']
  },
  price_per_participant: {
    type: Number,
    required: [true, 'Price per participant is required'],
    min: [0, 'Price cannot be negative']
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    enum: {
      values: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'LKR'],
      message: 'Invalid currency'
    },
    default: 'USD'
  },
  location: {
    type: {
      type: String,
      enum: ['online', 'physical'],
      required: function() {
        return this.format !== 'online';
      }
    },
    online_meeting_link: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+\..+/.test(v);
        },
        message: 'Please provide a valid meeting link'
      }
    },
    meeting_id: String,
    meeting_password: String,
    physical_address: {
      type: String,
      trim: true,
      maxlength: [300, 'Address cannot exceed 300 characters']
    },
    room_number: String,
    building: String,
    city: String,
    state: String,
    country: String,
    postal_code: String
  },
  prerequisites: {
    type: String,
    trim: true,
    maxlength: [500, 'Prerequisites cannot exceed 500 characters']
  },
  materials_needed: [{
    type: String,
    trim: true,
    maxlength: [100, 'Each material item cannot exceed 100 characters']
  }],
  level: {
    type: String,
    required: [true, 'Session level is required'],
    enum: {
      values: ['beginner', 'intermediate', 'advanced', 'all_levels'],
      message: 'Invalid session level'
    }
  },
  status: {
    type: String,
    required: [true, 'Session status is required'],
    enum: {
      values: ['draft', 'published', 'cancelled', 'completed', 'in_progress'],
      message: 'Invalid session status'
    },
    default: 'draft'
  },
  is_recurring: {
    type: Boolean,
    default: false
  },
  recurring_pattern: {
    type: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      required: function() {
        return this.is_recurring;
      }
    },
    frequency: {
      type: Number,
      min: 1,
      max: 12,
      required: function() {
        return this.is_recurring;
      }
    },
    end_date: {
      type: Date,
      validate: {
        validator: function(v) {
          return !this.is_recurring || v > this.scheduled_date;
        },
        message: 'Recurring end date must be after scheduled date'
      }
    }
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Each tag cannot exceed 30 characters']
  }],
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
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Attachment description cannot exceed 200 characters']
    }
  }],
  session_notes: {
    type: String,
    trim: true,
    maxlength: [2000, 'Session notes cannot exceed 2000 characters']
  },
  feedback_enabled: {
    type: Boolean,
    default: true
  },
  recording_enabled: {
    type: Boolean,
    default: false
  },
  recording_url: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+\..+/.test(v);
      },
      message: 'Please provide a valid recording URL'
    }
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },
  last_modified_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes for better query performance
SessionSchema.index({ tutor: 1, scheduled_date: 1 });
SessionSchema.index({ subject: 1 });
SessionSchema.index({ status: 1, scheduled_date: 1 });
SessionSchema.index({ session_type: 1 });
SessionSchema.index({ tags: 1 });
SessionSchema.index({ scheduled_date: 1, status: 1 });

// Virtual for session availability
SessionSchema.virtual('spots_available').get(function() {
  return this.max_participants - this.current_participants;
});

// Virtual for session status based on date
SessionSchema.virtual('is_past').get(function() {
  return this.scheduled_date < new Date();
});

// Virtual for full meeting datetime
SessionSchema.virtual('meeting_datetime').get(function() {
  const date = new Date(this.scheduled_date);
  const [hours, minutes] = this.start_time.split(':');
  date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  return date;
});

// Pre-save middleware to validate time logic and calculate duration
SessionSchema.pre('save', function(next) {
  // Validate that end_time is after start_time
  const [startHours, startMinutes] = this.start_time.split(':').map(Number);
  const [endHours, endMinutes] = this.end_time.split(':').map(Number);
  
  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;
  
  if (endTotalMinutes <= startTotalMinutes) {
    return next(new Error('End time must be after start time'));
  }

  // Auto-calculate duration if not provided or incorrect
  const calculatedDuration = endTotalMinutes - startTotalMinutes;
  if (this.duration_minutes !== calculatedDuration) {
    this.duration_minutes = calculatedDuration;
  }

  // Set last_modified_by if document is being updated
  if (this.isModified() && !this.isNew) {
    this.last_modified_by = this.created_by; // In a real app, this would come from the request context
  }

  next();
});

// Instance method to check if session is full
SessionSchema.methods.isFull = function() {
  return this.current_participants >= this.max_participants;
};

// Instance method to add participant
SessionSchema.methods.addParticipant = function() {
  if (this.isFull()) {
    throw new Error('Session is already full');
  }
  this.current_participants += 1;
  return this.save();
};

// Instance method to remove participant
SessionSchema.methods.removeParticipant = function() {
  if (this.current_participants > 0) {
    this.current_participants -= 1;
    return this.save();
  }
  throw new Error('No participants to remove');
};

// Instance method to mark as completed
SessionSchema.methods.markCompleted = function(sessionNotes = '') {
  this.status = 'completed';
  if (sessionNotes) {
    this.session_notes = sessionNotes;
  }
  return this.save();
};

// Static method to find available sessions
SessionSchema.statics.findAvailableSessions = function(filters = {}) {
  const query = {
    status: 'published',
    scheduled_date: { $gte: new Date() },
    ...filters
  };

  return this.find(query)
    .where('current_participants').lt(this.max_participants)
    .populate('tutor', 'name email')
    .sort({ scheduled_date: 1 });
};

// Static method to find sessions by tutor
SessionSchema.statics.findByTutor = function(tutorId, includeCompleted = false) {
  const query = { tutor: tutorId };
  if (!includeCompleted) {
    query.status = { $ne: 'completed' };
  }

  return this.find(query)
    .sort({ scheduled_date: -1 })
    .populate('created_by', 'name');
};

// Static method to find upcoming sessions
SessionSchema.statics.findUpcoming = function(limit = 10) {
  return this.find({
    status: 'published',
    scheduled_date: { $gte: new Date() }
  })
  .sort({ scheduled_date: 1 })
  .limit(limit)
  .populate('tutor', 'name email');
};

module.exports = mongoose.model('Session', SessionSchema);