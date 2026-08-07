import { configureStore } from '@reduxjs/toolkit';
import auth from '../features/auth/authSlice.js';
import theme from './themeSlice.js';
import realtime from './realtimeSlice.js';
import analytics from '../features/analytics/analyticsSlice.js';
import notifications from '../features/notifications/notificationsSlice.js';
export const store = configureStore({ reducer: { auth, theme, realtime, analytics, notifications } });
