import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { Dimensions, View } from "react-native";
import Carousel from "react-native-reanimated-carousel";

import { Text } from "~/components/ui/text";
import { type ImageType, useGetCatalogItemsQuery } from "~/store/features/api";

// Mock product data
// const image = Array.from(
//   { length: 5 },
//   (_, i) => `https://picsum.photos/seed/${i}/800/600`,
// );

// const MOCK_DATA = Array.from({ length: 20 }, (_, i) => ({
//   images: image,
//   title: `Title ${i + 1}`,
//   description: `A  features ${i}`,
//   price: Math.floor(Math.random() * 10000) + 1000,
// }));

const DetailsPage = () => {
  const { id } = useLocalSearchParams();
  const { width, height } = Dimensions.get("window");
  const { data, isLoading } = useGetCatalogItemsQuery(
    { id },
    {
      skip: !id,
    },
  );
  const rearrangedData = useMemo(() => {
    const matchIndex = data?.items.findIndex((item) => item.id === id);
    if (matchIndex === -1) return data?.items;

    const beforeMatch = data?.items.slice(0, matchIndex);
    const afterMatch = data?.items.slice(matchIndex + 1);
    const matchItem = data?.items[matchIndex];

    return [matchItem, ...afterMatch, ...beforeMatch];
  }, [id]);
  if (isLoading) {
    return <Text>Loading</Text>;
  }
  return (
    <View style={{ flex: 1, width, height }}>
      <FlashList
        data={rearrangedData}
        estimatedItemSize={width}
        estimatedListSize={{ height, width }}
        renderItem={({ item }) => (
          <Slide {...item} key={`details-${item.id}`} />
        )}
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        horizontal
      />
    </View>
  );
};
export default DetailsPage;

const Slide = ({
  images,
  name,
  description,
  price,
}: {
  images: ImageType[];
  name: string;
  description: string;
  price: number;
}) => {
  const { width, height } = Dimensions.get("window");

  return (
    <View style={{ height }} className="flex-1">
      <View className="h-[275px]">
        <Carousel
          width={width}
          height={275}
          data={images}
          loop={false}
          vertical
          renderItem={({ item }) => (
            <Image
              style={{ width: "100%", height: "100%" }}
              source={item.imageUrl}
              contentFit="contain"
              placeholder={item.blurhash}
            />
          )}
        />
      </View>

      <View className=" p-4">
        <Text className="text-xl font-bold">{name}</Text>
        <Text className="mt-2">{description}</Text>
        <Text className="mt-2">{price}</Text>
      </View>
    </View>
  );
};
