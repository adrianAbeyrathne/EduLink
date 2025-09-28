const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Resource title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters long'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Resource description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters long'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  file_url: {
    type: String,
    required: [true, 'File URL is required'],
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+\..+/.test(v);
      },
      message: 'Please provide a valid file URL'
    }
  },
  file_type: {
    type: String,
    required: [true, 'File type is required'],
    enum: {
      values: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'jpg', 'png', 'mp4', 'mp3', 'txt', 'zip'],
      message: 'File type must be one of: pdf, doc, docx, ppt, pptx, jpg, png, mp4, mp3, txt, zip'
    }
  },
  file_size: {
    type: Number,
    required: [true, 'File size is required'],
    min: [1, 'File size must be at least 1 byte'],
    max: [104857600, 'File size cannot exceed 100MB'] // 100MB in bytes
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['lecture_notes', 'assignments', 'textbooks', 'research_papers', 'videos', 'audio', 'presentations', 'practice_tests', 'solutions', 'other'],
      message: 'Invalid category'
    }
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [100, 'Subject cannot exceed 100 characters']
  },
  grade_level: {
    type: String,
    enum: {
      values: ['elementary', 'middle_school', 'high_school', 'undergraduate', 'graduate', 'professional'],
      message: 'Invalid grade level'
    }
  },
  uploaded_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Uploader is required']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Each tag cannot exceed 50 characters']
  }],
  download_count: {
    type: Number,
    default: 0,
    min: [0, 'Download count cannot be negative']
  },
  is_approved: {
    type: Boolean,
    default: false
  },
  approved_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  is_public: {
    type: Boolean,
    default: true
  },
  access_level: {
    type: String,
    enum: {
      values: ['public', 'students_only', 'tutors_only', 'premium'],
      message: 'Invalid access level'
    },
    default: 'public'
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes for better query performance
ResourceSchema.index({ category: 1, subject: 1 });
ResourceSchema.index({ uploaded_by: 1 });
ResourceSchema.index({ is_approved: 1, is_public: 1 });
ResourceSchema.index({ tags: 1 });

// Virtual for file size in MB
ResourceSchema.virtual('file_size_mb').get(function() {
  return (this.file_size / 1024 / 1024).toFixed(2);
});

// Pre-save middleware to validate file type and URL
ResourceSchema.pre('save', function(next) {
  if (this.isModified('file_url') && this.file_type) {
    const url = this.file_url.toLowerCase();
    const fileType = this.file_type.toLowerCase();
    
    // Check if URL contains the file extension
    if (!url.includes(`.${fileType}`)) {
      return next(new Error(`File URL does not match file type ${fileType}`));
    }
  }
  next();
});

// Instance method to increment download count
ResourceSchema.methods.incrementDownloadCount = function() {
  this.download_count += 1;
  return this.save();
};

// Static method to find resources by subject and category
ResourceSchema.statics.findBySubjectAndCategory = function(subject, category) {
  return this.find({ 
    subject: new RegExp(subject, 'i'), 
    category: category,
    is_approved: true,
    is_public: true
  }).populate('uploaded_by', 'name email');
};

module.exports = mongoose.model('Resource', ResourceSchema);