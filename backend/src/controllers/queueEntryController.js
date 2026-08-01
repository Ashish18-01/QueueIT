const service = require('../services/queueEntryService');
const { success } = require('../utils/response');

exports.list = async (req, res) => { const { items, meta } = await service.list(req.query, req.user); success(res, items, 'Queue entries', 200, meta); };
exports.search = exports.list;
exports.get = async (req, res) => success(res, await service.get(req.params.entryId, req.user), 'Queue entry');
exports.join = async (req, res) => success(res, await service.join(req.params.queueId, req.body, req.user, req), 'Joined queue', 201);
exports.leave = async (req, res) => success(res, await service.leave(req.params.entryId, req.user, req), 'Left queue');
exports.cancel = async (req, res) => success(res, await service.cancel(req.params.entryId, req.user, req), 'Queue entry cancelled');
exports.remove = async (req, res) => success(res, await service.remove(req.params.entryId, req.user, req), 'Queue entry deleted');
