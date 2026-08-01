import { apiClient } from '../../services/apiClient.js';
export const authApi = {
  login: (payload)=>apiClient.post('/auth/login', payload),
  register: (payload)=>apiClient.post('/auth/register', payload),
  refresh: (refreshToken)=>apiClient.post('/auth/refresh', { refreshToken }, { silent:true }),
  logout: (refreshToken)=>apiClient.post('/auth/logout', { refreshToken }),
  forgotPassword: (email)=>apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (payload)=>apiClient.post('/auth/reset-password', payload),
};
