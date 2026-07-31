const mongoose = require('mongoose');
const auditLogSchema = new mongoose.Schema({ actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, action: { type: String, required: true, index: true }, target: String, metadata: Object, ip: String, userAgent: String }, { timestamps: true });
module.exports = mongoose.model('AuditLog', auditLogSchema);
