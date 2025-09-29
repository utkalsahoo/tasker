import React, { useMemo, useState } from 'react';
import { SectionList, View } from 'react-native';
import { Text, Searchbar, SegmentedButtons } from 'react-native-paper';
import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { RootState } from '@store/index';
import { selectPendingTasks } from '@store/slices/tasksSlice';
import { TaskListItem } from '@components/TaskListItem';
import { useFetchTasksQuery } from '@features/tasks/tasksApi';

export const ScheduledScreen = () => {
  const tasks = useSelector((state: RootState) => selectPendingTasks(state));
  useFetchTasksQuery();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const sections = useMemo(() => {
    const filtered = tasks.filter((task) => {
      if (!task.dueAt) {
        return false;
      }
      const matchesQuery = task.title.toLowerCase().includes(query.toLowerCase());
      const matchesFilter =
        filter === 'all' || task.priority.toLowerCase() === filter;
      return matchesQuery && matchesFilter;
    });

    const groups = filtered.reduce<Record<string, typeof filtered>>( (acc, task) => {
      const key = dayjs(task.dueAt).format('YYYY-MM-DD');
      acc[key] = acc[key] ? [...acc[key], task] : [task];
      return acc;
    }, {});

    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, tasksForDate]) => ({
        title: dayjs(date).format('DD MMM YYYY'),
        data: tasksForDate.sort((a, b) => a.dueAt!.localeCompare(b.dueAt!)),
      }));
  }, [tasks, query, filter]);

  return (
    <View style={{ flex: 1 }}>
      <Searchbar value={query} onChangeText={setQuery} placeholder="Search tasks" style={{ margin: 16 }} />
      <SegmentedButtons
        value={filter}
        onValueChange={(value) => setFilter(value as typeof filter)}
        buttons={[
          { value: 'all', label: 'All' },
          { value: 'high', label: 'High' },
          { value: 'medium', label: 'Medium' },
          { value: 'low', label: 'Low' },
        ]}
        style={{ marginHorizontal: 16, marginBottom: 8 }}
      />
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TaskListItem task={item} />}
        renderSectionHeader={({ section }) => (
          <Text variant="titleMedium" style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
            {section.title}
          </Text>
        )}
        ListEmptyComponent={() => (
          <Text style={{ textAlign: 'center', marginTop: 32 }}>No scheduled tasks</Text>
        )}
      />
    </View>
  );
};
