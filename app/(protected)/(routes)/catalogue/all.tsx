import { AntDesign } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useDebounce } from "@uidotdev/usehooks";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { SkeletonItemCard } from "./[id]";

import { CompactCard } from "~/components/CatalogueItemCompactCard";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { THEME_COLORS } from "~/lib/constants";
import {
  useGetApiV1CatalogueAllInfiniteQuery,
  useGetApiV1CatalogueSearchItemsQuery,
} from "~/store/features/api/newApis";

const All = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchTerm = useDebounce(searchQuery, 500);
  const {
    data,
    isLoading,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGetApiV1CatalogueAllInfiniteQuery({
    order: "desc",
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
  console.log(data?.pages.flatMap((page) => page.items));
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
                <CompactCard item={item} select={false} />
              )}
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
        </View>
      )}
    </View>
  );
};

export default All;
