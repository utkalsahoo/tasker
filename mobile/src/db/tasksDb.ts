import SQLite from '@react-native-sqlite-storage/legacy';
import { Task } from '@types/task';

const db = SQLite.openDatabase({ name: 'tasker.db', location: 'default' });

db.transaction((tx) => {
  tx.executeSql(
    `CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      payload TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    )`,
  );
});

export const saveTask = async (task: Task) => {
  return new Promise<void>((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'REPLACE INTO tasks (id, payload, updated_at) VALUES (?, ?, ?)',
        [task.id, JSON.stringify(task), Date.now()],
        () => resolve(),
        (_, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
};

export const loadTasks = async (): Promise<Task[]> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT payload FROM tasks',
        [],
        (_, resultSet) => {
          const items: Task[] = [];
          for (let i = 0; i < resultSet.rows.length; i += 1) {
            items.push(JSON.parse(resultSet.rows.item(i).payload));
          }
          resolve(items);
        },
        (_, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
};

export const deleteTaskFromDb = async (id: string) => {
  return new Promise<void>((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'DELETE FROM tasks WHERE id = ?',
        [id],
        () => resolve(),
        (_, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
};
