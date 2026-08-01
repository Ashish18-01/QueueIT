jest.mock('../src/models', () => ({ User: { findById: jest.fn() } }));
jest.mock('../src/services/tokenService', () => ({ verifyAccessToken: jest.fn(() => ({ sub: 'u1' })) }));

describe('socket configuration', () => {
  test('exports event names used by real-time queues', () => {
    const socket = require('../src/socket');
    expect(socket.EVENTS.QUEUE_CREATED).toBe('queue:created');
    expect(socket.EVENTS.CUSTOMER_CALLED).toBe('queue-processing:customer-called');
    expect(socket.EVENTS.PRESENCE_UPDATED).toBe('presence:updated');
  });
});
