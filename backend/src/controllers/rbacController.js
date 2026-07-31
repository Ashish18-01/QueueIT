const { Role, User } = require('../models');
const { success } = require('../utils/response');
const audit = require('../services/auditService');
exports.createRole = async (req, res) => { const role = await Role.create(req.body); await audit.record('rbac.role_created', { actor: req.user._id, target: role.id, req }); success(res, role, 'Role created', 201); };
exports.listRoles = async (_req, res) => success(res, await Role.find().sort('level name'), 'Roles');
exports.assignRoles = async (req, res) => { const user = await User.findByIdAndUpdate(req.params.userId, { roleNames: req.body.roles }, { new: true }); await audit.record('rbac.roles_assigned', { actor: req.user._id, target: req.params.userId, metadata: { roles: req.body.roles }, req }); success(res, user, 'Roles assigned'); };
exports.setPermissions = async (req, res) => { const role = await Role.findByIdAndUpdate(req.params.roleId, { permissions: req.body.permissions }, { new: true }); await audit.record('rbac.permissions_changed', { actor: req.user._id, target: req.params.roleId, metadata: { permissions: req.body.permissions }, req }); success(res, role, 'Permissions updated'); };
