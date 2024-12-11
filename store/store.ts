import { configureStore } from "@reduxjs/toolkit";

import { api } from "./features/api";

import { helloSlice } from "~/store/features/hello";

export const store = configureStore({
  reducer: {
    hello: helloSlice.reducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
  devTools: false,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
