const service = require('../services/organizationService');
const { success } = require('../utils/response');
exports.create = async (req, res) => success(res, await service.create(req.body, req.user, req), 'Organization created', 201);
exports.mine = async (req, res) => success(res, await service.listMine(req.user), 'Organizations');
exports.get = async (req, res) => success(res, await service.get(req.params.organizationId, req.user), 'Organization');
exports.dashboard = async (req, res) => success(res, await service.dashboard(req.params.organizationId, req.user), 'Organization dashboard');
