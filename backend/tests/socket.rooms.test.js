const { roomsForUser, roomsForResource, canJoinRoom } = require('../src/socket/rooms');
const presence = require('../src/socket/presence');

describe('socket room management', () => {
  test('creates tenant and identity rooms for users', () => {
    expect(roomsForUser({ _id: 'u1', organizationId: 'org1', branchId: 'b1', venueId: 'v1', roleNames: ['customer'] })).toEqual(expect.arrayContaining(['user:u1', 'organization:org1', 'branch:b1', 'venue:v1', 'customer:u1']));
  });
  test('creates resource rooms for broadcasts', () => {
    expect(roomsForResource({ _id: 'q1', organizationId: 'org1', branchId: 'b1', venueId: 'v1', counterId: 'c1', customerId: 'cu1' })).toEqual(expect.arrayContaining(['organization:org1', 'branch:b1', 'venue:v1', 'queue:q1', 'counter:c1', 'customer:cu1', 'admin']));
  });
  test('authorizes room joins by role and tenant', () => {
    expect(canJoinRoom({ _id: 'u1', organizationId: 'org1', roleNames: ['customer'] }, 'organization:org1')).toBe(true);
    expect(canJoinRoom({ _id: 'u1', organizationId: 'org1', roleNames: ['customer'] }, 'organization:org2')).toBe(false);
    expect(canJoinRoom({ _id: 'a1', roleNames: ['super_admin'] }, 'queue:q1')).toBe(true);
  });
});

describe('socket presence', () => {
  beforeEach(() => Object.values(presence._state).forEach((map) => map.clear()));
  test('tracks and removes connected clients', () => {
    const socket = { id: 's1', data: { user: { _id: 'u1', roleNames: ['counter_operator'] }, counterId: 'c1' } };
    presence.connected(socket);
    expect(presence.snapshot()).toEqual({ connectedCustomers: 0, connectedEmployees: 1, connectedAdmins: 0, activeCounters: 1 });
    presence.disconnected(socket);
    expect(presence.snapshot()).toEqual({ connectedCustomers: 0, connectedEmployees: 0, connectedAdmins: 0, activeCounters: 0 });
  });
});
