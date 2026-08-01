const entryRepo = require('../repositories/queueEntryRepository');
const queueRepo = require('../repositories/queueRepository');
const audit = require('./auditService');
const { NotFoundError, ConflictError, AuthorizationError } = require('../errors');
const socket = require('../socket');
const { QUEUE_PROCESSING_ROLES, ACTIVE_QUEUE_ENTRY_STATUSES } = require('../constants/queueConstants');

const canProcess = (user) => (user?.roleNames || []).some((role) => QUEUE_PROCESSING_ROLES.includes(role));
const requireProcessor = (user) => { if (!canProcess(user)) throw new AuthorizationError('Only counter operators, venue managers, organization admins, and super admins can process queues'); };
const tenantFromUser = (user, data = {}) => ({ organizationId: data.organizationId || user?.organizationId, branchId: data.branchId, venueId: data.venueId, queueId: data.queueId });
const tenantFromEntry = (entry) => ({ organizationId: entry.organizationId, branchId: entry.branchId, venueId: entry.venueId, queueId: entry.queueId });
const queueTenant = (queue) => ({ organizationId: queue.organizationId, branchId: queue.branchId, venueId: queue.venueId });
const allowed = {
  waiting: ['called', 'skipped', 'cancelled', 'expired'],
  called: ['recalled', 'in_service', 'skipped', 'no_show', 'cancelled', 'expired'],
  recalled: ['in_service', 'skipped', 'no_show', 'cancelled', 'expired'],
  in_service: ['completed', 'no_show', 'cancelled'],
};
const assertTransition = (entry, status) => { if (!allowed[entry.status]?.includes(status)) throw new ConflictError(`Invalid queue entry transition from ${entry.status} to ${status}`); };

const positionStatuses = ['waiting'];
const recalculate = async (queueId, queue) => {
  const active = await entryRepo.findActiveOrdered(queueId);
  let position = 1;
  await Promise.all(active.map((entry) => {
    const updates = {};
    if (positionStatuses.includes(entry.status)) {
      updates.position = position;
      updates.estimatedWaitMinutes = Math.max(position - 1, 0) * queue.averageServiceTimeMinutes;
      updates.estimatedServiceAt = new Date(Date.now() + updates.estimatedWaitMinutes * 60000);
      position += 1;
    } else {
      updates.position = 0;
      updates.estimatedWaitMinutes = 0;
    }
    return entryRepo.update(entry._id, tenantFromEntry(entry), updates);
  }));
  const [currentQueueLength, customersServed, avgWaitMs] = await Promise.all([
    entryRepo.countByStatus(queueId, ACTIVE_QUEUE_ENTRY_STATUSES),
    entryRepo.countByStatus(queueId, ['completed']),
    entryRepo.averageCompletedWaitMs(queueId),
  ]);
  await queueRepo.update(queueId, queueTenant(queue), { statistics: { currentQueueLength, customersServed, averageWaitTimeMinutes: Math.round(avgWaitMs / 60000), lastCalculatedAt: new Date() } });
  socket.broadcast(socket.EVENTS.LIVE_QUEUE_UPDATE, { organizationId: queue.organizationId, branchId: queue.branchId, venueId: queue.venueId, queueId, queueLength: currentQueueLength, waitingCount: await entryRepo.countByStatus(queueId, ['waiting']), queueStatus: queue.status, currentServingToken: active.find((e) => ['called', 'recalled', 'in_service'].includes(e.status))?.token, statistics: { currentQueueLength, customersServed, averageWaitTimeMinutes: Math.round(avgWaitMs / 60000) } });
};

const getQueue = async (queueId, user, data = {}) => { const queue = await queueRepo.findById(queueId, tenantFromUser(user, data)); if (!queue) throw new NotFoundError('Queue not found'); return queue; };
const getEntry = async (id, user) => { const entry = await entryRepo.findById(id, tenantFromUser(user)); if (!entry) throw new NotFoundError('Queue entry not found'); return entry; };
const transitionEntry = async (entry, status, user, req, fields = {}) => {
  assertTransition(entry, status);
  const updated = await entryRepo.update(entry._id, tenantFromEntry(entry), { status, processedBy: user._id, ...fields });
  const queue = await getQueue(entry.queueId, user, entry);
  await recalculate(entry.queueId, queue);
  await audit.record(`queueEntry.${status}`, { actor: user._id, target: entry._id, metadata: { queueId: entry.queueId, requestId: req.id }, req });
  const eventMap = { called: socket.EVENTS.CUSTOMER_CALLED, recalled: socket.EVENTS.CUSTOMER_RECALLED, skipped: socket.EVENTS.CUSTOMER_SKIPPED, in_service: socket.EVENTS.SERVICE_STARTED, completed: socket.EVENTS.SERVICE_COMPLETED, no_show: socket.EVENTS.NO_SHOW };
  socket.broadcast(eventMap[status] || socket.EVENTS.LIVE_QUEUE_UPDATE, updated.toObject ? updated.toObject() : updated);
  return updated;
};

exports.recalculate = recalculate;
exports.callNext = async (queueId, data, user, req) => { requireProcessor(user); const queue = await getQueue(queueId, user, data); if (!queue.isActive || queue.status !== 'active') throw new ConflictError('Queue must be active to call customers'); const entry = await entryRepo.findNextWaiting(queueId); if (!entry) throw new NotFoundError('No waiting customers in queue'); return transitionEntry(entry, 'called', user, req, { calledAt: new Date(), counterId: data.counterId || queue.counterId }); };
exports.recall = async (id, data, user, req) => { requireProcessor(user); const entry = await getEntry(id, user); const status = entry.status === 'called' || entry.status === 'recalled' ? 'recalled' : 'called'; return transitionEntry(entry, status, user, req, { recalledAt: new Date(), counterId: data.counterId || entry.counterId }); };
exports.skip = async (id, user, req) => { requireProcessor(user); return transitionEntry(await getEntry(id, user), 'skipped', user, req, { skippedAt: new Date(), position: 0, estimatedWaitMinutes: 0 }); };
exports.startService = async (id, data, user, req) => { requireProcessor(user); return transitionEntry(await getEntry(id, user), 'in_service', user, req, { serviceStartedAt: new Date(), counterId: data.counterId }); };
exports.completeService = async (id, user, req) => { requireProcessor(user); return transitionEntry(await getEntry(id, user), 'completed', user, req, { serviceCompletedAt: new Date() }); };
exports.noShow = async (id, user, req) => { requireProcessor(user); return transitionEntry(await getEntry(id, user), 'no_show', user, req, { noShowAt: new Date() }); };
exports.expire = async (id, user, req) => { requireProcessor(user); return transitionEntry(await getEntry(id, user), 'expired', user, req, { expiredAt: new Date() }); };
