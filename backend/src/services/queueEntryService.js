const entryRepo = require('../repositories/queueEntryRepository');
const queueRepo = require('../repositories/queueRepository');
const audit = require('./auditService');
const processing = require('./queueProcessingService');
const socket = require('../socket');
const { NotFoundError, ConflictError, AuthorizationError } = require('../errors');
const { ACTIVE_QUEUE_ENTRY_STATUSES } = require('../constants/queueConstants');

const canManage = (user) => (user?.roleNames || []).some((role) => ['venue_manager', 'organization_admin', 'super_admin', 'admin', 'owner', 'counter_operator'].includes(role));
const tenantFromEntry = (entry) => ({ organizationId: entry.organizationId, branchId: entry.branchId, venueId: entry.venueId, queueId: entry.queueId });
const tenantFromUser = (user, query = {}) => ({ organizationId: query.organizationId || user?.organizationId, branchId: query.branchId, venueId: query.venueId, queueId: query.queueId });
const activeStatuses = ACTIVE_QUEUE_ENTRY_STATUSES;
const assertActor = (entry, user) => { if (String(entry.customerId) !== String(user._id) && !canManage(user)) throw new AuthorizationError('Queue entry ownership required'); };
const tokenFor = (queue, number) => `${queue.tokenPrefix || 'Q'}-${String(number).padStart(4, '0')}`;

exports.list = (query, user) => {
  // Customers may see their own tickets, never the customer list for a queue.
  // Management roles keep the tenant-scoped operational view.
  const customerQuery = canManage(user) ? query : { ...query, customerId: user._id };
  return entryRepo.findAll(customerQuery, tenantFromUser(user, customerQuery));
};
exports.get = async (id, user) => { const entry = await entryRepo.findById(id, tenantFromUser(user)); if (!entry) throw new NotFoundError('Queue entry not found'); assertActor(entry, user); return entry; };
exports.join = async (queueId, data, user, req) => {
  const queue = await queueRepo.findById(queueId, tenantFromUser(user, data));
  if (!queue) throw new NotFoundError('Queue not found');
  if (queue.visibility && queue.visibility !== 'public' && !canManage(user)) throw new AuthorizationError('This queue is not available for customer self-service');
  if (!queue.isActive || ['closed', 'archived', 'paused'].includes(queue.status)) throw new ConflictError('Queue is not accepting new entries');
  const customerId = data.customerId || user._id;
  if (String(customerId) !== String(user._id) && !canManage(user)) throw new AuthorizationError('Cannot join another customer without queue management access');
  if (await entryRepo.findActiveByCustomer(queue._id, customerId)) throw new ConflictError('Customer already has an active entry in this queue');
  if (await entryRepo.countActive(queue._id) >= queue.maximumCapacity) throw new ConflictError('Queue capacity has been reached');
  const tokenNumber = await entryRepo.nextTokenNumber(queue._id);
  const position = (await entryRepo.countActive(queue._id)) + 1;
  const estimatedWaitMinutes = Math.max(position - 1, 0) * queue.averageServiceTimeMinutes;
  let entry;
  // The unique queue/token index is the final authority under concurrent joins.
  // Retry a conflicting generated token a few times instead of returning a 500.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const nextNumber = attempt ? await entryRepo.nextTokenNumber(queue._id) : tokenNumber;
    try {
      entry = await entryRepo.create({ organizationId: queue.organizationId, branchId: queue.branchId, venueId: queue.venueId, queueId: queue._id, customerId, tokenNumber: nextNumber, token: tokenFor(queue, nextNumber), position, estimatedWaitMinutes, estimatedServiceAt: new Date(Date.now() + estimatedWaitMinutes * 60000), metadata: data.metadata });
      break;
    } catch (error) {
      if (error?.code !== 11000 || attempt === 2) throw error;
    }
  }
  await processing.recalculate(queue._id, queue);
  await audit.record('queueEntry.joined', { actor: user._id, target: entry.id, metadata: { queueId: queue.id, token: entry.token, requestId: req.id }, req });
  socket.broadcast(socket.EVENTS.CUSTOMER_JOINED, entry.toObject ? entry.toObject() : entry);
  socket.broadcast(socket.EVENTS.TOKEN_GENERATED, entry.toObject ? entry.toObject() : entry, { rooms: [socket.roomsForResource(entry)[3], `customer:${entry.customerId}`].filter(Boolean) });
  const result = entry.toJSON ? entry.toJSON() : entry;
  return { ...result, queueName: queue.name, queueStatus: queue.status };
};
exports.leave = async (id, user, req) => {
  const entry = await exports.get(id, user);
  if (!activeStatuses.includes(entry.status)) throw new ConflictError('Only active queue entries can be left');
  const updated = await entryRepo.update(id, tenantFromEntry(entry), { status: 'left', leftAt: new Date(), position: 0, estimatedWaitMinutes: 0 });
  await processing.recalculate(entry.queueId, await queueRepo.findById(entry.queueId, tenantFromEntry(entry)));
  await audit.record('queueEntry.left', { actor: user._id, target: id, metadata: { queueId: entry.queueId, requestId: req.id }, req });
  socket.broadcast(socket.EVENTS.CUSTOMER_LEFT, updated.toObject ? updated.toObject() : updated);
  return updated;
};
exports.cancel = async (id, user, req) => {
  const entry = await exports.get(id, user);
  if (!activeStatuses.includes(entry.status)) throw new ConflictError('Only active queue entries can be cancelled');
  const updated = await entryRepo.update(id, tenantFromEntry(entry), { status: 'cancelled', cancelledAt: new Date(), cancelledBy: user._id, position: 0, estimatedWaitMinutes: 0 });
  await processing.recalculate(entry.queueId, await queueRepo.findById(entry.queueId, tenantFromEntry(entry)));
  await audit.record('queueEntry.cancelled', { actor: user._id, target: id, metadata: { queueId: entry.queueId, requestId: req.id }, req });
  socket.broadcast(socket.EVENTS.ENTRY_CANCELLED, updated.toObject ? updated.toObject() : updated);
  return updated;
};
exports.remove = async (id, user, req) => { const entry = await exports.get(id, user); const updated = await entryRepo.update(id, tenantFromEntry(entry), { deletedAt: new Date(), deletedBy: user._id }); await audit.record('queueEntry.deleted', { actor: user._id, target: id, metadata: { queueId: entry.queueId, requestId: req.id }, req }); return updated; };
