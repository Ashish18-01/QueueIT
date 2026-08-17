const mongoose = require('mongoose');
const passwordHistorySchema = new mongoose.Schema({ hash: String, changedAt: { type: Date, default: Date.now } }, { _id: false });
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  name: { type: String, required: true, trim: true },
  passwordHash: { type: String, select: false },
  passwordHistory: { type: [passwordHistorySchema], select: false, default: [] },
  passwordChangedAt: Date,
  passwordExpiresAt: Date,
  emailVerified: { type: Boolean, default: false },
  emailVerifiedAt: Date,
  roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }],
  roleNames: { type: [String], default: ['user'], index: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, index: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, index: true },
  venueId: { type: mongoose.Schema.Types.ObjectId, index: true },
  googleId: { type: String, sparse: true, index: true },
  status: { type: String, enum: ['active', 'disabled', 'locked'], default: 'active' },
  lastLoginAt: Date,
  loginHistory: [{ at: Date, ip: String, userAgent: String }],
}, { timestamps: true, toJSON: { virtuals: true, transform: (_, ret) => { ret.role = ret.role || ret.roleNames?.[0] || 'user'; delete ret.passwordHash; delete ret.passwordHistory; return ret; } } });
userSchema.virtual('role').get(function role() { return this.roleNames?.[0] || 'user'; });
module.exports = mongoose.model('User', userSchema);
