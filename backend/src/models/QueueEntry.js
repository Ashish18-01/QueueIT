const mongoose = require('mongoose');
const { QUEUE_ENTRY_STATUSES } = require('../constants/queueConstants');

const queueEntrySchema = new mongoose.Schema({
  schemaVersion: { type: Number, default: 1 },
  organizationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  venueId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  queueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Queue', required: true, index: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tokenNumber: { type: Number, required: true, min: 1 },
  token: { type: String, required: true, trim: true, uppercase: true },
  status: { type: String, enum: QUEUE_ENTRY_STATUSES, default: 'waiting', index: true },
  joinedAt: { type: Date, default: Date.now, index: true },
  leftAt: Date,
  cancelledAt: Date,
  cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date, index: true },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  metadata: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

queueEntrySchema.index({ queueId: 1, tokenNumber: 1 }, { unique: true });
queueEntrySchema.index({ queueId: 1, token: 1 }, { unique: true });
queueEntrySchema.index({ queueId: 1, customerId: 1, status: 1, deletedAt: 1 });
queueEntrySchema.index({ queueId: 1, status: 1, joinedAt: 1, tokenNumber: 1 });

module.exports = mongoose.model('QueueEntry', queueEntrySchema);
