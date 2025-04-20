import { AntDesign } from "@expo/vector-icons";
import BottomSheet from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import { useDebounce } from "@uidotdev/usehooks";
import * as Haptics from "expo-haptics";
import { useRef, useMemo, useCallback, useState, useEffect } from "react";
import { Alert, Pressable, View } from "react-native";
import { toast } from "sonner-native";
import { z } from "zod";

import { SkeletonItemCard } from "./[id]";

import { CompactCard } from "~/components/CatalogueItemCompactCard";
import { BulkTransferSheet } from "~/components/bulk-transfer-sheet";
import { BulkUpdateSheet } from "~/components/bulk-update-sheet";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { THEME_COLORS } from "~/lib/constants";
import { cn } from "~/lib/utils";
import {
  useDeleteApiV1CatalogueBulkDeleteItemsMutation,
  useGetApiV1CatalogueAllInfiniteQuery,
  useGetApiV1CatalogueSearchItemsQuery,
  usePostApiV1CatalogueBulkTransferItemsMutation,
  usePostApiV1CatalogueBulkUpdatePricesMutation,
} from "~/store/features/api/newApis";
import {
  clearSharableImageGroups,
  useGetBulkImages,
  useGetBulkItems,
} from "~/store/features/newSharableImageSlice";
import { useAppDispatch } from "~/store/hooks";
import { router } from "expo-router";

const priceUpdateSchema = z.object({
  mode: z.enum(["increase", "decrease"]),
  type: z.enum(["percentage", "absolute"]),
  value: z
    .string()
    .min(1, "Value is required")
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Must be a positive number",
    }),
});

type PriceUpdateForm = z.infer<typeof priceUpdateSchema>;

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
    className={cn(
      "flex-row items-center rounded-full px-4 py-2",
      active ? "bg-primary" : "bg-secondary/50",
    )}
  >
    <Text
      className={cn(
        "text-foreground",
        active ? "text-primary-foreground" : "text-muted-foreground",
      )}
    >
      {children}
    </Text>
  </Pressable>
);
const All = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<"asc" | "desc" | null>("desc");
  const [priceSort, setPriceSort] = useState<"asc" | "desc" | null>(null);
  const debouncedSearchTerm = useDebounce(searchQuery, 500);
  const dispatch = useAppDispatch();
  const images = useGetBulkImages();
  const items = useGetBulkItems();
  const {
    data,
    isFetching,
    isLoading,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGetApiV1CatalogueAllInfiniteQuery({
    order: sort,
    priceSort,
  });

  const {
    data: searchData,
    isLoading: isSearchLoading,
    refetch: refetchSearch,
  } = useGetApiV1CatalogueSearchItemsQuery(
    {
      search: debouncedSearchTerm,
    },
    {
      skip: debouncedSearchTerm.length === 0,
    },
  );
  const [selectionMode, setSelectionMode] = useState(false);

  const [bulkAction, setBulkAction] = useState<"transfer" | "price">("price");
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => [400], []);
  const [updatePrices] = usePostApiV1CatalogueBulkUpdatePricesMutation();
  const [deleteItems] = useDeleteApiV1CatalogueBulkDeleteItemsMutation();
  const [transferItems] = usePostApiV1CatalogueBulkTransferItemsMutation();
  const [activeFilter, setActiveFilter] = useState<
    "newest" | "oldest" | "expensive" | "cheapest"
  >("newest");
  useEffect(() => {
    if (!selectionMode) {
      dispatch(clearSharableImageGroups());
    }
  }, [selectionMode, dispatch]);
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

  // callbacks
  const handleSnapPress = useCallback(() => {
    if (sheetRef.current) {
      sheetRef.current.snapToIndex(0);
    } else {
      console.log("No sheet ref");
    }
  }, []);
  const onCopyToCatalogue = (data: PriceUpdateForm) => {
    toast.promise(
      updatePrices({
        body: {
          items,
          operation: "clone",
          direction: data.mode,
          mode: data.type,
          value: Number(data.value),
        },
      }).unwrap(),
      {
        loading: "Cloning...",
        success: (result) => {
          sheetRef.current?.close();
          setSelectionMode(false);
          return "Cloned";
        },
        error: (error) => {
          console.log(error);
          return "Error";
        },
      },
    );
  };
  const onUpdateExisting = (data: PriceUpdateForm) => {
    toast.promise(
      updatePrices({
        body: {
          items,
          operation: "update",
          direction: data.mode,
          mode: data.type,
          value: Number(data.value),
        },
      }).unwrap(),
      {
        loading: "Updating...",
        success: (result) => {
          sheetRef.current?.close();
          setSelectionMode(false);
          return "Updated";
        },
        error: (error) => {
          console.log(error);
          return "Error";
        },
      },
    );
  };
  const handleDeleteItems = () => {
    Alert.alert(
      "Delete Items",
      "Are you sure you want to delete these items?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: () => {
            toast.promise(
              deleteItems({
                body: {
                  items,
                },
              }).unwrap(),
              {
                loading: "Deleting",
                success: (result) => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setSelectionMode(false);
                  return "Deleted";
                },
                error: (error) => {
                  return "Error";
                },
              },
            );
          },
        },
      ],
    );
  };

  const handleTransferItems = (selected: "transfer" | "clone") => {
    toast.promise(
      transferItems({
        body: {
          items,
          operation: selected,
        },
      }).unwrap(),
      {
        loading: `${selected === "transfer" ? "Transferring" : "Cloning"}`,
        success: (result) => {
          setSelectionMode(false);
          return `${selected === "transfer" ? "Transferred" : "Cloned"} Successfully`;
        },
        error: () => {
          return `${selected === "transfer" ? "Transfer" : "Clone"} Failed`;
        },
      },
    );
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
          <Pressable onPress={() => refetch()}>
            <Text className="text-center text-muted-foreground">Refresh</Text>
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

              {/* Bulk Action Buttons */}
              {images.length > 0 && (
                <View className="mt-3 flex-row gap-2">
                  <Pressable
                    onPress={handleDeleteItems}
                    className="flex-1 flex-row items-center justify-center gap-2 rounded-full bg-destructive px-4 py-2"
                  >
                    <AntDesign name="delete" size={16} color="white" />
                    <Text className="text-primary-foreground">
                      Delete ({images.length})
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      setBulkAction("transfer");
                      handleSnapPress();
                    }}
                    className="flex-1 flex-row items-center justify-center gap-2 rounded-full bg-primary px-4 py-2"
                  >
                    <AntDesign name="swap" size={16} color="white" />
                    <Text className="text-primary-foreground">Transfer</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      setBulkAction("price");
                      handleSnapPress();
                    }}
                    className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-primary/90 px-4 py-3 shadow-sm active:opacity-90"
                  >
                    <View className="flex-row items-center gap-2">
                      <AntDesign name="edit" size={18} color="white" />
                      <Text className="font-medium text-primary-foreground">
                        Price
                      </Text>
                    </View>
                  </Pressable>
                </View>
              )}
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
                <CompactCard item={item} select={selectionMode} />
              )}
              estimatedItemSize={385}
              extraData={selectionMode}
              ItemSeparatorComponent={() => <View className="h-2" />}
              showsVerticalScrollIndicator={false}
              onRefresh={searchQuery.length > 0 ? refetchSearch : refetch}
              refreshing={searchQuery.length > 0 ? isSearchLoading : isFetching}
              onEndReached={() => {
                if (!searchQuery.length && hasNextPage && !isFetchingNextPage) {
                  fetchNextPage();
                }
              }}
            />
          </View>
        </View>
      )}
      {images.length > 0 ? (
        <Pressable
          onPress={() => router.push(`/(protected)/(routes)/catalogue/share`)}
          className="absolute bottom-6 left-6 h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg"
        >
          <AntDesign
            name="sharealt"
            size={24}
            color={THEME_COLORS.primaryForeground}
          />
        </Pressable>
      ) : null}
      <BottomSheet
        ref={sheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        index={-1}
      >
        {bulkAction === "price" ? (
          <BulkUpdateSheet
            onCopyToCatalogue={onCopyToCatalogue}
            onUpdateExisting={onUpdateExisting}
          />
        ) : (
          <BulkTransferSheet onPress={handleTransferItems} />
        )}
      </BottomSheet>
    </View>
  );
};

export default All;
