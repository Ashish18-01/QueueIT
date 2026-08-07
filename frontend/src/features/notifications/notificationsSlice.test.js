import { describe, expect, it } from 'vitest';
import reducer, { notificationReceived, markAllNotificationsRead } from './notificationsSlice.js';

describe('notificationsSlice', () => {
  it('adds live notifications and unread count', () => {
    const state = reducer(undefined, notificationReceived({ id: 'n1', type: 'queue.paused', title: 'Paused', message: 'Queue paused' }));
    expect(state.items).toHaveLength(1);
    expect(state.unreadCount).toBe(1);
  });
  it('marks all notifications read after successful action', () => {
    const state = reducer({ items: [{ id: 'n1', read: false }], unreadCount: 1, preferences: {}, pagination: {}, filters: {} }, { type: markAllNotificationsRead.fulfilled.type });
    expect(state.items[0].read).toBe(true);
    expect(state.unreadCount).toBe(0);
  });
});
