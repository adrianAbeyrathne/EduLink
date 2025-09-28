const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
  role_name: {
    type: String,
    required: true,
    enum: ['Student', 'Tutor', 'Admin', 'Rep', 'Moderator']
  },
  description: String
}, { timestamps: true });

module.exports = mongoose.model('Role', RoleSchema);
