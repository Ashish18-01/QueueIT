import { createSlice } from '@reduxjs/toolkit';

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: { cache: {}, updatedAt: null },
  reducers: {
    cacheAnalytics: (state, action) => { state.cache[action.payload.key] = action.payload.data; state.updatedAt = new Date().toISOString(); },
    clearAnalyticsCache: (state) => { state.cache = {}; state.updatedAt = null; },
  },
});

export const { cacheAnalytics, clearAnalyticsCache } = analyticsSlice.actions;
export default analyticsSlice.reducer;
