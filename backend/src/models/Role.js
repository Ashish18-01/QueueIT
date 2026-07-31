const mongoose = require('mongoose');
const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: String,
  permissions: [{ type: String, trim: true }],
  inherits: [{ type: String, lowercase: true, trim: true }],
  scope: { type: String, enum: ['system', 'organization', 'branch', 'venue'], default: 'system' },
  level: { type: Number, default: 0 },
}, { timestamps: true });
module.exports = mongoose.model('Role', roleSchema);
