import React from 'react';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { ScrollView, View } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { selectTaskById } from '@store/slices/tasksSlice';
import { RootState } from '@store/index';
import { formatForList } from '@utils/date';

export const TaskDetailScreen = () => {
  const route = useRoute<RouteProp<{ params: { taskId: string } }, 'params'>>();
  const selector = React.useMemo(() => selectTaskById(route.params.taskId), [route.params.taskId]);
  const task = useSelector((state: RootState) => selector(state));

  if (!task) {
    return <Text style={{ margin: 24 }}>Task not found</Text>;
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text variant="titleLarge">{task.title}</Text>
      <Text variant="bodyMedium" style={{ marginTop: 8 }}>
        {task.description}
      </Text>
      <View style={{ marginTop: 16 }}>
        <Text>Priority: {task.priority}</Text>
        <Text>Status: {task.status}</Text>
        <Text>Due: {formatForList(task.dueAt)}</Text>
        <Text>Reminder: {formatForList(task.remindAt)}</Text>
        <Text>Repeat: {task.repeat}</Text>
        <Text>Alarm: {task.alarm ? 'Yes' : 'No'}</Text>
      </View>
      <View style={{ marginTop: 16, flexDirection: 'row', flexWrap: 'wrap' }}>
        {task.tags.map((tag) => (
          <Text key={tag} style={{ marginRight: 8 }}>
            #{tag}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
};
