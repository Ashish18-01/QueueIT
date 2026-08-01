const { Queue } = require('../models');
const allowedSort = new Set(['createdAt', 'updatedAt', 'name', 'status', 'maximumCapacity']);
const baseFilter = (tenant = {}) => ({ deletedAt: null, ...(tenant.organizationId && { organizationId: tenant.organizationId }), ...(tenant.branchId && { branchId: tenant.branchId }), ...(tenant.venueId && { venueId: tenant.venueId }) });
const buildListFilter = (query = {}, tenant = {}) => {
  const filter = baseFilter(tenant);
  ['status', 'visibility', 'category', 'venueId', 'branchId', 'organizationId'].forEach((key) => { if (query[key]) filter[key] = query[key]; });
  if (query.includeArchived !== 'true') filter.status = filter.status || { $ne: 'archived' };
  if (query.search) filter.$text = { $search: query.search };
  return filter;
};
const paginate = async (query, options = {}) => {
  const page = Math.max(Number(options.page) || 1, 1);
  const limit = Math.min(Math.max(Number(options.limit) || 25, 1), 100);
  const sortField = allowedSort.has(options.sortBy) ? options.sortBy : 'createdAt';
  const direction = options.sortOrder === 'asc' ? 1 : -1;
  const [items, total] = await Promise.all([query.clone().sort({ [sortField]: direction }).skip((page - 1) * limit).limit(limit), query.model.countDocuments(query.getFilter())]);
  return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 } };
};
exports.create = (data) => Queue.create(data);
exports.findById = (id, tenant = {}, includeDeleted = false) => Queue.findOne({ _id: id, ...(includeDeleted ? {} : { deletedAt: null }), ...(tenant.organizationId && { organizationId: tenant.organizationId }) });
exports.findAll = (params = {}, tenant = {}) => paginate(Queue.find(buildListFilter(params, tenant)), params);
exports.update = (id, tenant, data) => Queue.findOneAndUpdate({ _id: id, ...baseFilter(tenant) }, data, { new: true, runValidators: true });
exports.archive = (id, tenant, actor) => exports.update(id, tenant, { status: 'archived', isActive: false, archivedAt: new Date(), archivedBy: actor });
exports.restore = (id, tenant, actor) => exports.update(id, tenant, { status: 'closed', isActive: false, archivedAt: null, archivedBy: null, updatedBy: actor });
exports.softDelete = (id, tenant, actor) => Queue.findOneAndUpdate({ _id: id, ...baseFilter(tenant) }, { deletedAt: new Date(), deletedBy: actor, isActive: false }, { new: true });
exports.findDuplicateName = (venueId, name, excludeId) => Queue.findOne({ venueId, name: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'), deletedAt: null, ...(excludeId && { _id: { $ne: excludeId } }) });
exports.search = (params, tenant) => exports.findAll(params, tenant);
