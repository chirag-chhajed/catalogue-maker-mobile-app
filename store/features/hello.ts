import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type UserAuthState = {
  accessToken: string | null;
  user: {
    id: string;
    email: string;
    name: string;
    organizationId?: string;
    role?: "admin" | "editor" | "viewer";
  } | null;
};

const initialState: UserAuthState = {
  accessToken: null,
  user: null,
};

export const authSlice = createSlice({
  name: "hello",
  initialState,
  reducers: {
    changeState: (state, action: PayloadAction<UserAuthState>) => {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
    },
    changeAccessToken: (
      state,
      action: PayloadAction<{ accessToken: string }>,
    ) => {
      state.accessToken = action.payload.accessToken;
    },
    clearState: (state) => {
      state.accessToken = null;
      state.user = null;
    },
  },
});

export const { changeAccessToken, changeState, clearState } = authSlice.actions;
