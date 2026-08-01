const room = (scope, id) => (id ? `${scope}:${String(id)}` : null);

const roomsForUser = (user = {}) => {
  const rooms = [room('user', user._id || user.id)];
  if (user.organizationId) rooms.push(room('organization', user.organizationId));
  if (user.branchId) rooms.push(room('branch', user.branchId));
  if (user.venueId) rooms.push(room('venue', user.venueId));
  const roles = user.roleNames || [];
  if (roles.includes('super_admin') || roles.includes('admin')) rooms.push('admin');
  if (roles.includes('customer') || roles.includes('user')) rooms.push(room('customer', user._id || user.id));
  if (roles.some((r) => ['counter_operator', 'venue_manager', 'organization_admin', 'employee'].includes(r))) rooms.push(room('employee', user._id || user.id));
  return rooms.filter(Boolean);
};

const roomsForResource = (resource = {}) => [
  room('organization', resource.organizationId),
  room('branch', resource.branchId),
  room('venue', resource.venueId),
  room('queue', resource.queueId || resource._id || resource.id),
  room('counter', resource.counterId),
  room('customer', resource.customerId),
  'admin',
].filter(Boolean);

const canJoinRoom = (user = {}, target = '') => {
  const [scope, id] = String(target).split(':');
  const roles = user.roleNames || [];
  if (target === 'admin') return roles.includes('admin') || roles.includes('super_admin');
  if (roles.includes('super_admin')) return true;
  if (scope === 'organization') return String(user.organizationId) === id || roles.includes('admin');
  if (scope === 'branch') return String(user.branchId) === id || roles.includes('organization_admin');
  if (scope === 'venue') return String(user.venueId) === id || roles.includes('venue_manager') || roles.includes('organization_admin');
  if (scope === 'customer' || scope === 'employee' || scope === 'user') return String(user._id || user.id) === id;
  if (scope === 'queue' || scope === 'counter') return roles.some((r) => ['counter_operator', 'venue_manager', 'organization_admin', 'admin'].includes(r));
  return false;
};

module.exports = { room, roomsForUser, roomsForResource, canJoinRoom };
