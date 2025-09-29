import React, { useState } from 'react';
import { FlatList, View } from 'react-native';
import { Button, Card, Dialog, Portal, TextInput, Text } from 'react-native-paper';
import dayjs from 'dayjs';
import {
  useFetchAlarmSetsQuery,
  useCreateAlarmSetMutation,
  useUpdateAlarmSetMutation,
  useDeleteAlarmSetMutation,
  useTriggerAlarmSetMutation,
} from '@features/tasks/tasksApi';
import { toUtc } from '@utils/date';

export const AlarmSetsScreen = () => {
  const { data: alarmSets } = useFetchAlarmSetsQuery();
  const [createAlarmSet] = useCreateAlarmSetMutation();
  const [updateAlarmSet] = useUpdateAlarmSetMutation();
  const [deleteAlarmSet] = useDeleteAlarmSetMutation();
  const [triggerAlarmSet] = useTriggerAlarmSetMutation();

  const [visible, setVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [name, setName] = useState('');
  const [time, setTime] = useState('07:00');

  const openDialog = (id?: string) => {
    setEditingId(id);
    if (id) {
      const alarmSet = alarmSets?.find((item) => item.id === id);
      if (alarmSet) {
        setName(alarmSet.name);
        setTime(dayjs(alarmSet.timeUtc).tz(alarmSet.timezone).format('HH:mm'));
      }
    } else {
      setName('');
      setTime('07:00');
    }
    setVisible(true);
  };

  const closeDialog = () => setVisible(false);

  const handleSave = async () => {
    const timeUtc = toUtc(dayjs().format(`YYYY-MM-DDT${time}`));
    if (editingId) {
      await updateAlarmSet({ id: editingId, name, timeUtc: timeUtc!, timezone: 'Asia/Kolkata' }).unwrap();
    } else {
      await createAlarmSet({ name, timeUtc: timeUtc!, timezone: 'Asia/Kolkata' }).unwrap();
    }
    closeDialog();
  };

  const handleDelete = async (id: string) => {
    await deleteAlarmSet(id).unwrap();
  };

  const handleTrigger = async (id: string) => {
    await triggerAlarmSet(id).unwrap();
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        contentContainerStyle={{ padding: 16 }}
        data={alarmSets ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 12 }}>
            <Card.Title title={item.name} subtitle={dayjs(item.timeUtc).tz(item.timezone).format('HH:mm')} />
            <Card.Actions>
              <Button onPress={() => openDialog(item.id)}>Edit</Button>
              <Button onPress={() => handleDelete(item.id)}>Delete</Button>
              <Button onPress={() => handleTrigger(item.id)}>Test Trigger</Button>
            </Card.Actions>
          </Card>
        )}
        ListEmptyComponent={() => <Text style={{ textAlign: 'center', marginTop: 32 }}>No alarm sets</Text>}
      />
      <Button mode="contained" style={{ margin: 16 }} onPress={() => openDialog()}>
        Add Alarm Set
      </Button>
      <Portal>
        <Dialog visible={visible} onDismiss={closeDialog}>
          <Dialog.Title>{editingId ? 'Edit' : 'Create'} Alarm Set</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Name" value={name} onChangeText={setName} style={{ marginBottom: 16 }} />
            <TextInput label="Time (HH:mm)" value={time} onChangeText={setTime} />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeDialog}>Cancel</Button>
            <Button onPress={handleSave}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};
