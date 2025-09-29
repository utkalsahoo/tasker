import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { persistReducer, persistStore } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';
import { tasksReducer } from './slices/tasksSlice';
import { authReducer } from './slices/authSlice';
import { offlineQueueReducer } from './slices/offlineQueueSlice';
import { networkReducer } from './slices/networkSlice';
import { api } from '@features/tasks/tasksApi';
import { tasksListener } from './listeners';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'tasks', 'offlineQueue'],
};

const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  auth: authReducer,
  tasks: tasksReducer,
  offlineQueue: offlineQueueReducer,
  network: networkReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false })
      .prepend(tasksListener.middleware)
      .concat(api.middleware),
});

setupListeners(store.dispatch);

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
