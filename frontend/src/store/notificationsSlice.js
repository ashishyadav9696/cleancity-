import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationsAPI } from '../api/axios';

export const fetchNotifications = createAsyncThunk('notifications/fetch', async (_, { rejectWithValue }) => {
  try { const { data } = await notificationsAPI.getAll({ limit: 20 }); return data; }
  catch (e) { return rejectWithValue(e.response?.data?.message); }
});

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: { list: [], unreadCount: 0, loading: false },
  reducers: {
    addNotification: (state, { payload }) => { state.list.unshift(payload); state.unreadCount += 1; },
    markOneRead: (state, { payload: id }) => {
      const n = state.list.find(n => n._id === id);
      if (n && !n.isRead) { n.isRead = true; state.unreadCount = Math.max(0, state.unreadCount - 1); }
    },
    markAllAsRead: (state) => { state.list.forEach(n => { n.isRead = true; }); state.unreadCount = 0; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (s) => { s.loading = true; })
      .addCase(fetchNotifications.fulfilled, (s, { payload }) => {
        s.loading = false; s.list = payload.data; s.unreadCount = payload.meta?.unreadCount || 0;
      })
      .addCase(fetchNotifications.rejected, (s) => { s.loading = false; });
  },
});

export const { addNotification, markOneRead, markAllAsRead } = notificationsSlice.actions;
export default notificationsSlice.reducer;
