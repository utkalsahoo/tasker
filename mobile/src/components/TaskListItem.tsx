import React from 'react';
import { View } from 'react-native';
import { Button, Card, Chip, IconButton, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Task } from '@types/task';
import { DEFAULT_TIMEZONE, formatForList, toUtc } from '@utils/date';
import { useDispatch } from 'react-redux';
import { offlineQueueActions } from '@store/slices/offlineQueueSlice';
import { tasksActions } from '@store/slices/tasksSlice';
import { v4 as uuid } from 'uuid';
import { useCompleteTaskMutation, useSnoozeTaskMutation } from '@features/tasks/tasksApi';
import { saveTask } from '@db/tasksDb';
import { cancelReminder, scheduleLocalReminder } from '@services/notificationService';
import dayjs from 'dayjs';

interface Props {
  task: Task;
}

export const TaskListItem = ({ task }: Props) => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const [completeTask] = useCompleteTaskMutation();
  const [snoozeTask] = useSnoozeTaskMutation();

  const enqueueOrRun = async (type: 'COMPLETE' | 'SNOOZE', payload: Record<string, any>) => {
    try {
      if (type === 'COMPLETE') {
        const updated = await completeTask(task.id).unwrap();
        await saveTask(updated);
        await cancelReminder(task.id);
      } else {
        const updated = await snoozeTask({ id: task.id, minutes: payload.minutes }).unwrap();
        await saveTask(updated);
        await scheduleLocalReminder(updated);
      }
    } catch (error) {
      dispatch(
        offlineQueueActions.enqueueMutation({
          id: uuid(),
          type,
          payload,
          createdAt: Date.now(),
        }),
      );
      if (type === 'COMPLETE') {
        dispatch(tasksActions.upsertTask({ ...task, status: 'COMPLETED', updatedAt: new Date().toISOString() }));
      } else {
        const snoozedAt = toUtc(new Date(Date.now() + payload.minutes * 60 * 1000));
        dispatch(tasksActions.upsertTask({ ...task, remindAt: snoozedAt, updatedAt: new Date().toISOString() }));
        await scheduleLocalReminder({ ...task, remindAt: snoozedAt } as Task);
      }
    }
  };

  return (
    <Card style={{ marginBottom: 12 }}>
      <Card.Title title={task.title} subtitle={formatForList(task.dueAt)} />
      <Card.Content>
        {task.description ? <Text>{task.description}</Text> : null}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
          {task.tags.map((tag) => (
            <Chip key={tag} style={{ marginRight: 4, marginBottom: 4 }}>
              {tag}
            </Chip>
          ))}
        </View>
      </Card.Content>
      <Card.Actions>
        <Button onPress={() => enqueueOrRun('COMPLETE', { id: task.id })}>Complete</Button>
        <Button onPress={() => enqueueOrRun('SNOOZE', { id: task.id, minutes: 10 })}>Snooze 10m</Button>
        <IconButton icon="clock" onPress={() => enqueueOrRun('SNOOZE', { id: task.id, minutes: 30 })} />
        <IconButton
          icon="calendar"
          onPress={() => {
            const tomorrowNine = dayjs().tz(DEFAULT_TIMEZONE).add(1, 'day').hour(9).minute(0).second(0);
            const diffMinutes = Math.max(10, Math.round((tomorrowNine.valueOf() - Date.now()) / 60000));
            enqueueOrRun('SNOOZE', { id: task.id, minutes: diffMinutes });
          }}
        />
        <Button onPress={() => navigation.navigate('TaskEditor', { taskId: task.id })}>Edit</Button>
        <Button onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}>Open</Button>
      </Card.Actions>
    </Card>
  );
};
