import { AntDesign, Feather, FontAwesome6 } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { Image, type ImageContentFit } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import {
  Dimensions,
  View,
  ScrollView,
  Pressable,
  Alert,
  Platform,
} from "react-native";
import ImageModal from "react-native-image-modal";
import Carousel from "react-native-reanimated-carousel";
import Share from "react-native-share";
import { toast } from "sonner-native";

import { Text } from "~/components/ui/text";
import {
  downloadImagesToCache,
  downloadImagesToGallery,
} from "~/lib/downloadImagesToCache";
import type { ImageType } from "~/store/features/api";
import { useGetCatalogItemsQuery } from "~/store/features/api/catalogueApi";

const DetailsPage = () => {
  const { id, catalogueId } = useLocalSearchParams();
  const { width, height } = Dimensions.get("window");
  const { data, isLoading } = useGetCatalogItemsQuery(
    { id },
    {
      skip: !id,
    },
  );
  const rearrangedData = useMemo(() => {
    const matchIndex = data?.items.findIndex((item) => item.id === catalogueId);
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
    <ScrollView style={{ height, width }} className="flex-1 bg-white">
      <View className="h-[275px]">
        <Carousel
          width={width}
          height={275}
          data={images}
          loop={false}
          vertical
          renderItem={({ item }) => (
            <ImageModal
              source={{ uri: item.imageUrl }}
              resizeMode="contain"
              style={{ width, height: 275 }}
              renderImageComponent={({ style, source, resizeMode }) => (
                <Image
                  style={style}
                  source={source}
                  contentFit={resizeMode as ImageContentFit}
                  placeholder={item.blurhash}
                />
              )}
              renderFooter={() => (
                <View className="flex-row items-center justify-around bg-black/50 p-4">
                  <Pressable
                    onPress={async () => {
                      try {
                        const cachedImages = await downloadImagesToCache([
                          item.imageUrl,
                        ]);
                        Share.open({ urls: cachedImages });
                      } catch (error) {
                        console.log(error);
                      }
                    }}
                    className="items-center rounded-full bg-white/20 p-3"
                  >
                    <Feather
                      name={Platform.OS === "android" ? "share-2" : "share"}
                      size={24}
                      color="white"
                    />
                  </Pressable>

                  <Pressable
                    onPress={async () => {
                      try {
                        await downloadImagesToGallery([item.imageUrl]);
                        toast.success("Image downloaded to gallery");
                      } catch (error) {
                        Alert.alert("Error", "Failed to save image");
                      }
                    }}
                    className="items-center rounded-full bg-white/20 p-3"
                  >
                    <Feather name="download" size={24} color="white" />
                  </Pressable>

                  <Pressable
                    onPress={async () => {
                      try {
                        const cachedImages = await downloadImagesToCache([
                          item.imageUrl,
                        ]);
                        await Share.shareSingle({
                          title: "Share Image",
                          urls: cachedImages,
                          social: Share.Social.WHATSAPP,
                        });
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="items-center rounded-full bg-white/20 p-3"
                  >
                    <FontAwesome6 name="whatsapp" size={24} color="white" />
                  </Pressable>
                </View>
              )}
            />
          )}
        />
      </View>

      <View className="px-6 py-4">
        <View className=" flex-row justify-start gap-4 border-gray-200 pt-4">
          <Pressable
            onPress={async () => {
              try {
                const cachedImages = await downloadImagesToCache(
                  images.map((image) => image.imageUrl),
                );
                Share.open({ urls: cachedImages, title: name });
              } catch (error) {
                console.log(error);
              }
            }}
            className="items-center rounded-full bg-slate-200 p-2 shadow-sm active:bg-gray-50"
          >
            <Feather
              name={Platform.OS === "android" ? "share-2" : "share"}
              size={24}
              color="#374151"
            />
          </Pressable>

          <Pressable
            onPress={async () => {
              try {
                await downloadImagesToGallery(
                  images.map((img) => img.imageUrl),
                );
                toast.success("Images downloaded to gallery");

                // Alert.alert("Success", "Images downloaded to gallery");
              } catch {
                // Alert.alert("Error", "Failed to download images");
              }
            }}
            className="items-center rounded-full bg-slate-200 p-2 shadow-sm active:bg-gray-50"
          >
            <Feather name="download" size={24} color="#374151" />
          </Pressable>

          <Pressable
            onPress={async () => {
              try {
                const cachedImages = await downloadImagesToCache(
                  images.map((img) => img.imageUrl),
                );
                console.log(cachedImages);
                await Share.shareSingle({
                  title: "Title",
                  urls: cachedImages,
                  social: Share.Social.WHATSAPP,
                });
              } catch (err) {
                console.error(err);
              }
            }}
            className="items-center rounded-full bg-slate-200 p-2 shadow-sm active:bg-gray-50"
          >
            <FontAwesome6 name="whatsapp" size={24} color="#25D366" />
          </Pressable>

          <Pressable
            onPress={async () => {
              await Share.open({
                message: "https://www.google.com",
              });
            }}
            className="items-center rounded-full bg-slate-200 p-2 shadow-sm active:bg-gray-50"
          >
            <AntDesign name="link" size={24} color="#374151" />
          </Pressable>
        </View>
        <Text className="mt-6 text-2xl font-bold text-gray-800">{name}</Text>
        <Text className="mt-2 text-lg font-semibold text-green-600">
          ₹{price}
        </Text>
        <Text className="mt-3 flex-wrap font-mono text-base leading-6 text-gray-600">
          {description}
        </Text>
      </View>
    </ScrollView>
  );
};
