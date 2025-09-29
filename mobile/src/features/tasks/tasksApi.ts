import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '@api/baseQuery';
import { Task, AlarmSet } from '@types/task';

interface PaginatedTasks {
  items: Task[];
  total: number;
}

export const tasksApi = createApi({
  reducerPath: 'tasksApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Tasks', 'AlarmSets'],
  endpoints: (builder) => ({
    fetchTasks: builder.query<PaginatedTasks, { page?: number; status?: string } | void>({
      query: (params) => ({ url: '/api/tasks', params }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: 'Tasks' as const, id })),
              { type: 'Tasks' as const, id: 'LIST' },
            ]
          : [{ type: 'Tasks' as const, id: 'LIST' }],
    }),
    createTask: builder.mutation<Task, Partial<Task>>({
      query: (body) => ({ url: '/api/tasks', method: 'POST', body }),
      invalidatesTags: [{ type: 'Tasks', id: 'LIST' }],
    }),
    updateTask: builder.mutation<Task, Partial<Task> & { id: string }>({
      query: ({ id, ...body }) => ({ url: `/api/tasks/${id}`, method: 'PUT', body }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Tasks', id: arg.id },
        { type: 'Tasks', id: 'LIST' },
      ],
    }),
    deleteTask: builder.mutation<void, string>({
      query: (id) => ({ url: `/api/tasks/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Tasks', id: 'LIST' }],
    }),
    completeTask: builder.mutation<Task, string>({
      query: (id) => ({ url: `/api/tasks/${id}/complete`, method: 'POST' }),
      invalidatesTags: (result, error, id) => [
        { type: 'Tasks', id },
        { type: 'Tasks', id: 'LIST' },
      ],
    }),
    snoozeTask: builder.mutation<Task, { id: string; minutes: number }>({
      query: ({ id, minutes }) => ({
        url: `/api/tasks/${id}/snooze`,
        method: 'POST',
        body: { minutes },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Tasks', id },
        { type: 'Tasks', id: 'LIST' },
      ],
    }),
    fetchAlarmSets: builder.query<AlarmSet[], void>({
      query: () => ({ url: '/api/alarm-sets' }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'AlarmSets' as const, id })),
              { type: 'AlarmSets' as const, id: 'LIST' },
            ]
          : [{ type: 'AlarmSets' as const, id: 'LIST' }],
    }),
    createAlarmSet: builder.mutation<AlarmSet, Partial<AlarmSet>>({
      query: (body) => ({ url: '/api/alarm-sets', method: 'POST', body }),
      invalidatesTags: [{ type: 'AlarmSets', id: 'LIST' }],
    }),
    updateAlarmSet: builder.mutation<AlarmSet, Partial<AlarmSet> & { id: string }>({
      query: ({ id, ...body }) => ({ url: `/api/alarm-sets/${id}`, method: 'PUT', body }),
      invalidatesTags: (result, error, arg) => [
        { type: 'AlarmSets', id: arg.id },
        { type: 'AlarmSets', id: 'LIST' },
      ],
    }),
    deleteAlarmSet: builder.mutation<void, string>({
      query: (id) => ({ url: `/api/alarm-sets/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'AlarmSets', id: 'LIST' }],
    }),
    triggerAlarmSet: builder.mutation<void, string>({
      query: (id) => ({ url: `/api/alarm-sets/${id}/trigger`, method: 'POST' }),
    }),
  }),
});

export const api = tasksApi;

export const {
  useFetchTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useCompleteTaskMutation,
  useSnoozeTaskMutation,
  useFetchAlarmSetsQuery,
  useCreateAlarmSetMutation,
  useUpdateAlarmSetMutation,
  useDeleteAlarmSetMutation,
  useTriggerAlarmSetMutation,
} = tasksApi;
