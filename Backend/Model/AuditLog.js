const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action_type: { type: String, required: true },
  target_user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  details: String
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
