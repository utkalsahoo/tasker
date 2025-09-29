import React from 'react';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react-native';
import configureStore from 'redux-mock-store';
import { TaskListItem } from '../TaskListItem';
import { Task } from '@types/task';

const mockStore = configureStore([]);

const baseTask: Task = {
  id: '1',
  title: 'Test task',
  priority: 'MEDIUM',
  status: 'PENDING',
  repeat: 'NONE',
  alarm: false,
  tags: ['home'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('TaskListItem', () => {
  it('renders task title', () => {
    const store = mockStore({});
    const { getByText } = render(
      <Provider store={store}>
        <TaskListItem task={baseTask} />
      </Provider>,
    );
    expect(getByText('Test task')).toBeTruthy();
  });
});
