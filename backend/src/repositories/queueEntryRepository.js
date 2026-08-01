const { QueueEntry } = require('../models');
const { ACTIVE_QUEUE_ENTRY_STATUSES } = require('../constants/queueConstants');

const allowedSort = new Set(['joinedAt', 'createdAt', 'tokenNumber', 'status']);
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const baseFilter = (tenant = {}) => ({ deletedAt: null, ...(tenant.organizationId && { organizationId: tenant.organizationId }), ...(tenant.branchId && { branchId: tenant.branchId }), ...(tenant.venueId && { venueId: tenant.venueId }), ...(tenant.queueId && { queueId: tenant.queueId }) });
const buildListFilter = (query = {}, tenant = {}) => ({ ...baseFilter(tenant), ...(query.status && { status: query.status }), ...(query.customerId && { customerId: query.customerId }), ...(query.queueId && { queueId: query.queueId }), ...(query.search && { token: new RegExp(escapeRegex(query.search), 'i') }) });
const paginate = async (query, options = {}) => {
  const page = Math.max(Number(options.page) || 1, 1);
  const limit = Math.min(Math.max(Number(options.limit) || 25, 1), 100);
  const sortField = allowedSort.has(options.sortBy) ? options.sortBy : 'joinedAt';
  const direction = options.sortOrder === 'desc' ? -1 : 1;
  const [items, total] = await Promise.all([query.clone().sort({ [sortField]: direction, tokenNumber: direction }).skip((page - 1) * limit).limit(limit), query.model.countDocuments(query.getFilter())]);
  return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } };
};
exports.create = (data) => QueueEntry.create(data);
exports.findById = (id, tenant = {}) => QueueEntry.findOne({ _id: id, ...baseFilter(tenant) });
exports.findAll = (params = {}, tenant = {}) => paginate(QueueEntry.find(buildListFilter(params, tenant)), params);
exports.countActive = (queueId) => QueueEntry.countDocuments({ queueId, status: { $in: ACTIVE_QUEUE_ENTRY_STATUSES }, deletedAt: null });
exports.countByStatus = (queueId, statuses) => QueueEntry.countDocuments({ queueId, status: { $in: statuses }, deletedAt: null });
exports.findNextWaiting = (queueId) => QueueEntry.findOne({ queueId, status: 'waiting', deletedAt: null }).sort({ position: 1, tokenNumber: 1, joinedAt: 1 });
exports.findActiveOrdered = (queueId) => QueueEntry.find({ queueId, status: { $in: ACTIVE_QUEUE_ENTRY_STATUSES }, deletedAt: null }).sort({ position: 1, tokenNumber: 1, joinedAt: 1 });
exports.averageCompletedWaitMs = async (queueId) => { const result = await QueueEntry.aggregate([{ $match: { queueId, status: 'completed', joinedAt: { $type: 'date' }, serviceStartedAt: { $type: 'date' }, deletedAt: null } }, { $project: { waitMs: { $subtract: ['$serviceStartedAt', '$joinedAt'] } } }, { $group: { _id: null, avg: { $avg: '$waitMs' } } }]); return result[0]?.avg || 0; };
exports.findActiveByCustomer = (queueId, customerId) => QueueEntry.findOne({ queueId, customerId, status: { $in: ACTIVE_QUEUE_ENTRY_STATUSES }, deletedAt: null });
exports.nextTokenNumber = async (queueId) => ((await QueueEntry.findOne({ queueId }).sort({ tokenNumber: -1 }).select('tokenNumber').lean())?.tokenNumber || 0) + 1;
exports.update = (id, tenant, data) => QueueEntry.findOneAndUpdate({ _id: id, ...baseFilter(tenant) }, data, { new: true, runValidators: true });
