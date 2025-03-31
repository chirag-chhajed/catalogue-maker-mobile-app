import { AntDesign } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useDebounce } from "@uidotdev/usehooks";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { useState } from "react";
import { View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import img from "~/assets/266.png";
import { CompactCard } from "~/components/CataloguePageCompactCard";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { Text } from "~/components/ui/text";
import { hasPermission } from "~/lib/role";
import {
  useGetApiV1CatalogueInfiniteQuery,
  useGetApiV1CatalogueSearchQuery,
} from "~/store/features/api/newApis";
import { useUserState } from "~/store/hooks";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<"asc" | "desc">("desc");

  const debouncedSearchTerm = useDebounce(searchQuery, 500);
  const {
    data: cataloguesData,
    isLoading: isCataloguesLoading,
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

  const insets = useSafeAreaInsets();
  const user = useUserState();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

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
      ) : !cataloguesData?.pages?.length && !searchData?.data?.length ? (
        <View className="flex-1 items-center justify-center p-4">
          <Image source={img} style={{ width: 200, height: 200 }} />
          <Text className="mb-4 text-center text-gray-600">
            No catalogs yet
          </Text>
          <Pressable className="rounded-md bg-blue-600 px-6 py-3">
            <Link
              href="/(protected)/(routes)/catalogue/create-catalog"
              className="text-center font-semibold text-white"
            >
              Create Your First catalogue
            </Link>
          </Pressable>
        </View>
      ) : (
        <View className="flex-1">
          {/* Search and Filter Section */}
          <View className="flex-row items-center justify-between p-4">
            <View className="relative mr-2 flex-1 flex-row items-center">
              <Input
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search catalogues..."
                style={{ flex: 1 }}
                className="px-4 py-2 focus:border-blue-500"
              />
              {searchQuery.length > 0 && (
                <Pressable
                  onPress={() => {
                    setSearchQuery("");
                  }}
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
                    }}
                  >
                    <Text className="font-medium">Date: Old to New</Text>
                    <DropdownMenuShortcut>
                      <AntDesign name="calendar" size={20} color="#666" />
                    </DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </View>
          </View>

          {/* Cards Section */}
          <View className="flex-1 px-4">
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
              refreshing={
                searchQuery.length > 0 ? isSearchLoading : isCataloguesLoading
              }
              renderItem={({ item }) => (
                <CompactCard item={item} sortDir={sort} />
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
            />
          </View>

          {/* Floating Action Button */}
          {hasPermission(user?.role, "create:catalogue") ? (
            <Link href="/(protected)/(routes)/catalogue/create-catalog" asChild>
              <Pressable className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-blue-600 shadow-lg">
                <AntDesign name="plus" size={24} color="white" />
              </Pressable>
            </Link>
          ) : null}
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
