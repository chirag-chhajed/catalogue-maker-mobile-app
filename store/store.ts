import { configureStore } from "@reduxjs/toolkit";

import { api } from "~/store/features/api";
import { authSlice } from "~/store/features/hello";
import { imageSlice } from "~/store/features/imageSlice";
import { helloSlice } from "~/store/features/organizationId";

export const store = configureStore({
  reducer: {
    hello: authSlice.reducer,
    orgId: helloSlice.reducer,
    image: imageSlice.reducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
  devTools: false,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
