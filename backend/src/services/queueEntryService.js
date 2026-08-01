const entryRepo = require('../repositories/queueEntryRepository');
const queueRepo = require('../repositories/queueRepository');
const audit = require('./auditService');
const processing = require('./queueProcessingService');
const { NotFoundError, ConflictError, AuthorizationError } = require('../errors');
const { ACTIVE_QUEUE_ENTRY_STATUSES } = require('../constants/queueConstants');

const canManage = (user) => (user?.roleNames || []).some((role) => ['venue_manager', 'organization_admin', 'super_admin', 'admin', 'owner', 'counter_operator'].includes(role));
const tenantFromEntry = (entry) => ({ organizationId: entry.organizationId, branchId: entry.branchId, venueId: entry.venueId, queueId: entry.queueId });
const tenantFromUser = (user, query = {}) => ({ organizationId: query.organizationId || user?.organizationId, branchId: query.branchId, venueId: query.venueId, queueId: query.queueId });
const activeStatuses = ACTIVE_QUEUE_ENTRY_STATUSES;
const assertActor = (entry, user) => { if (String(entry.customerId) !== String(user._id) && !canManage(user)) throw new AuthorizationError('Queue entry ownership required'); };
const tokenFor = (queue, number) => `${queue.tokenPrefix || 'Q'}-${String(number).padStart(4, '0')}`;

exports.list = (query, user) => entryRepo.findAll(query, tenantFromUser(user, query));
exports.get = async (id, user) => { const entry = await entryRepo.findById(id, tenantFromUser(user)); if (!entry) throw new NotFoundError('Queue entry not found'); assertActor(entry, user); return entry; };
exports.join = async (queueId, data, user, req) => {
  const queue = await queueRepo.findById(queueId, tenantFromUser(user, data));
  if (!queue) throw new NotFoundError('Queue not found');
  if (!queue.isActive || ['closed', 'archived', 'paused'].includes(queue.status)) throw new ConflictError('Queue is not accepting new entries');
  const customerId = data.customerId || user._id;
  if (String(customerId) !== String(user._id) && !canManage(user)) throw new AuthorizationError('Cannot join another customer without queue management access');
  if (await entryRepo.findActiveByCustomer(queue._id, customerId)) throw new ConflictError('Customer already has an active entry in this queue');
  if (await entryRepo.countActive(queue._id) >= queue.maximumCapacity) throw new ConflictError('Queue capacity has been reached');
  const tokenNumber = await entryRepo.nextTokenNumber(queue._id);
  const position = (await entryRepo.countActive(queue._id)) + 1;
  const estimatedWaitMinutes = Math.max(position - 1, 0) * queue.averageServiceTimeMinutes;
  const entry = await entryRepo.create({ organizationId: queue.organizationId, branchId: queue.branchId, venueId: queue.venueId, queueId: queue._id, customerId, tokenNumber, token: tokenFor(queue, tokenNumber), position, estimatedWaitMinutes, estimatedServiceAt: new Date(Date.now() + estimatedWaitMinutes * 60000), metadata: data.metadata });
  await processing.recalculate(queue._id, queue);
  await audit.record('queueEntry.joined', { actor: user._id, target: entry.id, metadata: { queueId: queue.id, token: entry.token, requestId: req.id }, req });
  return entry;
};
exports.leave = async (id, user, req) => {
  const entry = await exports.get(id, user);
  if (!activeStatuses.includes(entry.status)) throw new ConflictError('Only active queue entries can be left');
  const updated = await entryRepo.update(id, tenantFromEntry(entry), { status: 'left', leftAt: new Date(), position: 0, estimatedWaitMinutes: 0 });
  await processing.recalculate(entry.queueId, await queueRepo.findById(entry.queueId, tenantFromEntry(entry)));
  await audit.record('queueEntry.left', { actor: user._id, target: id, metadata: { queueId: entry.queueId, requestId: req.id }, req });
  return updated;
};
exports.cancel = async (id, user, req) => {
  const entry = await exports.get(id, user);
  if (!activeStatuses.includes(entry.status)) throw new ConflictError('Only active queue entries can be cancelled');
  const updated = await entryRepo.update(id, tenantFromEntry(entry), { status: 'cancelled', cancelledAt: new Date(), cancelledBy: user._id, position: 0, estimatedWaitMinutes: 0 });
  await processing.recalculate(entry.queueId, await queueRepo.findById(entry.queueId, tenantFromEntry(entry)));
  await audit.record('queueEntry.cancelled', { actor: user._id, target: id, metadata: { queueId: entry.queueId, requestId: req.id }, req });
  return updated;
};
exports.remove = async (id, user, req) => { const entry = await exports.get(id, user); const updated = await entryRepo.update(id, tenantFromEntry(entry), { deletedAt: new Date(), deletedBy: user._id }); await audit.record('queueEntry.deleted', { actor: user._id, target: id, metadata: { queueId: entry.queueId, requestId: req.id }, req }); return updated; };
