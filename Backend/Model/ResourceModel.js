const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  uploaded_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  description: String,
  subject: String,
  topic: String,
  file_type: String,
  file_url: String,
  tags: [String]
}, { timestamps: true });

module.exports = mongoose.model('Resource', ResourceSchema);
