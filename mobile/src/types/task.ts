export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TaskStatus = 'PENDING' | 'COMPLETED';
export type RepeatType = 'NONE' | 'DAILY' | 'WEEKLY' | 'CUSTOM';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  dueAt?: string;
  remindAt?: string;
  repeat: RepeatType;
  repeatCron?: string | null;
  alarm: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AlarmSet {
  id: string;
  name: string;
  timeUtc: string;
  timezone: string;
  taskIds: string[];
  createdAt: string;
  updatedAt: string;
}
