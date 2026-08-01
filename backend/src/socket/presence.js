const state = { customers: new Map(), employees: new Map(), admins: new Map(), counters: new Map() };
const hasRole = (user, roles) => (user.roleNames || []).some((r) => roles.includes(r));
const key = (user) => String(user._id || user.id);
const add = (map, id, socketId, data = {}) => map.set(id, { ...(map.get(id) || {}), ...data, socketIds: new Set([...(map.get(id)?.socketIds || []), socketId]) });
const remove = (map, id, socketId) => { const item = map.get(id); if (!item) return; item.socketIds.delete(socketId); if (!item.socketIds.size) map.delete(id); };
exports.connected = (socket) => { const { user } = socket.data; const id = key(user); if (hasRole(user, ['admin', 'super_admin'])) add(state.admins, id, socket.id); else if (hasRole(user, ['counter_operator', 'venue_manager', 'organization_admin', 'employee'])) add(state.employees, id, socket.id); else add(state.customers, id, socket.id); if (socket.data.counterId) add(state.counters, String(socket.data.counterId), socket.id, { userId: id }); };
exports.disconnected = (socket) => { const { user } = socket.data; const id = key(user); [state.admins, state.employees, state.customers].forEach((m) => remove(m, id, socket.id)); if (socket.data.counterId) remove(state.counters, String(socket.data.counterId), socket.id); };
exports.snapshot = () => ({ connectedCustomers: state.customers.size, connectedEmployees: state.employees.size, connectedAdmins: state.admins.size, activeCounters: state.counters.size });
exports._state = state;
