import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { useAppSelector } from "../hooks";

type Item = {
  catalogueId: string;
  itemId: string;
  createdAt: number;
};

const initialState: Item[] = [];

export const itemsSlice = createSlice({
  name: "items",
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<Item>) => {
      state.push(action.payload);
    },
    removeItem: (state, action: PayloadAction<string>) => {
      return state.filter((item) => item.itemId !== action.payload);
    },
    clearItems: () => {
      return [];
    },
  },
});

export const { addItem, removeItem, clearItems } = itemsSlice.actions;

export const useGetItems = () => {
  const items = useAppSelector((state) => state.items);
  return items;
};
