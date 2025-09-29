import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Config from 'react-native-config';
import { Mutex } from 'async-mutex';
import { RootState } from '@store/index';
import { authActions } from '@store/slices/authSlice';

type BaseQueryFn = ReturnType<typeof fetchBaseQuery>;

const mutex = new Mutex();

const rawBaseQuery = fetchBaseQuery({
  baseUrl: Config.API_URL,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth.accessToken;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

export const baseQueryWithReauth: BaseQueryFn = async (args, api, extraOptions) => {
  await mutex.waitForUnlock();
  let result = await rawBaseQuery(args, api, extraOptions);
  if (result.error && result.error.status === 401) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        const refreshToken = (api.getState() as RootState).auth.refreshToken;
        if (refreshToken) {
          const refreshResult = await rawBaseQuery(
            { url: '/api/auth/refresh', method: 'POST', body: { refreshToken } },
            api,
            extraOptions,
          );
          if (refreshResult.data) {
            api.dispatch(authActions.tokenRefreshed(refreshResult.data as any));
            result = await rawBaseQuery(args, api, extraOptions);
          } else {
            api.dispatch(authActions.logout());
          }
        } else {
          api.dispatch(authActions.logout());
        }
      } finally {
        release();
      }
    } else {
      await mutex.waitForUnlock();
      result = await rawBaseQuery(args, api, extraOptions);
    }
  }
  return result;
};
