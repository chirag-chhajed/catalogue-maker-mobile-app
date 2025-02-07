import {
  openPicker,
  type Config,
} from "@baronha/react-native-multiple-image-picker";
import { AntDesign, Feather, FontAwesome6 } from "@expo/vector-icons";
import BottomSheet, { BottomSheetFlashList } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import { useDebounce } from "@uidotdev/usehooks";
import { Image } from "expo-image";
import { useLocalSearchParams, router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Pressable, Dimensions, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Share from "react-native-share";
import { toast } from "sonner-native";

import img from "~/assets/266.png";
import { CompactCard } from "~/components/CatalogueItemCompactCard";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { Switch } from "~/components/ui/switch";
import { Text } from "~/components/ui/text";
import {
  downloadImagesToCache,
  downloadImagesToGallery,
  downloadInfoImagesToGallery,
} from "~/lib/downloadImagesToCache";
import { PolaroidImageCapture } from "~/lib/processImages";
import {
  useGetCatalogItemsQuery,
  useSearchCatalogItemsQuery,
} from "~/store/features/api/v2/catalogueApiV2";
import {
  clearItems,
  toggleCheck,
  useGetCheckedImages,
  useGetImagesFromGroup,
} from "~/store/features/sharableImageSlice";
import { useAppDispatch, useDispatchImages } from "~/store/hooks";

const config: Config = {
  maxSelect: 5,
  numberOfColumn: 4,
  mediaType: "image",
  selectBoxStyle: "number",
  selectMode: "multiple",
  language: "en",
  theme: "system",
  isHiddenOriginalButton: false,
  crop: {
    ratio: [
      {
        title: "16:9",
        height: 16,
        width: 9,
      },
      {
        title: "4:3",
        height: 4,
        width: 3,
      },
      {
        title: "1:1",

        height: 1,
        width: 1,
      },
      {
        title: "2:3",
        height: 2,
        width: 3,
      },
    ],
    freeStyle: true,
    circle: false,
  },
};

// Add PaginationButtons component at the top level
const PaginationButtons = ({
  page,
  hasMore,
  onPrevPress,
  onNextPress,
  noResults,
}: {
  page: number;
  hasMore: boolean;
  onPrevPress: () => void;
  onNextPress: () => void;
  noResults?: boolean;
}) => {
  // Don't show buttons if it's first page and no more results
  if (page === 1 && !hasMore) return null;

  return (
    <View className="px-4 py-2">
      <View className="flex-row items-center justify-center gap-4">
        <Button
          variant="outline"
          onPress={onPrevPress}
          disabled={page === 1}
          className="flex-1"
        >
          <Text className="text-center font-medium">Previous</Text>
        </Button>
        <Button
          variant="outline"
          onPress={onNextPress}
          disabled={!hasMore}
          className="flex-1"
        >
          <Text className="text-center font-medium">Next</Text>
        </Button>
      </View>
      {!hasMore && page > 1 && (
        <Text className="mt-4 text-center text-gray-600">
          You have reached the end of the list.
        </Text>
      )}
      {noResults && (
        <Text className="mt-4 text-center text-gray-600">
          No items exist for this term.
        </Text>
      )}
    </View>
  );
};

export default function DetailsScreen() {
  const { id } = useLocalSearchParams();
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<"asc" | "desc">("desc");
  const [priceSort, setPriceSort] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [searchPage, setSearchPage] = useState(1);
  const debouncedSearchTerm = useDebounce(searchQuery, 500);
  const { setImages } = useDispatchImages();
  const { data, isLoading, refetch } = useGetCatalogItemsQuery(
    { id, page, limit: 10, sortDir: sort, priceSort },
    {
      skip: !id,
    },
  );

  const {
    data: searchData,
    isLoading: isSearchLoading,
    refetch: refetchSearch,
  } = useSearchCatalogItemsQuery(
    {
      id: id as string,
      page: searchPage,
      limit: 10,
      sortDir: sort,
      priceSort,
      query: debouncedSearchTerm,
    },
    {
      skip: debouncedSearchTerm.length === 0 || !id,
    },
  );

  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };
  const [selectionMode, setSelectionMode] = useState(false);
  const [index, setIndex] = useState(-1);
  const [addInfoToImages, setAddInfoToImages] = useState(false);
  const [processedImages, setProcessedImages] = useState<string[]>([]);
  useEffect(() => {
    if (!selectionMode) {
      dispatch(clearItems(id));
    }
  }, [selectionMode, dispatch, id]);

  const pickDocImage = async () => {
    try {
      const result = await openPicker(config);
      setImages(
        result.map((res) => ({
          uri: `file://${res.realPath}`,
          type: res.mime,
          name: res.fileName,
        })),
      );
      router.push(`/(protected)/(routes)/catalogue/create-item-form?id=${id}`);
    } catch (error) {
      toast.error("Some Error occured");
    }
  };
  const sheetRef = useRef<BottomSheet>(null);
  const images = useGetImagesFromGroup(id);
  const checkedImages = useGetCheckedImages(id);
  const snapPoints = useMemo(() => ["55%"], []);

  // callbacks
  const handleSnapPress = useCallback((index: number) => {
    sheetRef.current?.snapToIndex(index);
  }, []);

  const { width } = Dimensions.get("window");
  const renderItem = ({
    item,
  }: {
    item: {
      itemId: string;
      id: string;
      imageUrl: string;
      blurhash: string | null;
      checked: boolean;
    };
  }) => {
    const imageSize = width / 3 - 8; // 4 columns with 8px gap

    return (
      <View className="relative">
        <Image
          key={item.id}
          source={{ uri: item.imageUrl }}
          placeholder={item.blurhash}
          contentFit="cover"
          className="rounded-md"
          style={{
            width: imageSize,
            height: imageSize,
            margin: 4,
          }}
        />
        <Checkbox
          className="absolute right-2 top-2 "
          checked={item.checked}
          onCheckedChange={() => {
            dispatch(
              toggleCheck({
                id,
                imageId: item.id,
                itemId: item.itemId,
              }),
            );
          }}
          hitSlop={20}
        />
      </View>
    );
  };

  // Add pagination handlers
  const handlePrevPage = () => {
    if (searchQuery.length > 0) {
      setSearchPage((prev) => Math.max(1, prev - 1));
    } else {
      setPage((prev) => Math.max(1, prev - 1));
    }
  };

  const handleNextPage = () => {
    if (searchQuery.length > 0 && searchData?.pagination.hasMore) {
      setSearchPage((prev) => prev + 1);
    } else if (data?.pagination.hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  // Modify the handleShare function
  const handleShare = async () => {
    try {
      if (!checkedImages?.length) return;

      if (addInfoToImages) {
        // Get full item info for checked images
        await Share.open({
          urls: processedImages,
        });
      }
      const cachedImages = await downloadImagesToCache(
        checkedImages.map((image) => image.imageUrl),
      );
      await Share.open({
        urls: cachedImages,
      });
    } catch (error) {
      console.log(error);
      toast.error("Failed to share images");
    }
  };

  // Modify the WhatsApp share handler similarly
  const handleWhatsAppShare = async () => {
    try {
      if (!checkedImages?.length) return;

      if (addInfoToImages) {
        await Share.shareSingle({
          urls: processedImages,
          social: Share.Social.WHATSAPP,
        });
      }
      const cachedImages = await downloadImagesToCache(
        checkedImages.map((img) => img.imageUrl),
      );

      await Share.shareSingle({
        urls: cachedImages,
        social: Share.Social.WHATSAPP,
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to share on WhatsApp");
    }
  };

  return (
    <View className="flex-1">
      {isLoading ? (
        <View className="flex-1 px-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <View key={index} className="my-2">
              <SkeletonItemCard />
            </View>
          ))}
        </View>
      ) : !data?.items?.length && !searchData?.items?.length ? (
        <View className="flex-1 items-center justify-center p-4">
          <Image source={img} style={{ width: 200, height: 200 }} />
          <Text className="mb-4 text-center text-gray-600">No items yet</Text>
        </View>
      ) : (
        <View className="flex-1">
          {/* Search and Filter Section */}
          <View className="flex-row items-center justify-between p-4">
            <View className="relative mr-2 flex-1 flex-row items-center">
              <Input
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search for items..."
                style={{ flex: 1 }}
                className=" px-4 py-2 focus:border-blue-500"
              />
              {searchQuery.length > 0 && (
                <Pressable
                  onPress={() => setSearchQuery("")}
                  className="absolute right-2 ml-2"
                >
                  <AntDesign name="closecircle" size={24} color="#666" />
                </Pressable>
              )}
            </View>

            <View className="flex-row gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Pressable className="rounded-md bg-gray-200 p-2">
                    <AntDesign name="filter" size={24} color="#666" />
                  </Pressable>
                </DropdownMenuTrigger>
                <DropdownMenuContent insets={contentInsets} className="w-56">
                  <DropdownMenuItem
                    onPress={() => {
                      setSort("desc");
                      setPage(1);
                    }}
                  >
                    <Text className="font-medium">Date: New to Old</Text>
                    <DropdownMenuShortcut>
                      <AntDesign name="calendar" size={20} color="#666" />
                    </DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onPress={() => {
                      setSort("asc");
                      setPage(1);
                    }}
                  >
                    <Text className="font-medium">Date: Old to New</Text>
                    <DropdownMenuShortcut>
                      <AntDesign name="calendar" size={20} color="#666" />
                    </DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onPress={() => {
                      setPriceSort("desc");
                      setPage(1);
                    }}
                  >
                    <Text className="font-medium">Price: High to Low</Text>
                    <DropdownMenuShortcut>
                      <AntDesign name="arrowup" size={20} color="#666" />
                    </DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onPress={() => {
                      setPriceSort("asc");
                      setPage(1);
                    }}
                  >
                    <Text className="font-medium">Price: Low to High</Text>
                    <DropdownMenuShortcut>
                      <AntDesign name="arrowdown" size={20} color="#666" />
                    </DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </View>
          </View>
          <View className="-mt-2 flex flex-row justify-between px-4 pb-2">
            <Pressable
              onPress={() => setSelectionMode(!selectionMode)}
              className="w-fit flex-row items-center justify-between rounded-lg bg-blue-50 p-3 active:bg-blue-100"
            >
              <View className="flex-row items-center">
                <AntDesign
                  name={selectionMode ? "check" : "select1"}
                  size={20}
                  color="#3b82f6"
                />
                <Text className="ml-2 font-medium text-blue-600">
                  {selectionMode ? "Cancel Selection" : "Select Items"}
                </Text>
              </View>
            </Pressable>
            {images?.length > 0 ? (
              <Pressable
                onPress={() => {
                  handleSnapPress(0);
                }}
                className="mt-2 h-12 w-12 items-center justify-center rounded-full bg-blue-600 shadow-lg shadow-blue-300 active:bg-blue-700"
              >
                <Feather
                  name={Platform.OS === "android" ? "share-2" : "share"}
                  size={24}
                  color="white"
                />
              </Pressable>
            ) : null}
          </View>
          {/* Cards Section - Updated */}
          <View className="flex-1 px-4">
            <FlashList
              data={searchQuery.length > 0 ? searchData?.items : data?.items}
              renderItem={({ item }) => (
                <CompactCard
                  item={item}
                  id={id}
                  select={selectionMode}
                  page={page}
                  searchPage={searchPage}
                  sortDir={sort}
                  priceSort={priceSort}
                />
              )}
              extraData={selectionMode}
              estimatedItemSize={385}
              ItemSeparatorComponent={() => <View className="h-2" />}
              showsVerticalScrollIndicator={false}
              onRefresh={searchQuery.length > 0 ? refetchSearch : refetch}
              refreshing={searchQuery.length > 0 ? isSearchLoading : isLoading}
            />
          </View>

          {/* Add Pagination Buttons */}
          <PaginationButtons
            page={searchQuery.length > 0 ? searchPage : page}
            hasMore={
              searchQuery.length > 0
                ? (searchData?.pagination.hasMore ?? false)
                : (data?.pagination.hasMore ?? false)
            }
            onPrevPress={handlePrevPage}
            onNextPress={handleNextPage}
            noResults={
              searchQuery.length > 0 && searchData?.items?.length === 0
            }
          />
          {/* <View style={{ position: "fixed", left: -9999 }}> */}
          {checkedImages?.length > 0 ? (
            <PolaroidImageCapture
              groupId={id as string}
              onCaptureComplete={(results: string[]) => {
                console.log(results);
                setProcessedImages(results);
              }}
            />
          ) : null}
          {/* </View> */}
        </View>
      )}
      {/* Fixed bottom buttons */}
      <View className="absolute bottom-6 flex w-full flex-row items-center justify-center gap-16">
        <Pressable
          onPress={pickDocImage}
          className="h-16 w-16 items-center justify-center rounded-full bg-blue-600"
        >
          <AntDesign name="picture" size={28} color="white" />
        </Pressable>
      </View>
      <BottomSheet
        ref={sheetRef}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        enablePanDownToClose
        onChange={setIndex}
        index={index}
      >
        <BottomSheetFlashList
          data={images}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          estimatedItemSize={width / 3}
          numColumns={3}
          contentContainerStyle={{ padding: 4 }}
          ListEmptyComponent={
            <Text className="text-center text-gray-500">
              No images selected
            </Text>
          }
        />
        {checkedImages?.length > 0 && (
          <View className="absolute inset-x-0 bottom-20 flex-row items-center justify-center gap-2 px-4">
            <Text className="text-sm font-medium text-gray-700">
              Add Info to Images
            </Text>
            <Switch
              checked={addInfoToImages}
              onCheckedChange={setAddInfoToImages}
            />
          </View>
        )}
        {checkedImages?.length > 0 ? (
          <View className="absolute inset-x-0 bottom-4 flex-row justify-center gap-6 border-gray-200 pt-4">
            <Pressable
              onPress={handleShare}
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
                  if (!checkedImages?.length) return;
                  if (addInfoToImages) {
                    await downloadInfoImagesToGallery(processedImages);
                    toast.success("Images downloaded to gallery");
                  } else {
                    await downloadImagesToGallery(
                      checkedImages?.map((img) => img.imageUrl),
                    );
                    toast.success("Images downloaded to gallery");
                  }

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
              onPress={handleWhatsAppShare}
              className="items-center rounded-full bg-slate-200 p-2 shadow-sm active:bg-gray-50"
            >
              <FontAwesome6 name="whatsapp" size={24} color="#25D366" />
            </Pressable>
          </View>
        ) : null}
      </BottomSheet>
    </View>
  );
}

export const SkeletonItemCard = () => {
  return (
    <View className="flex-row overflow-hidden rounded-lg bg-white shadow-sm">
      {/* Image skeleton */}
      <Skeleton className="h-[120px] w-[120px] rounded-l-lg" />

      {/* Content skeleton */}
      <View className="flex-1 p-3">
        {/* Title skeleton */}
        <Skeleton className="mb-2 h-5 w-3/4" />

        {/* Description skeleton - 2 lines */}
        <Skeleton className="mb-1 h-4 w-full" />
        <Skeleton className="mb-2 h-4 w-2/3" />

        {/* Price skeleton */}
        <Skeleton className="mb-2 h-6 w-24" />

        {/* Date skeleton */}
        <View className="mt-2 flex-row items-center">
          <Skeleton className="h-3 w-20" />
        </View>
      </View>
    </View>
  );
};
