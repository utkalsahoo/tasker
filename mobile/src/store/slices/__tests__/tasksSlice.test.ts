import { tasksActions, tasksReducer } from '../tasksSlice';
import { Task } from '@types/task';

const baseTask: Task = {
  id: '1',
  title: 'Test',
  priority: 'MEDIUM',
  status: 'PENDING',
  repeat: 'NONE',
  alarm: false,
  tags: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('tasksSlice', () => {
  it('upserts tasks', () => {
    const state = tasksReducer(undefined, tasksActions.upsertTask(baseTask));
    expect(state.entities['1']).toBeDefined();
  });

  it('removes tasks', () => {
    const state = tasksReducer(undefined, tasksActions.upsertTask(baseTask));
    const next = tasksReducer(state, tasksActions.removeTask('1'));
    expect(next.entities['1']).toBeUndefined();
  });
});
