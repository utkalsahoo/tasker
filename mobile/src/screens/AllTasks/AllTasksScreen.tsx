import React, { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { Checkbox, IconButton, List, Menu, SegmentedButtons, Text } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@store/index';
import { selectPendingTasks, tasksActions } from '@store/slices/tasksSlice';
import { useDeleteTaskMutation, useCompleteTaskMutation } from '@features/tasks/tasksApi';
import { offlineQueueActions } from '@store/slices/offlineQueueSlice';
import { v4 as uuid } from 'uuid';
import { Task } from '@types/task';
import { deleteTaskFromDb, saveTask } from '@db/tasksDb';
import { useFetchTasksQuery } from '@features/tasks/tasksApi';

export const AllTasksScreen = () => {
  const tasks = useSelector((state: RootState) => selectPendingTasks(state));
  useFetchTasksQuery();
  const dispatch = useDispatch();
  const [deleteTask] = useDeleteTaskMutation();
  const [completeTask] = useCompleteTaskMutation();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sort, setSort] = useState<'priority' | 'dueAt' | 'status'>('priority');

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      switch (sort) {
        case 'priority':
          return a.priority.localeCompare(b.priority);
        case 'dueAt':
          return (a.dueAt || '').localeCompare(b.dueAt || '');
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });
  }, [tasks, sort]);

  const toggleSelect = (id: string) => {
    setSelectedIds((current) => (current.includes(id) ? current.filter((value) => value !== id) : [...current, id]));
  };

  const runOrQueue = async (task: Task, mutation: 'DELETE' | 'COMPLETE') => {
    try {
      if (mutation === 'DELETE') {
        await deleteTask(task.id).unwrap();
        await deleteTaskFromDb(task.id);
        dispatch(tasksActions.removeTask(task.id));
      } else {
        const updated = await completeTask(task.id).unwrap();
        await saveTask(updated);
      }
    } catch (error) {
      dispatch(
        offlineQueueActions.enqueueMutation({
          id: uuid(),
          type: mutation,
          payload: { id: task.id },
          createdAt: Date.now(),
        }),
      );
    }
  };

  const bulkComplete = () =>
    selectedIds.forEach((id) => {
      const task = tasks.find((item) => item.id === id);
      if (task) {
        runOrQueue(task, 'COMPLETE');
      }
    });

  const bulkDelete = () =>
    selectedIds.forEach((id) => {
      const task = tasks.find((item) => item.id === id);
      if (task) {
        runOrQueue(task, 'DELETE');
      }
    });

  return (
    <View style={{ flex: 1 }}>
      <SegmentedButtons
        value={sort}
        onValueChange={(value) => setSort(value as typeof sort)}
        buttons={[
          { value: 'priority', label: 'Priority' },
          { value: 'dueAt', label: 'Due Date' },
          { value: 'status', label: 'Status' },
        ]}
        style={{ margin: 16 }}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 16 }}>
        <IconButton icon="check" disabled={!selectedIds.length} onPress={bulkComplete} />
        <IconButton icon="delete" disabled={!selectedIds.length} onPress={bulkDelete} />
      </View>
      <FlatList
        data={sortedTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <List.Item
            title={item.title}
            description={`${item.priority} • ${item.status}`}
            left={() => <Checkbox status={selectedIds.includes(item.id) ? 'checked' : 'unchecked'} onPress={() => toggleSelect(item.id)} />}
            right={() => (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <IconButton icon="check" onPress={() => runOrQueue(item, 'COMPLETE')} />
                <IconButton icon="delete" onPress={() => runOrQueue(item, 'DELETE')} />
              </View>
            )}
            onPress={() => toggleSelect(item.id)}
          />
        )}
        ListEmptyComponent={() => <Text style={{ textAlign: 'center', marginTop: 32 }}>No tasks found</Text>}
      />
    </View>
  );
};
