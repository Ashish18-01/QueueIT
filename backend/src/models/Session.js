const mongoose = require('mongoose');
const sessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  refreshTokenHash: { type: String, required: true },
  tokenFamily: { type: String, required: true, index: true },
  revokedAt: Date,
  revokedReason: String,
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
  ip: String,
  userAgent: String,
  lastActivityAt: { type: Date, default: Date.now },
}, { timestamps: true });
module.exports = mongoose.model('Session', sessionSchema);
