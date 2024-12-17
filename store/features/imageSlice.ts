import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const initialState: {
  uri: string;
  name: string;
  type: string;
}[] = [];

export const imageSlice = createSlice({
  name: "image",
  initialState,
  reducers: {
    setImages: (
      _state,
      action: PayloadAction<
        {
          uri: string;
          name: string;
          type: string;
        }[]
      >,
    ) => {
      return action.payload;
    },
    clearImages: () => [],
  },
});

export const { setImages, clearImages } = imageSlice.actions;
