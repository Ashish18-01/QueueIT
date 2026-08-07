const mongoose = require('mongoose');

const preferencesSchema = new mongoose.Schema({
  queue: { type: Boolean, default: true },
  account: { type: Boolean, default: true },
  system: { type: Boolean, default: true },
  browser: { type: Boolean, default: false },
}, { _id: false });

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, required: true, index: true },
  category: { type: String, enum: ['queue', 'account', 'system', 'admin'], required: true, index: true },
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  readAt: { type: Date, default: null, index: true },
}, { timestamps: true });

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ title: 'text', message: 'text', type: 'text' });
notificationSchema.virtual('read').get(function read() { return Boolean(this.readAt); });
notificationSchema.set('toJSON', { virtuals: true });

const notificationPreferenceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  preferences: { type: preferencesSchema, default: () => ({}) },
}, { timestamps: true });

module.exports = {
  Notification: mongoose.model('Notification', notificationSchema),
  NotificationPreference: mongoose.model('NotificationPreference', notificationPreferenceSchema),
};
