const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, index: true },
  venueId: { type: mongoose.Schema.Types.ObjectId, index: true },
  queueId: { type: mongoose.Schema.Types.ObjectId, index: true },
  title: { type: String, required: true, trim: true, maxlength: 160 },
  source: { type: String, required: true, trim: true, maxlength: 500 },
  content: { type: String, required: true, maxlength: 50000 },
  visibility: { type: String, enum: ['organization', 'public'], default: 'organization' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['ready', 'deleted'], default: 'ready', index: true },
}, { timestamps: true });
schema.index({ organizationId: 1, status: 1, updatedAt: -1 });
module.exports = mongoose.model('KnowledgeDocument', schema);
