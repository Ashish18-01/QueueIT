const mongoose = require('mongoose');
const { QUEUE_STATUSES, QUEUE_VISIBILITIES, TOKEN_STRATEGIES, QUEUE_CATEGORIES } = require('../constants/queueConstants');
const operatingWindowSchema = new mongoose.Schema({ dayOfWeek: { type: Number, required: true, min: 0, max: 6 }, opensAt: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ }, closesAt: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ }, closed: { type: Boolean, default: false } }, { _id: false });
const queueSchema = new mongoose.Schema({
  schemaVersion: { type: Number, default: 1 },
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
  description: { type: String, trim: true, maxlength: 1000 },
  organizationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  venueId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  counterId: { type: mongoose.Schema.Types.ObjectId, index: true },
  queueTemplateId: { type: mongoose.Schema.Types.ObjectId, index: true },
  templateKey: { type: String, trim: true },
  category: { type: String, enum: QUEUE_CATEGORIES, default: 'general', index: true },
  tokenPrefix: { type: String, trim: true, uppercase: true, maxlength: 8, default: 'Q' },
  tokenStrategy: { type: String, enum: TOKEN_STRATEGIES, default: 'sequential' },
  averageServiceTimeMinutes: { type: Number, required: true, min: 1, max: 1440 },
  maximumCapacity: { type: Number, required: true, min: 1, max: 100000 },
  dailyCapacity: { type: Number, min: 1, max: 1000000 },
  operatingHours: { type: [operatingWindowSchema], default: [] },
  visibility: { type: String, enum: QUEUE_VISIBILITIES, default: 'public', index: true },
  status: { type: String, enum: QUEUE_STATUSES, default: 'draft', index: true },
  priorityEnabled: { type: Boolean, default: false },
  isActive: { type: Boolean, default: false, index: true },
  archivedAt: Date,
  archivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date, index: true },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  metadata: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });
queueSchema.index({ venueId: 1, name: 1, deletedAt: 1 }, { unique: true, partialFilterExpression: { deletedAt: null } });
queueSchema.index({ organizationId: 1, status: 1, createdAt: -1 });
queueSchema.index({ name: 'text', description: 'text' });
module.exports = mongoose.model('Queue', queueSchema);
