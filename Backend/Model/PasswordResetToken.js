const mongoose = require('mongoose');

const PasswordResetTokenSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true },
  expires_at: { type: Date, required: true },
  used: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('PasswordResetToken', PasswordResetTokenSchema);
