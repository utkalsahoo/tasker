import React from 'react';
import { ScrollView } from 'react-native';
import { Button, List, Switch, Text } from 'react-native-paper';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@store/index';
import { networkActions } from '@store/slices/networkSlice';

export const SettingsScreen = () => {
  const isOnline = useSelector((state: RootState) => state.network.isOnline);
  const dispatch = useDispatch();

  const requestExactAlarm = async () => {
    await notifee.requestPermission({
      android: {
        allowAlarms: true,
      },
    });
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <List.Section>
        <List.Subheader>Notifications</List.Subheader>
        <List.Item
          title="Push registration"
          description="Request FCM token"
          right={() => (
            <Button onPress={() => messaging().getToken()}>Register</Button>
          )}
        />
        <List.Item
          title="Exact alarm permission"
          description="Request Android exact alarm capability"
          right={() => (
            <Button onPress={requestExactAlarm}>Request</Button>
          )}
        />
      </List.Section>
      <List.Section>
        <List.Subheader>Network</List.Subheader>
        <List.Item
          title="Simulate offline"
          right={() => <Switch value={!isOnline} onValueChange={(value) => dispatch(networkActions.setOnline(!value))} />}
        />
      </List.Section>
      <List.Section>
        <List.Subheader>Account</List.Subheader>
        <Text>Integrate with backend auth endpoints for full login/logout flows.</Text>
      </List.Section>
    </ScrollView>
  );
};
