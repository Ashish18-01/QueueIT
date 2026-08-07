import { apiClient } from '../../services/apiClient.js';

const unwrap = (request) => request.then(({ data }) => ({ data: data.data, meta: data.meta }));
export const notificationApi = {
  list: (params) => unwrap(apiClient.get('/notifications', { params, silent: true })),
  preferences: () => unwrap(apiClient.get('/notifications/preferences', { silent: true })),
  updatePreferences: (payload) => unwrap(apiClient.put('/notifications/preferences', payload)),
  markRead: (id) => unwrap(apiClient.patch(`/notifications/${id}/read`, {})),
  markAllRead: () => unwrap(apiClient.patch('/notifications/read-all', {})),
  remove: (id) => unwrap(apiClient.delete(`/notifications/${id}`)),
  clear: () => unwrap(apiClient.delete('/notifications/clear')),
};
