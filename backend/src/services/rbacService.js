const { Role } = require('../models');
const builtIn = { user: [], admin: ['*'], owner: ['*'], super_admin: ['*'], organization_admin: ['queues:read', 'queues:write'], venue_manager: ['queues:read', 'queues:write'], counter_operator: ['queues:read'] };
const expand = async (roleNames = [], seen = new Set()) => {
  const perms = new Set();
  for (const name of roleNames) {
    if (seen.has(name)) continue; seen.add(name);
    (builtIn[name] || []).forEach((p) => perms.add(p));
    const role = await Role.findOne({ name }).lean();
    if (role) { (role.permissions || []).forEach((p) => perms.add(p)); (await expand(role.inherits || [], seen)).forEach((p) => perms.add(p)); }
  }
  return perms;
};
const hasPermission = async (user, permission, scope = {}) => {
  const perms = await expand(user.roleNames || []);
  return perms.has('*') || perms.has(permission) || (scope.organizationId && perms.has(`${permission}:organization`)) || (scope.branchId && perms.has(`${permission}:branch`)) || (scope.venueId && perms.has(`${permission}:venue`));
};
module.exports = { hasPermission, expand };
