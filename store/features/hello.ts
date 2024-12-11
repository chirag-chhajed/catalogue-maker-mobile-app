import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type HelloState = {
  accessToken: string | null;
  refreshToken: string | null;
};

const initialState: HelloState = {
  accessToken: null,
  refreshToken: null,
};

export const helloSlice = createSlice({
  name: "hello",
  initialState,
  reducers: {
    changeState: (state, action: PayloadAction<HelloState>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
    changeAccessToken: (
      state,
      action: PayloadAction<{ accessToken: string }>
    ) => {
      state.accessToken = action.payload.accessToken;
    },
    clearState: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
    },
  },
});

export const { changeAccessToken, changeState, clearState } =
  helloSlice.actions;
