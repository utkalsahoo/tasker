import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useDispatch, useSelector } from 'react-redux';
import { networkActions } from '@store/slices/networkSlice';
import { RootState } from '@store/index';
import { useProcessOfflineQueue } from './useProcessOfflineQueue';
import { loadTasks } from '@db/tasksDb';
import { tasksActions } from '@store/slices/tasksSlice';
import { scheduleLocalReminder } from '@services/notificationService';

export const useAppBootstrap = () => {
  const dispatch = useDispatch();
  const isOnline = useSelector((state: RootState) => state.network.isOnline);
  const processQueue = useProcessOfflineQueue();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      dispatch(networkActions.setOnline(Boolean(state.isConnected)));
    });
    return () => unsubscribe();
  }, [dispatch]);

  useEffect(() => {
    (async () => {
      const tasks = await loadTasks();
      dispatch(tasksActions.upsertMany(tasks));
      await Promise.all(tasks.map((task) => scheduleLocalReminder(task)));
    })();
  }, [dispatch]);

  useEffect(() => {
    if (isOnline) {
      processQueue();
    }
  }, [isOnline, processQueue]);
};
