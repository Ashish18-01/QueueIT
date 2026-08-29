const repo = require('../repositories/queueRepository');
const audit = require('./auditService');
const { ValidationError, NotFoundError, ConflictError, AuthorizationError } = require('../errors');
const socket = require('../socket');
const { ALLOWED_STATUS_TRANSITIONS, QUEUE_TEMPLATES, QUEUE_ACTION_ROLES } = require('../constants/queueConstants');
const canManage = (user) => (user?.roleNames || []).some((role) => QUEUE_ACTION_ROLES.includes(role));
const elevated = (user) => (user?.roleNames || []).some((role) => ['admin', 'owner', 'super_admin'].includes(role));
const tenantFrom = (user, body = {}) => ({ organizationId: elevated(user) ? body.organizationId : user?.organizationId, branchId: body.branchId, venueId: body.venueId });
const requireManager = (user) => { if (!canManage(user)) throw new AuthorizationError('Only venue managers, organization admins, and super admins can manage queues'); };
const assertMutable = (queue) => { if (queue.status === 'archived' || queue.deletedAt) throw new ConflictError('Archived or deleted queues cannot be modified'); };
const assertTransition = (from, to) => { if (!ALLOWED_STATUS_TRANSITIONS[from]?.includes(to)) throw new ValidationError(`Invalid queue status transition from ${from} to ${to}`); };
const validateOperatingHours = (hours = []) => { for (const h of hours) { if (h.closed) continue; if (!h.opensAt || !h.closesAt || h.opensAt >= h.closesAt) throw new ValidationError('Operating hours require opensAt before closesAt'); } };
const applyTemplate = (data) => data.templateKey && QUEUE_TEMPLATES[data.templateKey] ? { ...QUEUE_TEMPLATES[data.templateKey], ...data } : data;
const ensureDuplicate = async (venueId, name, excludeId) => { if (await repo.findDuplicateName(venueId, name, excludeId)) throw new ConflictError('Queue name must be unique within the same venue'); };
exports.templates = () => QUEUE_TEMPLATES;
exports.create = async (data, user, req) => { requireManager(user); const organizationId = elevated(user) ? data.organizationId : user.organizationId; if (!organizationId) throw new ValidationError('Organization is required to create a queue'); const payload = applyTemplate({ ...data, organizationId, branchId: data.branchId || organizationId, venueId: data.venueId || organizationId, status: data.status || 'active', isActive: data.isActive ?? ((data.status || 'active') === 'active'), averageServiceTimeMinutes: data.averageServiceTimeMinutes || 5, maximumCapacity: data.maximumCapacity || 100, createdBy: user._id, updatedBy: user._id }); validateOperatingHours(payload.operatingHours); await ensureDuplicate(payload.venueId, payload.name); const queue = await repo.create(payload); await audit.record('queue.created', { actor: user._id, target: queue.id, metadata: { organizationId: queue.organizationId, requestId: req.id }, req }); socket.broadcast(socket.EVENTS.QUEUE_CREATED, queue.toObject ? queue.toObject() : queue); return queue; };
exports.list = (query, user) => {
  // The customer-facing directory deliberately exposes only active public queues.
  const customerQuery = canManage(user) ? query : { ...query, visibility: 'public', status: 'active' };
  return repo.findAll(customerQuery, tenantFrom(user, customerQuery));
};
exports.get = async (id, user) => {
  const queue = await repo.findById(id, tenantFrom(user));
  if (!queue) throw new NotFoundError('Queue not found');
  if (!canManage(user) && (queue.visibility !== 'public' || !queue.isActive || queue.status !== 'active')) throw new NotFoundError('Queue not found');
  return queue;
};
exports.update = async (id, data, user, req) => { requireManager(user); const queue = await exports.get(id, user); assertMutable(queue); if (data.status && data.status !== queue.status) assertTransition(queue.status, data.status); if (data.name || data.venueId) await ensureDuplicate(data.venueId || queue.venueId, data.name || queue.name, id); validateOperatingHours(data.operatingHours); const updated = await repo.update(id, tenantFrom(user, queue), { ...data, isActive: data.status ? data.status === 'active' : queue.isActive, updatedBy: user._id }); await audit.record('queue.updated', { actor: user._id, target: id, metadata: { organizationId: updated.organizationId, requestId: req.id }, req }); socket.broadcast(socket.EVENTS.QUEUE_UPDATED, updated.toObject ? updated.toObject() : updated); return updated; };
exports.transition = async (id, status, action, user, req) => { requireManager(user); const queue = await exports.get(id, user); assertMutable(queue); assertTransition(queue.status, status); const updated = await repo.update(id, tenantFrom(user, queue), { status, isActive: status === 'active', updatedBy: user._id, ...(status === 'archived' && { archivedAt: new Date(), archivedBy: user._id }) }); await audit.record(`queue.${action}`, { actor: user._id, target: id, metadata: { organizationId: updated.organizationId, requestId: req.id }, req }); socket.broadcast(action === 'activated' ? socket.EVENTS.QUEUE_ACTIVATED : action === 'resumed' ? socket.EVENTS.QUEUE_RESUMED : action === 'paused' ? socket.EVENTS.QUEUE_PAUSED : action === 'closed' ? socket.EVENTS.QUEUE_CLOSED : socket.EVENTS.QUEUE_UPDATED, updated.toObject ? updated.toObject() : updated); return updated; };
exports.archive = (id, user, req) => exports.transition(id, 'archived', 'archived', user, req);
exports.restore = async (id, user, req) => { requireManager(user); const queue = await exports.get(id, user); if (queue.status !== 'archived') throw new ValidationError('Only archived queues can be restored'); const updated = await repo.restore(id, tenantFrom(user, queue), user._id); await audit.record('queue.restored', { actor: user._id, target: id, metadata: { organizationId: updated.organizationId, requestId: req.id }, req }); return updated; };
exports.softDelete = async (id, user, req) => { requireManager(user); const queue = await exports.get(id, user); const deleted = await repo.softDelete(id, tenantFrom(user, queue), user._id); await audit.record('queue.deleted', { actor: user._id, target: id, metadata: { organizationId: queue.organizationId, requestId: req.id }, req }); socket.broadcast(socket.EVENTS.QUEUE_DELETED, queue.toObject ? queue.toObject() : queue); return deleted; };
