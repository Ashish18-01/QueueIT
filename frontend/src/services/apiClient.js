import axios from 'axios';
import toast from 'react-hot-toast';
import { clearStoredAuth, getStoredAuth, setStoredAuth } from './tokenStorage.js';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
export const apiClient = axios.create({ baseURL: API_BASE_URL, withCredentials: true, headers: { 'Content-Type': 'application/json' } });
let refreshPromise;
apiClient.interceptors.request.use((config)=>{ const { accessToken } = getStoredAuth(); if(accessToken) config.headers.Authorization = `Bearer ${accessToken}`; return config; });
apiClient.interceptors.response.use((r)=>r, async (error)=>{
  const original = error.config || {};
  if(error.response?.status === 401 && !original._retry && !original.url?.includes('/auth/refresh')){
    original._retry = true;
    const { refreshToken } = getStoredAuth();
    refreshPromise ||= apiClient.post('/auth/refresh', { refreshToken }).finally(()=>{refreshPromise=null;});
    try{ const { data } = await refreshPromise; setStoredAuth(data.data); original.headers = original.headers || {}; original.headers.Authorization = `Bearer ${data.data.accessToken}`; return apiClient(original); }
    catch(e){ clearStoredAuth(); window.dispatchEvent(new Event('queueit:logout')); }
  }
  const message = error.response?.data?.message || error.message || 'Something went wrong';
  if(!original.silent) toast.error(message);
  return Promise.reject(error);
});
