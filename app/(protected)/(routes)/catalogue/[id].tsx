import {
  openPicker,
  type Config,
} from "@baronha/react-native-multiple-image-picker";
import { AntDesign } from "@expo/vector-icons";
import BottomSheet, { BottomSheetFlashList } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import { useDebounce } from "@uidotdev/usehooks";
import { Image } from "expo-image";
import { useLocalSearchParams, router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Pressable, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Share from "react-native-share";
import { toast } from "sonner-native";

import { CompactCard } from "~/components/CatalogueItemCompactCard";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";
import { THEME_COLORS } from "~/lib/constants";
import {
  downloadImagesToCache,
  downloadImagesToGallery,
  downloadInfoImagesToGallery,
} from "~/lib/downloadImagesToCache";
import {
  useGetApiV1CatalogueByCatalogueIdInfiniteQuery,
  useGetApiV1CatalogueSearchItemsByCatalogueIdQuery,
} from "~/store/features/api/newApis";
import {
  useGetBulkImages,
  clearSharableImageGroups,
} from "~/store/features/newSharableImageSlice";
import { useAppDispatch, useDispatchImages } from "~/store/hooks";

const config: Config = {
  maxSelect: 1,
  numberOfColumn: 4,
  mediaType: "image",
  selectBoxStyle: "tick",
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

const FilterChip = ({
  active,
  onPress,
  children,
}: {
  active: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) => (
  <Pressable
    onPress={onPress}
    className={`flex-row items-center rounded-full px-4 py-2 ${
      active ? "bg-primary" : "bg-secondary/50"
    }`}
  >
    <Text
      className={active ? "text-primary-foreground" : "text-muted-foreground"}
    >
      {children}
    </Text>
  </Pressable>
);

export default function DetailsScreen() {
  const { id } = useLocalSearchParams();
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<"asc" | "desc" | null>("desc");
  const [priceSort, setPriceSort] = useState<"asc" | "desc" | null>(null);
  const debouncedSearchTerm = useDebounce(searchQuery, 500);
  const { setImages } = useDispatchImages();
  const images = useGetBulkImages();

  const {
    data,
    isLoading,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGetApiV1CatalogueByCatalogueIdInfiniteQuery(
    { catalogueId: id as string, order: sort, priceSort },
    {
      skip: !id,
    },
  );

  const {
    data: searchData,
    isLoading: isSearchLoading,
    refetch: refetchSearch,
  } = useGetApiV1CatalogueSearchItemsByCatalogueIdQuery(
    {
      catalogueId: id as string,
      search: debouncedSearchTerm,
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

  const [addInfoToImages, setAddInfoToImages] = useState(false);
  const [processedImages, setProcessedImages] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<
    "newest" | "oldest" | "expensive" | "cheapest"
  >("newest");

  useEffect(() => {
    if (!selectionMode) {
      dispatch(clearSharableImageGroups());
    }
  }, [selectionMode, dispatch]);

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
  const snapPoints = useMemo(() => ["55%"], []);

  // callbacks
  const handleSnapPress = useCallback((index: number) => {
    sheetRef.current?.snapToIndex(index);
  }, []);

  const { width } = Dimensions.get("window");
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

  type FilterType = "newest" | "oldest" | "expensive" | "cheapest";
  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    switch (filter) {
      case "newest":
        setSort("desc");
        setPriceSort(null); // Reset price sort
        break;
      case "oldest":
        setSort("asc");
        setPriceSort(null); // Reset price sort
        break;
      case "expensive":
        setPriceSort("desc");
        setSort(null); // Reset date sort
        break;
      case "cheapest":
        setPriceSort("asc");
        setSort(null); // Reset date sort
        break;
    }
  };

  return (
    <View className="flex-1">
      {isLoading ? (
        <View className="flex-1 px-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <View key={index} className="mb-2">
              <SkeletonItemCard />
            </View>
          ))}
        </View>
      ) : !data?.pages.flatMap((page) => page.items).length &&
        !searchData?.items?.length ? (
        <View className="flex-1 items-center justify-center space-y-4 p-4">
          <View className="h-24 w-24 items-center justify-center rounded-full bg-primary/10">
            <AntDesign name="inbox" size={40} color={THEME_COLORS.primary} />
          </View>
          <Text className="text-center text-muted-foreground">
            No items yet
          </Text>
          <Pressable
            onPress={pickDocImage}
            className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg"
          >
            <AntDesign
              name="plus"
              size={24}
              color={THEME_COLORS.primaryForeground}
            />
          </Pressable>
        </View>
      ) : (
        <View className="flex-1">
          {/* Search Section */}
          <View className="p-4">
            <View className="relative">
              <Input
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search items..."
                className="border-input bg-background pr-10 text-foreground"
              />
              {searchQuery.length > 0 && (
                <Pressable
                  onPress={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <AntDesign
                    name="closecircle"
                    size={20}
                    color={THEME_COLORS.mutedForeground}
                  />
                </Pressable>
              )}
            </View>

            {/* Filter Chips */}
            <View className="mt-3 flex-row flex-wrap gap-2">
              <FilterChip
                active={activeFilter === "newest"}
                onPress={() => handleFilterChange("newest")}
              >
                Newest First
              </FilterChip>
              <FilterChip
                active={activeFilter === "oldest"}
                onPress={() => handleFilterChange("oldest")}
              >
                Oldest First
              </FilterChip>
              <FilterChip
                active={activeFilter === "expensive"}
                onPress={() => handleFilterChange("expensive")}
              >
                Highest Price
              </FilterChip>
              <FilterChip
                active={activeFilter === "cheapest"}
                onPress={() => handleFilterChange("cheapest")}
              >
                Lowest Price
              </FilterChip>
            </View>

            {/* Selection Button */}
            <View className="mt-3">
              <Pressable
                onPress={() => setSelectionMode(!selectionMode)}
                className={`flex-row items-center rounded-full px-4 py-2 ${
                  selectionMode ? "bg-primary" : "bg-secondary/50"
                }`}
              >
                <Text
                  className={
                    selectionMode
                      ? "text-primary-foreground"
                      : "text-muted-foreground"
                  }
                >
                  {selectionMode ? "Cancel Selection" : "Select Items"}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Cards Section */}
          <View className="flex-1 px-4">
            <FlashList
              data={
                searchQuery.length > 0
                  ? searchData?.items
                  : data?.pages.flatMap((page) => page.items)
              }
              renderItem={({ item }) => (
                <CompactCard item={item} id={id} select={selectionMode} />
              )}
              extraData={selectionMode}
              estimatedItemSize={385}
              ItemSeparatorComponent={() => <View className="h-2" />}
              showsVerticalScrollIndicator={false}
              onRefresh={searchQuery.length > 0 ? refetchSearch : refetch}
              refreshing={searchQuery.length > 0 ? isSearchLoading : isLoading}
              onEndReached={() => {
                if (!searchQuery.length && hasNextPage && !isFetchingNextPage) {
                  fetchNextPage();
                }
              }}
            />
          </View>

          {/* FAB */}
          <Pressable
            onPress={pickDocImage}
            className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg"
          >
            <AntDesign
              name="plus"
              size={24}
              color={THEME_COLORS.primaryForeground}
            />
          </Pressable>
          {images.length > 0 ? (
            <Pressable
              onPress={() =>
                router.push(`/(protected)/(routes)/catalogue/share`)
              }
              className="absolute bottom-6 left-6 h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg"
            >
              <AntDesign
                name="sharealt"
                size={24}
                color={THEME_COLORS.primaryForeground}
              />
            </Pressable>
          ) : null}
        </View>
      )}
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
