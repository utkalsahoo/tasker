import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task } from '@types/task';

type OfflineMutationType = 'CREATE' | 'UPDATE' | 'DELETE' | 'COMPLETE' | 'SNOOZE';

export interface OfflineMutation {
  id: string;
  type: OfflineMutationType;
  payload: Record<string, any>;
  createdAt: number;
}

interface OfflineQueueState {
  mutations: OfflineMutation[];
}

const initialState: OfflineQueueState = { mutations: [] };

const slice = createSlice({
  name: 'offlineQueue',
  initialState,
  reducers: {
    enqueueMutation: (state, action: PayloadAction<OfflineMutation>) => {
      state.mutations.push(action.payload);
    },
    dequeueMutation: (state, action: PayloadAction<string>) => {
      state.mutations = state.mutations.filter((mutation) => mutation.id !== action.payload);
    },
    clearQueue: () => initialState,
  },
});

export const offlineQueueReducer = slice.reducer;
export const offlineQueueActions = slice.actions;
