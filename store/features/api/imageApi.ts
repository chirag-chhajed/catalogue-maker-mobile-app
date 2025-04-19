import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { Image, type ImageSize } from "react-native";
import ViewShot from "react-native-view-shot";
import { downloadImagesToCache } from "~/lib/downloadImagesToCache";

type ImageWithDetails = {
  imageUrl: string;
  name: string;
  price: number;
  itemId: string;
};

type ViewShotData = {
  refs: ViewShot[];
  imageUrls: string[];
};

export const imageApi = createApi({
  reducerPath: "imageApi",
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    getCachedImages: builder.query<
      {
        image: string;
        width: number;
        height: number;
        name: string;
        price: number;
        itemId: string;
      }[],
      ImageWithDetails[]
    >({
      queryFn: async (items) => {
        try {
          const cachedImages = await downloadImagesToCache(
            items.map((item) => item.imageUrl),
          );
          const cachedImagesWithDimensions = await Promise.all(
            cachedImages.map(async (image, index) => {
              const dimensions = await Image.getSize(image);
              return {
                image,
                width: dimensions.width,
                height: dimensions.height,
                name: items[index].name,
                price: items[index].price,
                itemId: items[index].itemId,
              };
            }),
          );
          return { data: cachedImagesWithDimensions };
        } catch (error) {
          return { error: error as Error };
        }
      },
    }),
    captureViewShots: builder.query<string[], ViewShotData>({
      queryFn: async ({ refs, imageUrls }) => {
        try {
          if (imageUrls.length === 0) return { data: [] };
          const urls = await Promise.all(refs.map((ref) => ref.capture()));
          return { data: urls };
        } catch (error) {
          return { error: error as Error };
        }
      },
    }),
  }),
});

export const { useGetCachedImagesQuery, useCaptureViewShotsQuery } = imageApi;
