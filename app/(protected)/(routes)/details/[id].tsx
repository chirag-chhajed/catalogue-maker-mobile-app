import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { Dimensions, View } from "react-native";
import Carousel from "react-native-reanimated-carousel";

import { Text } from "~/components/ui/text";

// Mock product data
const image = Array.from(
  { length: 5 },
  (_, i) => `https://picsum.photos/seed/${i}/800/600`,
);

const MOCK_DATA = Array.from({ length: 20 }, (_, i) => ({
  images: image,
  title: `Title ${i + 1}`,
  description: `A  features ${i}`,
  price: Math.floor(Math.random() * 10000) + 1000,
}));

const DetailsPage = () => {
  const { id } = useLocalSearchParams();
  const { width, height } = Dimensions.get("window");

  return (
    <View style={{ flex: 1, width, height }}>
      <FlashList
        data={MOCK_DATA}
        estimatedItemSize={width}
        estimatedListSize={{ height, width }}
        renderItem={({ item }) => <Slide {...item} />}
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
  title,
  description,
  price,
}: {
  images: string[];
  title: string;
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
              source={item}
              contentFit="cover"
              placeholder={item}
            />
          )}
        />
      </View>

      <View className=" p-4">
        <Text className="text-xl font-bold">{title}</Text>
        <Text className="mt-2">{description}</Text>
        <Text className="mt-2">{price}</Text>
      </View>
    </View>
  );
};
