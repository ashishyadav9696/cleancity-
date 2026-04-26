import { configureStore } from '@reduxjs/toolkit';
import reportsReducer from './reportsSlice';
import notificationsReducer from './notificationsSlice';

export const store = configureStore({
  reducer: {
    reports: reportsReducer,
    notifications: notificationsReducer,
  },
});
