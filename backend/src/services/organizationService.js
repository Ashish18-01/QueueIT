const { Organization, User } = require('../models');
const { AuthorizationError, ConflictError, NotFoundError } = require('../errors');
const audit = require('./auditService');

const ADMIN_ROLE = 'organization_admin';
const canAdmin = (user) => (user?.roleNames || []).some((role) => [ADMIN_ROLE, 'admin', 'owner', 'super_admin'].includes(role));
const slugify = (value) => String(value || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
const ensureOrganizer = (user) => { if (!canAdmin(user)) throw new AuthorizationError('Only organization admins can manage organizations'); };
const tenant = (user) => (canAdmin(user) && !['admin', 'owner', 'super_admin'].some((r) => user.roleNames?.includes(r)) ? { adminIds: user._id } : {});

async function uniqueSlug(name) {
  const base = slugify(name) || 'organization';
  let slug = base;
  let suffix = 2;
  while (await Organization.findOne({ slug })) slug = `${base}-${suffix++}`;
  return slug;
}

exports.create = async (data, user, req) => {
  ensureOrganizer(user);
  if (user.organizationId && !(user.roleNames || []).some((r) => ['admin', 'owner', 'super_admin'].includes(r))) throw new ConflictError('Organizer already belongs to an organization');
  const organization = await Organization.create({ name: data.name, description: data.description, slug: await uniqueSlug(data.name), ownerId: user._id, adminIds: [user._id] });
  await User.updateOne({ _id: user._id }, { $set: { organizationId: organization._id }, $addToSet: { roleNames: ADMIN_ROLE } });
  await audit.record('organization.created', { actor: user._id, target: organization.id, req });
  return organization;
};

exports.listMine = (user) => { ensureOrganizer(user); return Organization.find(tenant(user)).sort('-createdAt'); };
exports.get = async (id, user) => { ensureOrganizer(user); const organization = await Organization.findOne({ _id: id, ...tenant(user) }); if (!organization) throw new NotFoundError('Organization not found'); return organization; };
exports.dashboard = async (id, user) => {
  const organization = await exports.get(id, user);
  const { Queue, QueueEntry } = require('../models');
  const queues = await Queue.find({ organizationId: organization._id, deletedAt: null }).sort('-createdAt');
  const entries = await QueueEntry.find({ organizationId: organization._id, deletedAt: null, status: { $in: ['waiting', 'called', 'recalled', 'in_service'] } }).sort({ position: 1, joinedAt: 1 });
  return { organization, queues, entries };
};
