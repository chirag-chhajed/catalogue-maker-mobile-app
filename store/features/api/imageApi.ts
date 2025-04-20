import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { Image } from "react-native";

import { downloadImagesToCache } from "~/lib/downloadImagesToCache";

type ImageWithDetails = {
  imageUrl: string;
  name: string;
  price: number;
  itemId: string;
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
  }),
});

export const { useGetCachedImagesQuery } = imageApi;
