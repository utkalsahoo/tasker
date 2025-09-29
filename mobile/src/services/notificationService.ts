import notifee, { TimestampTrigger, TriggerType } from '@notifee/react-native';
import { Task } from '@types/task';
import dayjs from 'dayjs';

const reminderCategory = 'task-reminder';

export const scheduleLocalReminder = async (task: Task) => {
  if (!task.remindAt) {
    return;
  }
  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: dayjs(task.remindAt).valueOf(),
    alarmManager: { allowWhileIdle: true },
  };

  await notifee.createTriggerNotification(
    {
      id: `task-${task.id}`,
      title: task.title,
      body: task.description ?? 'Task reminder',
      android: {
        channelId: task.alarm ? 'alarms' : 'reminders',
        actions: [
          {
            title: 'Complete',
            pressAction: { id: 'complete', launchActivity: 'default' },
          },
          {
            title: 'Snooze 10m',
            pressAction: { id: 'snooze-10', launchActivity: 'default' },
          },
        ],
        pressAction: { id: 'default' },
        category: task.alarm ? 'alarm' : reminderCategory,
      },
      ios: {
        categoryId: reminderCategory,
      },
      data: {
        taskId: task.id,
      },
    },
    trigger,
  );
};

export const cancelReminder = (taskId: string) => notifee.cancelNotification(`task-${taskId}`);
