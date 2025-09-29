import React, { useState, useMemo } from 'react';
import { View, ScrollView } from 'react-native';
import { TextInput, Button, Switch, HelperText, SegmentedButtons } from 'react-native-paper';
import dayjs from 'dayjs';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuid } from 'uuid';
import { RootState } from '@store/index';
import { selectTaskById, tasksActions } from '@store/slices/tasksSlice';
import { useCreateTaskMutation, useUpdateTaskMutation } from '@features/tasks/tasksApi';
import { offlineQueueActions } from '@store/slices/offlineQueueSlice';
import { toUtc } from '@utils/date';
import { saveTask } from '@db/tasksDb';
import { scheduleLocalReminder } from '@services/notificationService';

const priorities = ['LOW', 'MEDIUM', 'HIGH'] as const;

export const TaskEditorScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<{ params: { taskId?: string } }, 'params'>>();
  const existingTaskSelector = useMemo(() => (route.params?.taskId ? selectTaskById(route.params.taskId) : undefined), [
    route.params?.taskId,
  ]);
  const existingTask = useSelector((state: RootState) => (existingTaskSelector ? existingTaskSelector(state) : undefined));
  const dispatch = useDispatch();
  const [createTask] = useCreateTaskMutation();
  const [updateTask] = useUpdateTaskMutation();

  const [title, setTitle] = useState(existingTask?.title ?? '');
  const [description, setDescription] = useState(existingTask?.description ?? '');
  const [priority, setPriority] = useState(existingTask?.priority ?? 'MEDIUM');
  const [dueAt, setDueAt] = useState(existingTask?.dueAt ? dayjs(existingTask.dueAt).format('YYYY-MM-DDTHH:mm') : '');
  const [remindAt, setRemindAt] = useState(
    existingTask?.remindAt ? dayjs(existingTask.remindAt).format('YYYY-MM-DDTHH:mm') : '',
  );
  const [alarm, setAlarm] = useState(existingTask?.alarm ?? false);
  const [tags, setTags] = useState(existingTask?.tags.join(',') ?? '');

  const handleSubmit = async () => {
    const payload = {
      title,
      description,
      priority,
      dueAt: toUtc(dueAt),
      remindAt: toUtc(remindAt),
      alarm,
      tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      repeat: existingTask?.repeat ?? 'NONE',
      status: existingTask?.status ?? 'PENDING',
      repeatCron: existingTask?.repeatCron ?? null,
    };

    if (!title) {
      return;
    }

    try {
      if (existingTask) {
        const updated = await updateTask({ id: existingTask.id, ...payload }).unwrap();
        await saveTask(updated);
      } else {
        const created = await createTask(payload).unwrap();
        await saveTask(created);
      }
      navigation.goBack();
    } catch (error) {
      const mutationId = uuid();
      const optimisticId = existingTask?.id ?? `optimistic-${mutationId}`;
      dispatch(
        offlineQueueActions.enqueueMutation({
          id: mutationId,
          type: existingTask ? 'UPDATE' : 'CREATE',
          payload: existingTask
            ? { id: existingTask.id, ...payload }
            : { ...payload, optimisticId },
          createdAt: Date.now(),
        }),
      );
      if (!existingTask) {
        dispatch(
          tasksActions.optimisticUpdate({
            id: optimisticId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            repeat: 'NONE',
            status: 'PENDING',
            ...payload,
          }),
        );
        await scheduleLocalReminder({
          id: optimisticId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          repeat: 'NONE',
          status: 'PENDING',
          alarm: payload.alarm,
          priority: payload.priority,
          tags: payload.tags,
          title: payload.title,
          description: payload.description,
          dueAt: payload.dueAt,
          remindAt: payload.remindAt,
          repeatCron: payload.repeatCron ?? null,
        } as any);
      }
      navigation.goBack();
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <TextInput label="Title" value={title} onChangeText={setTitle} />
      <HelperText type="error" visible={!title}>
        Title is required
      </HelperText>
      <TextInput label="Description" value={description} onChangeText={setDescription} multiline style={{ marginTop: 16 }} />
      <SegmentedButtons
        value={priority}
        onValueChange={(value) => setPriority(value as typeof priorities[number])}
        buttons={priorities.map((value) => ({ value, label: value }))}
        style={{ marginTop: 16 }}
      />
      <TextInput
        label="Due at"
        value={dueAt}
        onChangeText={setDueAt}
        placeholder="YYYY-MM-DDTHH:mm"
        style={{ marginTop: 16 }}
      />
      <TextInput
        label="Remind at"
        value={remindAt}
        onChangeText={setRemindAt}
        placeholder="YYYY-MM-DDTHH:mm"
        style={{ marginTop: 16 }}
      />
      <View style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center' }}>
        <Switch value={alarm} onValueChange={setAlarm} />
        <HelperText type="info" visible>
          Alarm notification
        </HelperText>
      </View>
      <TextInput
        label="Tags"
        value={tags}
        onChangeText={setTags}
        placeholder="comma,separated"
        style={{ marginTop: 16 }}
      />
      <Button mode="contained" onPress={handleSubmit} style={{ marginTop: 24 }}>
        Save
      </Button>
    </ScrollView>
  );
};
