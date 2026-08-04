import { createSlice } from '@reduxjs/toolkit';

export const SOCKET_EVENTS = Object.freeze({
  QUEUE_CREATED: 'queue:created', QUEUE_UPDATED: 'queue:updated', QUEUE_DELETED: 'queue:deleted', QUEUE_PAUSED: 'queue:paused', QUEUE_RESUMED: 'queue:resumed', QUEUE_CLOSED: 'queue:closed',
  CUSTOMER_JOINED: 'queue-entry:customer-joined', CUSTOMER_LEFT: 'queue-entry:customer-left', CUSTOMER_CALLED: 'queue-processing:customer-called', CUSTOMER_RECALLED: 'queue-processing:customer-recalled', CUSTOMER_SKIPPED: 'queue-processing:customer-skipped', CUSTOMER_COMPLETED: 'queue-processing:service-completed', ENTRY_CANCELLED: 'queue-entry:cancelled', LIVE_QUEUE_UPDATE: 'queue:live-update', PRESENCE_UPDATED: 'presence:updated', ERROR: 'socket:error',
});

const idOf = (item = {}) => item._id || item.id || item.queueId;
const queueIdOf = (item = {}) => item.queueId || item.queue?._id || item.queue?.id || idOf(item);
const now = () => new Date().toISOString();
const initialState = { connected: false, reconnecting: false, error: '', lastEventAt: null, queues: {}, entries: {}, presence: { counters: [], employees: [], activeUsers: 0 }, notifications: [], unreadCount: 0, refreshing: false };

const upsertQueue = (state, payload = {}) => { const id = idOf(payload); if (!id) return; state.queues[id] = { ...(state.queues[id] || {}), ...payload, _id: id }; };
const upsertLive = (state, payload = {}) => { const id = queueIdOf(payload); if (!id) return; state.queues[id] = { ...(state.queues[id] || {}), _id: id, status: payload.queueStatus ?? state.queues[id]?.status, statistics: { ...(state.queues[id]?.statistics || {}), ...(payload.statistics || {}), currentQueueLength: payload.queueLength ?? payload.statistics?.currentQueueLength ?? state.queues[id]?.statistics?.currentQueueLength }, currentServingToken: payload.currentServingToken ?? state.queues[id]?.currentServingToken, waitingCount: payload.waitingCount ?? state.queues[id]?.waitingCount, updatedAt: now() }; };
const addNotification = (state, payload) => { state.notifications.unshift({ id: payload.id || `${payload.type}-${Date.now()}`, createdAt: now(), read: false, ...payload }); state.notifications = state.notifications.slice(0, 50); state.unreadCount += 1; };

const notificationFor = (eventName, payload = {}) => ({
  'queue-entry:customer-joined': ['Joined Queue', `Token ${payload.token || ''} joined the queue.`],
  'queue:paused': ['Queue Paused', `${payload.name || 'Queue'} is paused.`],
  'queue:resumed': ['Queue Resumed', `${payload.name || 'Queue'} is active again.`],
  'queue-processing:customer-called': ['Token Called', `Token ${payload.token || ''} has been called.`],
  'queue-processing:customer-recalled': ['Token Recalled', `Token ${payload.token || ''} has been recalled.`],
  'queue-entry:cancelled': ['Queue Cancelled', `Token ${payload.token || ''} was cancelled.`],
  'queue:closed': ['Queue Closed', `${payload.name || 'Queue'} is closed.`],
  'queue-processing:service-completed': ['Service Completed', `Token ${payload.token || ''} service completed.`],
}[eventName]);

const realtimeSlice = createSlice({ name: 'realtime', initialState, reducers: {
  socketConnected: (s) => { s.connected = true; s.reconnecting = false; s.error = ''; },
  socketDisconnected: (s, a) => { s.connected = false; s.reconnecting = true; s.error = a.payload || 'Real-time connection lost.'; },
  socketError: (s, a) => { s.error = a.payload || 'Real-time update failed.'; },
  receiveSocketEvent: (s, a) => { const { eventName, payload = {} } = a.payload; s.lastEventAt = now(); s.refreshing = true; if (eventName.startsWith('queue:live')) upsertLive(s, payload); else if (eventName.startsWith('queue:')) { if (eventName === SOCKET_EVENTS.QUEUE_DELETED) delete s.queues[idOf(payload)]; else upsertQueue(s, payload); } else if (eventName.startsWith('queue-entry:') || eventName.startsWith('queue-processing:')) { const id = idOf(payload); if (id) s.entries[id] = { ...(s.entries[id] || {}), ...payload, _id: id }; } const note = notificationFor(eventName, payload); if (note) addNotification(s, { type: eventName, title: note[0], message: note[1], queueId: queueIdOf(payload), entryId: idOf(payload) }); },
  presenceUpdated: (s, a) => { s.presence = a.payload || initialState.presence; },
  markNotificationsRead: (s) => { s.notifications.forEach((n) => { n.read = true; }); s.unreadCount = 0; },
  refreshSettled: (s) => { s.refreshing = false; },
} });
export const { socketConnected, socketDisconnected, socketError, receiveSocketEvent, presenceUpdated, markNotificationsRead, refreshSettled } = realtimeSlice.actions;
export default realtimeSlice.reducer;
