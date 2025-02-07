import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { useAppSelector } from "../hooks";

type SharrableImageGroup = {
  id: string;
  items: {
    id: string;
    images: {
      id: string;
      imageUrl: string;
      blurhash: string | null;
      checked: boolean;
      name: string;
      description: string;
      price: string;
    }[];
  }[];
};

const initialState: SharrableImageGroup[] = [];

export const sharableImageSlice = createSlice({
  name: "sharableImage",
  initialState,
  reducers: {
    addImages: (
      state,
      action: PayloadAction<{
        id: string;
        itemId: string;
        images: {
          id: string;
          imageUrl: string;
          blurhash: string | null;
          checked: boolean;
          name: string;
          description: string;
          price: string;
        }[];
      }>,
    ) => {
      const group = state.find((group) => group.id === action.payload.id);
      if (!group) {
        state.push({
          id: action.payload.id,
          items: [
            {
              id: action.payload.itemId,
              images: action.payload.images,
            },
          ],
        });
        return;
      }

      const item = group.items.find(
        (item) => item.id === action.payload.itemId,
      );
      if (item) {
        item.images.push(...action.payload.images);
      } else {
        group.items.push({
          id: action.payload.itemId,
          images: action.payload.images,
        });
      }
    },

    removeImages: (
      state,
      action: PayloadAction<{ id: string; itemId: string }>,
    ) => {
      const group = state.find((group) => group.id === action.payload.id);
      if (!group) return;

      const item = group.items.find(
        (item) => item.id === action.payload.itemId,
      );
      if (item) {
        item.images = [];
      }
    },

    clearItems: (state, action: PayloadAction<string>) => {
      const group = state.find((group) => group.id === action.payload);
      if (group) {
        group.items = [];
      }
    },

    toggleCheck: (
      state,
      action: PayloadAction<{ id: string; itemId: string; imageId: string }>,
    ) => {
      const group = state.find((group) => group.id === action.payload.id);
      if (!group) return;

      const item = group.items.find(
        (item) => item.id === action.payload.itemId,
      );
      if (!item) return;

      const image = item.images.find(
        (img) => img.id === action.payload.imageId,
      );
      if (image) {
        image.checked = !image.checked;
      }
    },
  },
});

export const { addImages, clearItems, removeImages, toggleCheck } =
  sharableImageSlice.actions;

export const useGetImagesFromGroup = (groupId: string) => {
  const images = useAppSelector((state) =>
    state.sharableImage.find((group) => group.id === groupId),
  );
  return images?.items.flatMap((item) =>
    item.images.map((image) => ({
      ...image,
      itemId: item.id,
    })),
  );
};

export const useGetCheckedImages = (groupId: string) => {
  const images = useGetImagesFromGroup(groupId);
  return images?.filter((image) => image.checked);
};
