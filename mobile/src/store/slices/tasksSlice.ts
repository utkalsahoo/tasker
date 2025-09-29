import { createEntityAdapter, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task } from '@types/task';
import { tasksApi } from '@features/tasks/tasksApi';
import { RootState } from '..';

const adapter = createEntityAdapter<Task>({
  selectId: (task) => task.id,
  sortComparer: (a, b) => b.updatedAt.localeCompare(a.updatedAt),
});

const slice = createSlice({
  name: 'tasks',
  initialState: adapter.getInitialState({ lastSyncAt: 0 }),
  reducers: {
    upsertTask: adapter.upsertOne,
    upsertMany: adapter.upsertMany,
    removeTask: adapter.removeOne,
    markSynced: (state) => {
      state.lastSyncAt = Date.now();
    },
    optimisticUpdate: adapter.upsertOne,
    revertTask: adapter.upsertOne,
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(tasksApi.endpoints.fetchTasks.matchFulfilled, (state, action) => {
        adapter.upsertMany(state, action.payload.items);
        state.lastSyncAt = Date.now();
      })
      .addMatcher(tasksApi.endpoints.createTask.matchFulfilled, adapter.upsertOne)
      .addMatcher(tasksApi.endpoints.updateTask.matchFulfilled, adapter.upsertOne)
      .addMatcher(tasksApi.endpoints.deleteTask.matchFulfilled, (state, action) => {
        adapter.removeOne(state, action.meta.arg.originalArgs);
      });
  },
});

export const tasksReducer = slice.reducer;
export const tasksActions = slice.actions;

const selectors = adapter.getSelectors<RootState>((state) => state.tasks);

export const selectTaskById = (id: string) =>
  createSelector(selectors.selectEntities, (entities) => entities[id]);

export const selectTodayTasks = createSelector(selectors.selectAll, (tasks) => {
  return tasks.filter((task) => task.dueAt);
});

export const selectPendingTasks = createSelector(selectors.selectAll, (tasks) =>
  tasks.filter((task) => task.status === 'PENDING'),
);
