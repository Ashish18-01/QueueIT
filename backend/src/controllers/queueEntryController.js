const service = require('../services/queueEntryService');
const { success } = require('../utils/response');
const processing = require('../services/queueProcessingService');

exports.list = async (req, res) => { const { items, meta } = await service.list(req.query, req.user); success(res, items, 'Queue entries', 200, meta); };
exports.search = exports.list;
exports.get = async (req, res) => success(res, await service.get(req.params.entryId, req.user), 'Queue entry');
exports.join = async (req, res) => success(res, await service.join(req.params.queueId, req.body, req.user, req), 'Joined queue', 201);
exports.leave = async (req, res) => success(res, await service.leave(req.params.entryId, req.user, req), 'Left queue');
exports.cancel = async (req, res) => success(res, await service.cancel(req.params.entryId, req.user, req), 'Queue entry cancelled');
exports.remove = async (req, res) => success(res, await service.remove(req.params.entryId, req.user, req), 'Queue entry deleted');

exports.callNext = async (req, res) => success(res, await processing.callNext(req.params.queueId, req.body, req.user, req), 'Next customer called');
exports.recall = async (req, res) => success(res, await processing.recall(req.params.entryId, req.body, req.user, req), 'Customer recalled');
exports.skip = async (req, res) => success(res, await processing.skip(req.params.entryId, req.user, req), 'Customer skipped');
exports.startService = async (req, res) => success(res, await processing.startService(req.params.entryId, req.body, req.user, req), 'Service started');
exports.completeService = async (req, res) => success(res, await processing.completeService(req.params.entryId, req.user, req), 'Service completed');
exports.noShow = async (req, res) => success(res, await processing.noShow(req.params.entryId, req.user, req), 'Customer marked no show');
exports.expire = async (req, res) => success(res, await processing.expire(req.params.entryId, req.user, req), 'Queue entry expired');
