import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@store/index';
import { offlineQueueActions } from '@store/slices/offlineQueueSlice';
import { tasksActions } from '@store/slices/tasksSlice';
import {
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useCompleteTaskMutation,
  useSnoozeTaskMutation,
} from '@features/tasks/tasksApi';
import { saveTask, deleteTaskFromDb } from '@db/tasksDb';
import { cancelReminder, scheduleLocalReminder } from '@services/notificationService';

export const useProcessOfflineQueue = () => {
  const mutations = useSelector((state: RootState) => state.offlineQueue.mutations);
  const dispatch = useDispatch();
  const [createTask] = useCreateTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const [completeTask] = useCompleteTaskMutation();
  const [snoozeTask] = useSnoozeTaskMutation();

  return useCallback(async () => {
    for (const mutation of mutations) {
      try {
        switch (mutation.type) {
          case 'CREATE': {
            const { optimisticId, ...payload } = mutation.payload;
            const created = await createTask(payload).unwrap();
            await saveTask(created);
            if (optimisticId) {
              dispatch(tasksActions.removeTask(optimisticId));
            }
            dispatch(tasksActions.upsertTask(created));
            break;
          }
          case 'UPDATE': {
            const updated = await updateTask(mutation.payload).unwrap();
            await saveTask(updated);
            dispatch(tasksActions.upsertTask(updated));
            break;
          }
          case 'DELETE':
            await deleteTask(mutation.payload.id).unwrap();
            await deleteTaskFromDb(mutation.payload.id);
            dispatch(tasksActions.removeTask(mutation.payload.id));
            break;
          case 'COMPLETE': {
            const completed = await completeTask(mutation.payload.id).unwrap();
            await saveTask(completed);
            dispatch(tasksActions.upsertTask(completed));
            await cancelReminder(completed.id);
            break;
          }
          case 'SNOOZE': {
            const snoozed = await snoozeTask(mutation.payload).unwrap();
            await saveTask(snoozed);
            dispatch(tasksActions.upsertTask(snoozed));
            await scheduleLocalReminder(snoozed);
            break;
          }
          default:
            break;
        }
        dispatch(offlineQueueActions.dequeueMutation(mutation.id));
      } catch (error) {
        break;
      }
    }
  }, [mutations, createTask, updateTask, deleteTask, completeTask, snoozeTask, dispatch]);
};
