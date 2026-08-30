import { apiClient } from './apiClient.js';

const unwrap = (response) => response.data;
export const businessApi = {
  listOrganizations: () => apiClient.get('/organizations').then(unwrap),
  getOrganizationDashboard: (id) => apiClient.get(`/organizations/${id}/dashboard`).then(unwrap),
  createOrganization: (payload) => apiClient.post('/organizations', payload).then(unwrap),
  listQueues: (params) => apiClient.get('/queues', { params }).then(unwrap),
  getQueue: (id) => apiClient.get(`/queues/${id}`).then(unwrap),
  createQueue: (payload) => apiClient.post('/queues', payload).then(unwrap),
  updateQueue: (id, payload) => apiClient.patch(`/queues/${id}`, payload).then(unwrap),
  transitionQueue: (id, action) => apiClient.post(`/queues/${id}/${action}`).then(unwrap),
  joinQueue: (id, payload = {}) => apiClient.post(`/queues/${id}/join`, payload).then(unwrap),
  callNext: (id, payload = {}) => apiClient.post(`/queues/${id}/call-next`, payload).then(unwrap),
  listEntries: (params) => apiClient.get('/queue-entries', { params }).then(unwrap),
  getEntry: (id) => apiClient.get(`/queue-entries/${id}`).then(unwrap),
  leaveEntry: (id) => apiClient.post(`/queue-entries/${id}/leave`).then(unwrap),
  recallEntry: (id, payload = {}) => apiClient.post(`/queue-entries/${id}/recall`, payload).then(unwrap),
  skipEntry: (id) => apiClient.post(`/queue-entries/${id}/skip`).then(unwrap),
  completeEntry: (id) => apiClient.post(`/queue-entries/${id}/complete-service`).then(unwrap),
  askQueueAssistant: (question) => apiClient.post('/ai/assistant', { question }).then(unwrap),
  getAiInsights: () => apiClient.get('/ai/insights').then(unwrap),
  getAiMetrics: () => apiClient.get('/ai/metrics').then(unwrap),
};
