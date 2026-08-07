import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { notificationApi } from './notificationApi.js';

const initialState = { items: [], unreadCount: 0, preferences: { queue: true, account: true, system: true, browser: false }, pagination: { page: 1, pages: 1, total: 0, limit: 20 }, filters: { search: '', type: '', status: '', from: '', to: '', sortBy: 'createdAt', sortOrder: 'desc' }, loading: false, error: '' };
export const fetchNotifications = createAsyncThunk('notifications/fetch', async (params) => notificationApi.list(params));
export const fetchPreferences = createAsyncThunk('notifications/preferences', async () => (await notificationApi.preferences()).data);
export const savePreferences = createAsyncThunk('notifications/savePreferences', async (payload) => (await notificationApi.updatePreferences(payload)).data);
export const markNotificationRead = createAsyncThunk('notifications/markRead', async (id) => { await notificationApi.markRead(id); return id; });
export const markAllNotificationsRead = createAsyncThunk('notifications/markAllRead', async () => { await notificationApi.markAllRead(); });
export const deleteNotification = createAsyncThunk('notifications/delete', async (id) => { await notificationApi.remove(id); return id; });
export const clearNotifications = createAsyncThunk('notifications/clear', async () => { await notificationApi.clear(); });

const slice = createSlice({ name: 'notifications', initialState, reducers: {
  notificationReceived: (s, a) => { const item = { read: false, createdAt: new Date().toISOString(), ...a.payload }; s.items = [item, ...s.items.filter((n) => n.id !== item.id)].slice(0, 100); s.unreadCount += item.read ? 0 : 1; },
  setNotificationFilters: (s, a) => { s.filters = { ...s.filters, ...a.payload }; },
}, extraReducers: (b) => b
  .addCase(fetchNotifications.pending, (s) => { s.loading = true; s.error = ''; })
  .addCase(fetchNotifications.fulfilled, (s, a) => { s.loading = false; s.items = a.payload.data; s.pagination = a.payload.meta?.pagination || s.pagination; s.unreadCount = a.payload.meta?.unreadCount ?? s.unreadCount; })
  .addCase(fetchNotifications.rejected, (s, a) => { s.loading = false; s.error = a.error.message; })
  .addCase(fetchPreferences.fulfilled, (s, a) => { s.preferences = a.payload; })
  .addCase(savePreferences.fulfilled, (s, a) => { s.preferences = a.payload; })
  .addCase(markNotificationRead.fulfilled, (s, a) => { const n = s.items.find((item) => item.id === a.payload || item._id === a.payload); if (n && !n.read) { n.read = true; n.readAt = new Date().toISOString(); s.unreadCount = Math.max(0, s.unreadCount - 1); } })
  .addCase(markAllNotificationsRead.fulfilled, (s) => { s.items.forEach((n) => { n.read = true; n.readAt ||= new Date().toISOString(); }); s.unreadCount = 0; })
  .addCase(deleteNotification.fulfilled, (s, a) => { const n = s.items.find((item) => item.id === a.payload || item._id === a.payload); s.items = s.items.filter((item) => item.id !== a.payload && item._id !== a.payload); if (n && !n.read) s.unreadCount = Math.max(0, s.unreadCount - 1); })
  .addCase(clearNotifications.fulfilled, (s) => { s.items = []; s.unreadCount = 0; }) });
export const { notificationReceived, setNotificationFilters } = slice.actions;
export default slice.reducer;
