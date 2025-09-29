import React, { useMemo } from 'react';
import { View, FlatList } from 'react-native';
import { useSelector } from 'react-redux';
import { Text, FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import { selectPendingTasks } from '@store/slices/tasksSlice';
import { RootState } from '@store/index';
import { TaskListItem } from '@components/TaskListItem';
import { useFetchTasksQuery } from '@features/tasks/tasksApi';

export const TodayScreen = () => {
  const navigation = useNavigation<any>();
  useFetchTasksQuery();
  const tasks = useSelector((state: RootState) => selectPendingTasks(state));
  const now = dayjs();

  const { overdue, dueThisHour, laterToday } = useMemo(() => {
    const overdueList = tasks.filter((task) => task.dueAt && dayjs(task.dueAt).isBefore(now));
    const thisHour = tasks.filter((task) =>
      task.dueAt ? dayjs(task.dueAt).isAfter(now) && dayjs(task.dueAt).isBefore(now.add(1, 'hour')) : false,
    );
    const later = tasks.filter((task) =>
      task.dueAt
        ? dayjs(task.dueAt).isSame(now, 'day') && dayjs(task.dueAt).isAfter(now.add(1, 'hour'))
        : false,
    );
    return { overdue: overdueList, dueThisHour: thisHour, laterToday: later };
  }, [tasks, now]);

  const renderSection = (title: string, data: typeof tasks) => (
    <View style={{ marginBottom: 24 }}>
      <Text variant="titleMedium" style={{ marginBottom: 8 }}>
        {title}
      </Text>
      <FlatList data={data} renderItem={({ item }) => <TaskListItem task={item} />} keyExtractor={(item) => item.id} />
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {renderSection('Overdue', overdue)}
      {renderSection('Due This Hour', dueThisHour)}
      {renderSection('Due Later Today', laterToday)}
      <FAB
        icon="plus"
        style={{ position: 'absolute', bottom: 16, right: 16 }}
        onPress={() => navigation.navigate('TaskEditor')}
      />
    </View>
  );
};
