import { configureStore } from "@reduxjs/toolkit";

import { api } from "~/store/features/api";
import { authSlice } from "~/store/features/hello";
import { imageSlice } from "~/store/features/imageSlice";
import { itemsSlice } from "~/store/features/itemsSlice";
import { helloSlice } from "~/store/features/organizationId";
import { sharableImageSlice } from "~/store/features/sharableImageSlice";
import { newSharableImageSlice } from "./features/newSharableImageSlice";
import { imageApi } from "./features/api/imageApi";

export const store = configureStore({
  reducer: {
    hello: authSlice.reducer,
    orgId: helloSlice.reducer,
    image: imageSlice.reducer,
    [sharableImageSlice.name]: sharableImageSlice.reducer,
    [itemsSlice.name]: itemsSlice.reducer,
    [newSharableImageSlice.name]: newSharableImageSlice.reducer,
    [api.reducerPath]: api.reducer,
    [imageApi.reducerPath]: imageApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware).concat(imageApi.middleware),
  devTools: false,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
