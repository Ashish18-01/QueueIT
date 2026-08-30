const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, index: true },
  venueId: { type: mongoose.Schema.Types.ObjectId, index: true },
  queueId: { type: mongoose.Schema.Types.ObjectId, index: true },
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'KnowledgeDocument', required: true, index: true },
  chunkId: { type: String, required: true },
  source: { type: String, required: true },
  content: { type: String, required: true, maxlength: 4000 },
  embedding: { type: [Number], select: false, default: undefined },
}, { timestamps: true });
schema.index({ organizationId: 1, documentId: 1, chunkId: 1 }, { unique: true });
schema.index({ content: 'text' });
module.exports = mongoose.model('KnowledgeChunk', schema);
