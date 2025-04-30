import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // Add other reducers as they are created
    // subjects: subjectReducer,
    // sessions: sessionReducer,
    // streaks: streakReducer,
    // achievements: achievementReducer,
    // dashboard: dashboardReducer,
    // theme: themeReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore non-serializable dates in specific actions and paths
        ignoredActions: ['sessions/addSession', 'sessions/updateSession'],
        ignoredPaths: ['sessions.currentSession.startTime', 'sessions.currentSession.endTime'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;