const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const service = require('../services/notificationService');

exports.list = asyncHandler(async (req, res) => {
  const result = await service.listNotifications(req.user._id, req.query);
  success(res, result.items, 'Notifications fetched', 200, { pagination: result.pagination, unreadCount: result.unreadCount });
});
exports.preferences = asyncHandler(async (req, res) => success(res, await service.getPreferences(req.user._id), 'Notification preferences fetched'));
exports.updatePreferences = asyncHandler(async (req, res) => success(res, await service.updatePreferences(req.user._id, req.body), 'Notification preferences updated'));
exports.markRead = asyncHandler(async (req, res) => { await service.markRead(req.user._id, req.body.ids || [req.params.id]); success(res, null, 'Notification marked as read'); });
exports.markAllRead = asyncHandler(async (req, res) => { await service.markAllRead(req.user._id); success(res, null, 'Notifications marked as read'); });
exports.remove = asyncHandler(async (req, res) => { await service.remove(req.user._id, req.params.id); success(res, null, 'Notification deleted'); });
exports.clear = asyncHandler(async (req, res) => { await service.clear(req.user._id); success(res, null, 'Notifications cleared'); });
