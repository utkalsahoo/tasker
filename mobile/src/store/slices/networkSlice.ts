import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface NetworkState {
  isOnline: boolean;
  lastChangedAt: number;
}

const initialState: NetworkState = { isOnline: true, lastChangedAt: Date.now() };

const slice = createSlice({
  name: 'network',
  initialState,
  reducers: {
    setOnline: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
      state.lastChangedAt = Date.now();
    },
  },
});

export const networkReducer = slice.reducer;
export const networkActions = slice.actions;
