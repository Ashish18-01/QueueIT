const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  description: { type: String, trim: true, maxlength: 1000 },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  adminIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],
  status: { type: String, enum: ['active', 'disabled'], default: 'active', index: true },
}, { timestamps: true });

organizationSchema.index({ ownerId: 1, createdAt: -1 });
organizationSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Organization', organizationSchema);
