import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  accessToken?: string;
  refreshToken?: string;
  userId?: string;
  expiresAt?: number;
}

interface TokenPayload {
  accessToken: string;
  refreshToken: string;
  userId: string;
  expiresIn: number;
}

const initialState: AuthState = {};

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<TokenPayload>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.userId = action.payload.userId;
      state.expiresAt = Date.now() + action.payload.expiresIn * 1000;
    },
    logout: () => initialState,
    tokenRefreshed: (state, action: PayloadAction<TokenPayload>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.expiresAt = Date.now() + action.payload.expiresIn * 1000;
    },
  },
});

export const authReducer = slice.reducer;
export const authActions = slice.actions;
