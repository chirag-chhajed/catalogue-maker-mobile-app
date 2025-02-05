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
  useGetCataloguesQuery,
  useSearchCataloguesQuery,
} from "~/store/features/api/v2/catalogueApiV2";
import { useUserState } from "~/store/hooks";

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
          No catalogues exist for this term.
        </Text>
      )}
    </View>
  );
};

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [searchPage, setSearchPage] = useState(1);

  const debouncedSearchTerm = useDebounce(searchQuery, 500);
  const {
    data: cataloguesData,
    isLoading: isCataloguesLoading,
    refetch: refetchCatalogues,
  } = useGetCataloguesQuery({
    limit: 10,
    sortDir: sort,
    page,
  });

  const {
    data: searchData,
    isLoading: isSearchLoading,
    refetch: refetchSearch,
  } = useSearchCataloguesQuery(
    {
      query: debouncedSearchTerm,
      limit: 10,
      sortDir: sort,
      page: searchPage,
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

  // Remove handleEndReached as we're using buttons now
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
    } else if (cataloguesData?.pagination.hasMore) {
      setPage((prev) => prev + 1);
    }
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
      ) : !cataloguesData?.data?.length && !searchData?.data?.length ? (
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
                      setPage(1);
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
                      setPage(1);
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
                searchQuery.length > 0 ? searchData?.data : cataloguesData?.data
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
              renderItem={({ item }) => <CompactCard item={item} />}
            />
          </View>

          {/* Pagination Buttons */}
          <PaginationButtons
            page={searchQuery.length > 0 ? searchPage : page}
            hasMore={
              searchQuery.length > 0
                ? (searchData?.pagination.hasMore ?? false)
                : (cataloguesData?.pagination.hasMore ?? false)
            }
            onPrevPress={handlePrevPage}
            onNextPress={handleNextPage}
            noResults={searchQuery.length > 0 && searchData?.data?.length === 0}
          />

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
