import { AntDesign } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useDebounce } from "@uidotdev/usehooks";
import { Link, router } from "expo-router";
import { useState } from "react";
import { View, Pressable } from "react-native";

import { CompactCard } from "~/components/CataloguePageCompactCard";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";
import { THEME_COLORS } from "~/lib/constants";
import { hasPermission } from "~/lib/role";
import {
  useGetApiV1CatalogueInfiniteQuery,
  useGetApiV1CatalogueSearchQuery,
} from "~/store/features/api/newApis";
import { useUserState } from "~/store/hooks";

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

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<"asc" | "desc">("desc");

  const debouncedSearchTerm = useDebounce(searchQuery, 500);
  const {
    data: cataloguesData,
    isLoading: isCataloguesLoading,
    isFetching,
    refetch: refetchCatalogues,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGetApiV1CatalogueInfiniteQuery({
    order: sort,
  });
  const {
    data: searchData,
    isLoading: isSearchLoading,
    refetch: refetchSearch,
  } = useGetApiV1CatalogueSearchQuery(
    {
      search: debouncedSearchTerm,
    },
    {
      skip: debouncedSearchTerm.length === 0,
    },
  );

  const user = useUserState();

  return (
    <View className="flex-1">
      {isCataloguesLoading ? (
        <View className="flex-1 px-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <View key={`skeleton-${index}`} className="mb-2">
              <SkeletonCard />
            </View>
          ))}
        </View>
      ) : !cataloguesData?.pages.flatMap((page) => page.items).length &&
        !searchData?.items?.length ? (
        <View className="flex-1 items-center justify-center gap-4 p-4">
          <View className="h-24 w-24 items-center justify-center rounded-full bg-primary/10">
            <AntDesign
              name="appstore1"
              size={40}
              color={THEME_COLORS.primary}
            />
          </View>
          <Text className="text-center text-muted-foreground">
            No catalogs yet
          </Text>
          <Link href="/(protected)/(routes)/catalogue/create-catalog" asChild>
            <Pressable className="rounded-md bg-primary px-6 py-3">
              <Text className="font-semibold text-primary-foreground">
                Create Your First catalogue
              </Text>
            </Pressable>
          </Link>
          <Pressable onPress={() => refetchCatalogues()}>
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
                placeholder="Search catalogues..."
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
            <View className="mt-3 flex-row space-x-2">
              <FilterChip
                active={sort === "desc"}
                onPress={() => setSort("desc")}
              >
                Newest First
              </FilterChip>
              <FilterChip
                active={sort === "asc"}
                onPress={() => setSort("asc")}
              >
                Oldest First
              </FilterChip>
            </View>
          </View>

          {/* Cards Section */}
          <View className="flex-1 px-4">
            <Pressable
              className="mb-4 flex-row items-center justify-between rounded-lg bg-white p-4 shadow-sm"
              onPress={() => router.push("/(protected)/(routes)/catalogue/all")}
            >
              <Text className="text-xl font-semibold">All</Text>
              <AntDesign
                name="arrowright"
                size={24}
                color={THEME_COLORS.mutedForeground}
              />
            </Pressable>
            <FlashList
              data={
                searchQuery.length > 0
                  ? searchData?.items
                  : cataloguesData?.pages.flatMap((page) => page.items)
              }
              estimatedItemSize={300}
              ItemSeparatorComponent={() => <View className="h-2" />}
              showsVerticalScrollIndicator={false}
              onRefresh={
                searchQuery.length > 0 ? refetchSearch : refetchCatalogues
              }
              refreshing={searchQuery.length > 0 ? isSearchLoading : isFetching}
              renderItem={({ item }) => (
                <CompactCard item={item} key={item.catalogueId} />
              )}
              onEndReached={() => {
                if (!searchQuery.length && hasNextPage && !isFetchingNextPage) {
                  fetchNextPage();
                }
              }}
              onEndReachedThreshold={0.5}
              ListFooterComponent={() =>
                isFetchingNextPage ? (
                  <View className="py-4">
                    <SkeletonCard />
                  </View>
                ) : null
              }
              keyExtractor={(item) => item.catalogueId}
            />
          </View>

          {/* FAB */}
          {hasPermission(user?.role, "create:catalogue") && (
            <Link href="/(protected)/(routes)/catalogue/create-catalog" asChild>
              <Pressable className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg">
                <AntDesign name="plus" size={24} color="white" />
              </Pressable>
            </Link>
          )}
        </View>
      )}
    </View>
  );
};

export default Index;

export const SkeletonCard = () => {
  return (
    <View className="mb-4 flex-row overflow-hidden rounded-lg bg-white p-3 shadow-sm">
      {/* Image skeleton */}
      <Skeleton className="h-[120px] w-[120px]" />

      {/* Content area */}
      <View className="flex-1 pl-3">
        {/* Title skeleton */}
        <Skeleton className="mb-2 h-5 w-3/4" />

        {/* Description skeletons */}
        <Skeleton className="mb-1 h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />

        {/* Date skeleton */}
        <View className="mt-3 flex-row items-center">
          <Skeleton className="h-3 w-20" />
        </View>
      </View>
    </View>
  );
};
