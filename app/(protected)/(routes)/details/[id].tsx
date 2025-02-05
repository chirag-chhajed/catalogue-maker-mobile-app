import { AntDesign, Feather, FontAwesome6 } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { Image, type ImageContentFit } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { useMemo, useState, useCallback, useRef, useEffect } from "react";
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
import { useGetCatalogItemsQuery } from "~/store/features/api/v2/catalogueApiV2";

const DetailsPage = () => {
  const {
    id,
    catalogueId,
    page: pageParam,
    searchPage,
    sortDir,
    priceSort,
  } = useLocalSearchParams();
  const { width, height } = Dimensions.get("window");
  const flashListRef = useRef<FlashList<any>>(null);

  // Convert page parameter to number with fallback to 1
  const [currentPage, setCurrentPage] = useState(Number(pageParam) || 1);

  const { data, isLoading } = useGetCatalogItemsQuery(
    {
      id,
      page: currentPage,
      sortDir: sortDir as string,
      priceSort: priceSort as string,
      limit: 10,
    },
    {
      skip: !id,
    },
  );

  // Find initial scroll index based on catalogueId
  const initialScrollIndex = useMemo(() => {
    if (!data?.items || !catalogueId) return 0;
    return data.items.findIndex((item) => item.id === catalogueId);
  }, [data?.items, catalogueId]);

  // Scroll to initial item when data is loaded
  useEffect(() => {
    if (!isLoading && data?.items && initialScrollIndex !== -1) {
      flashListRef.current?.scrollToIndex({
        index: initialScrollIndex,
        animated: false,
      });
    }
  }, [isLoading, data?.items, initialScrollIndex]);

  const handlePageChange = useCallback(
    (index: number) => {
      const isLastItem = index === data?.items?.length - 1;
      const isFirstItem = index === 0;

      if (isLastItem && data?.pagination.hasMore) {
        setCurrentPage((prev) => prev + 1);
      } else if (isFirstItem && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }
    },
    [currentPage, data?.pagination.hasMore, data?.items?.length],
  );

  // Handle scroll failure (if the index is not yet rendered)
  const handleScrollToIndexFailed = useCallback(
    (info: {
      index: number;
      highestMeasuredFrameIndex: number;
      averageItemLength: number;
    }) => {
      const offset = info.averageItemLength * info.index;
      flashListRef.current?.scrollToOffset({ offset, animated: false });

      // Try scrolling to index after a small delay
      setTimeout(() => {
        if (flashListRef.current) {
          flashListRef.current.scrollToIndex({
            index: info.index,
            animated: false,
          });
        }
      }, 100);
    },
    [],
  );

  if (isLoading) {
    return <Text>Loading</Text>;
  }

  return (
    <View style={{ flex: 1, width, height }}>
      <FlashList
        ref={flashListRef}
        data={data?.items}
        estimatedItemSize={width}
        estimatedListSize={{ height, width }}
        renderItem={({ item }) => (
          <Slide
            {...item}
            id={id}
            catalogueId={catalogueId}
            key={`details-${item.id}`}
          />
        )}
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        horizontal
        onScrollToIndexFailed={handleScrollToIndexFailed}
        onViewableItemsChanged={({ viewableItems }) => {
          if (viewableItems[0]) {
            handlePageChange(viewableItems[0].index ?? 0);
          }
        }}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
        }}
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
  id,
  catalogueId,
}: {
  images: ImageType[];
  name: string;
  description: string;
  price: number;
  id: string;
  catalogueId: string;
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
                          urls: cachedImages,
                          social: Share.Social.WHATSAPP,
                          message: `${name}\n\n${description}\n\nPrice: ${price}`,
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
                Share.open({
                  urls: cachedImages,
                  title: name,
                  message: `${name}\n\n${description}\n\nPrice: ${price}`,
                });
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
                await Share.shareSingle({
                  urls: cachedImages,
                  social: Share.Social.WHATSAPP,
                  message: `${name}\n\n${description}\n\nPrice: ${price}`,
                  title: name,
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
                message: `https://cataloguemaker.vercel.app/share/${id}?catalogueItemId=${catalogueId}`,
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
