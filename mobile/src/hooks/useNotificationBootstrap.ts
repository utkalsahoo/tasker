import { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, AndroidCategory } from '@notifee/react-native';
import { AppState } from 'react-native';

const REMINDER_CHANNEL_ID = 'reminders';
const ALARM_CHANNEL_ID = 'alarms';

export const useNotificationBootstrap = () => {
  useEffect(() => {
    const setup = async () => {
      await messaging().requestPermission();
      await notifee.createChannel({
        id: REMINDER_CHANNEL_ID,
        name: 'Task reminders',
        importance: AndroidImportance.HIGH,
      });
      await notifee.createChannel({
        id: ALARM_CHANNEL_ID,
        name: 'Task alarms',
        sound: 'alarm',
        vibration: true,
        importance: AndroidImportance.HIGH,
        bypassDnd: true,
        category: AndroidCategory.ALARM,
      });
    };

    setup();

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        messaging().setAutoInitEnabled(true);
      }
    });

    return () => subscription.remove();
  }, []);
};
