import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import { tasksActions } from './slices/tasksSlice';
import { saveTask } from '@db/tasksDb';

export const tasksListener = createListenerMiddleware();

tasksListener.startListening({
  matcher: isAnyOf(tasksActions.upsertTask, tasksActions.optimisticUpdate),
  effect: async (action) => {
    await saveTask(action.payload);
  },
});

tasksListener.startListening({
  actionCreator: tasksActions.upsertMany,
  effect: async (action) => {
    await Promise.all(action.payload.map((task) => saveTask(task)));
  },
});
