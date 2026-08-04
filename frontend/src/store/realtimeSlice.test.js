import { describe, expect, it } from 'vitest';
import reducer, { receiveSocketEvent, socketConnected, socketDisconnected, markNotificationsRead } from './realtimeSlice.js';

describe('realtimeSlice', () => {
  it('stores live queue updates and connection status', () => {
    let state = reducer(undefined, socketConnected());
    state = reducer(state, receiveSocketEvent({ eventName: 'queue:live-update', payload: { queueId: 'q1', queueLength: 4, queueStatus: 'active', currentServingToken: 'A10' } }));
    expect(state.connected).toBe(true);
    expect(state.queues.q1.statistics.currentQueueLength).toBe(4);
    expect(state.queues.q1.currentServingToken).toBe('A10');
    state = reducer(state, socketDisconnected('transport close'));
    expect(state.reconnecting).toBe(true);
  });

  it('creates and clears in-app notification badges for queue events', () => {
    let state = reducer(undefined, receiveSocketEvent({ eventName: 'queue-processing:customer-called', payload: { _id: 'e1', queueId: 'q1', token: 'A11', status: 'called' } }));
    expect(state.entries.e1.status).toBe('called');
    expect(state.unreadCount).toBe(1);
    expect(state.notifications[0].title).toBe('Token Called');
    state = reducer(state, markNotificationsRead());
    expect(state.unreadCount).toBe(0);
  });
});
