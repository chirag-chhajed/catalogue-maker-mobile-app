import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { useAppSelector } from "../hooks";

type SharableImageGroup = {
  itemId: string;
  name: string;
  catalogueId: string;
  description?: string;
  price: number;
  image: {
    imageUrl: string;
    blurhash: string | null;
  };
};

const initialState: SharableImageGroup[] = [];
export const newSharableImageSlice = createSlice({
  name: "NewSharableImage",
  initialState,
  reducers: {
    addSharableImageGroup: (
      state,
      action: PayloadAction<SharableImageGroup>,
    ) => {
      state.push(action.payload);
    },
    removeSharableImageGroup: (
      state,
      action: PayloadAction<{ itemId: string }>,
    ) => {
      return state.filter((group) => group.itemId !== action.payload.itemId);
    },
    clearSharableImageGroups: () => {
      return [];
    },
  },
});

export const {
  addSharableImageGroup,
  removeSharableImageGroup,
  clearSharableImageGroups,
} = newSharableImageSlice.actions;

export const useGetBulkImages = () => {
  const items = useAppSelector((state) => state.NewSharableImage);
  return items.map((group) => ({
    imageUrl: group.image.imageUrl,
    name: group.name,
    price: group.price,
    itemId: group.itemId,
  }));
};

export const useGetBulkItems = () => {
  const items = useAppSelector((state) => state.NewSharableImage);
  return items.map((group) => ({
    itemId: group.itemId,
    catalogueId: group.catalogueId,
  }));
};
