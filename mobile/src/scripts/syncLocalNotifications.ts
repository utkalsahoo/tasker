import { store } from '@store/index';
import { selectPendingTasks } from '@store/slices/tasksSlice';
import { scheduleLocalReminder } from '@services/notificationService';

(async () => {
  const state = store.getState();
  const tasks = selectPendingTasks(state);
  for (const task of tasks) {
    await scheduleLocalReminder(task);
  }
})();
