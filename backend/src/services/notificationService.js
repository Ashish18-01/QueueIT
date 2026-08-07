const { Notification, NotificationPreference } = require('../models/Notification');

const TYPES = Object.freeze({
  QUEUE_CREATED: 'queue.created', QUEUE_UPDATED: 'queue.updated', QUEUE_PAUSED: 'queue.paused', QUEUE_RESUMED: 'queue.resumed', QUEUE_CLOSED: 'queue.closed',
  CUSTOMER_JOINED: 'customer.joined', ENTRY_CANCELLED: 'customer.entry_cancelled', ENTRY_TRANSFERRED: 'customer.entry_transferred',
  TURN_NEAR: 'processing.turn_near', TOKEN_CALLED: 'processing.token_called', TOKEN_RECALLED: 'processing.token_recalled', SERVICE_STARTED: 'processing.service_started', SERVICE_COMPLETED: 'processing.service_completed', NO_SHOW: 'processing.no_show',
  LOGIN: 'system.login', PASSWORD_CHANGED: 'system.password_changed', PROFILE_UPDATED: 'system.profile_updated', ACCOUNT_STATUS_CHANGED: 'system.account_status_changed',
  ADMIN_QUEUE_CREATED: 'admin.queue_created', QUEUE_DELETED: 'admin.queue_deleted', EMPLOYEE_ASSIGNED: 'admin.employee_assigned', COUNTER_ACTIVATED: 'admin.counter_activated', COUNTER_OFFLINE: 'admin.counter_offline',
});

const DEFAULT_PREFERENCES = { queue: true, account: true, system: true, browser: false };
const categoryFor = (type = '') => type.startsWith('system.') ? 'system' : type.startsWith('admin.') ? 'admin' : type.startsWith('queue.') || type.startsWith('customer.') || type.startsWith('processing.') ? 'queue' : 'account';
const normalizePreferences = (input = {}) => ({ ...DEFAULT_PREFERENCES, ...input });

async function getPreferences(userId) {
  const doc = await NotificationPreference.findOneAndUpdate({ user: userId }, { $setOnInsert: { preferences: DEFAULT_PREFERENCES } }, { upsert: true, new: true });
  return normalizePreferences(doc.preferences?.toObject?.() || doc.preferences);
}

async function updatePreferences(userId, preferences) {
  const allowed = ['queue', 'account', 'system', 'browser'];
  const next = {};
  allowed.forEach((key) => { if (typeof preferences[key] === 'boolean') next[`preferences.${key}`] = preferences[key]; });
  const doc = await NotificationPreference.findOneAndUpdate({ user: userId }, { $set: next, $setOnInsert: { user: userId } }, { upsert: true, new: true });
  return normalizePreferences(doc.preferences?.toObject?.() || doc.preferences);
}

async function createNotification({ user, type, title, message, data = {} }) {
  const category = categoryFor(type);
  const preferences = await getPreferences(user);
  if ((category === 'queue' && !preferences.queue) || (category === 'system' && !preferences.system) || (category === 'account' && !preferences.account)) return null;
  return Notification.create({ user, type, category, title, message, data });
}

async function listNotifications(userId, query = {}) {
  const page = Math.max(Number(query.page) || 1, 1); const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
  const filter = { user: userId };
  if (query.type) filter.type = query.type;
  if (query.status === 'read') filter.readAt = { $ne: null };
  if (query.status === 'unread') filter.readAt = null;
  if (query.from || query.to) filter.createdAt = { ...(query.from ? { $gte: new Date(query.from) } : {}), ...(query.to ? { $lte: new Date(query.to) } : {}) };
  if (query.search) filter.$text = { $search: query.search };
  const sort = { [query.sortBy || 'createdAt']: query.sortOrder === 'asc' ? 1 : -1 };
  const [items, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort(sort).skip((page - 1) * limit).limit(limit),
    Notification.countDocuments(filter),
    Notification.countDocuments({ user: userId, readAt: null }),
  ]);
  return { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 }, unreadCount };
}

const markRead = (userId, ids) => Notification.updateMany({ user: userId, _id: { $in: ids } }, { $set: { readAt: new Date() } });
const markAllRead = (userId) => Notification.updateMany({ user: userId, readAt: null }, { $set: { readAt: new Date() } });
const remove = (userId, id) => Notification.deleteOne({ user: userId, _id: id });
const clear = (userId) => Notification.deleteMany({ user: userId });

module.exports = { TYPES, createNotification, listNotifications, getPreferences, updatePreferences, markRead, markAllRead, remove, clear };
