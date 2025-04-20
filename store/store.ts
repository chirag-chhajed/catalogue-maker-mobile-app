import { configureStore } from "@reduxjs/toolkit";

import { api } from "~/store/features/api";
import { imageApi } from "~/store/features/api/imageApi";
import { authSlice } from "~/store/features/hello";
import { imageSlice } from "~/store/features/imageSlice";
import { itemsSlice } from "~/store/features/itemsSlice";
import { newSharableImageSlice } from "~/store/features/newSharableImageSlice";
import { helloSlice } from "~/store/features/organizationId";
import { shareTypeSlice } from "~/store/features/sharetype";
export const store = configureStore({
  reducer: {
    hello: authSlice.reducer,
    orgId: helloSlice.reducer,
    image: imageSlice.reducer,
    [itemsSlice.name]: itemsSlice.reducer,
    [newSharableImageSlice.name]: newSharableImageSlice.reducer,
    [shareTypeSlice.name]: shareTypeSlice.reducer,
    [api.reducerPath]: api.reducer,
    [imageApi.reducerPath]: imageApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware).concat(imageApi.middleware),
  devTools: false,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
