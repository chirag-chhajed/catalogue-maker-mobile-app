import {
  openPicker,
  type Config,
} from "@baronha/react-native-multiple-image-picker";
import { AntDesign, Entypo, Feather, FontAwesome6 } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { FlashList } from "@shopify/flash-list";
import { format } from "date-fns";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useLocalSearchParams, Link, router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import {
  View,
  Pressable,
  Alert,
  Dimensions,
  Platform,
  StyleSheet,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Share from "react-native-share";
import { toast } from "sonner-native";
import { z } from "zod";

import img from "~/assets/266.png";
import { Button } from "~/components/ui/button";
import { Card, CardTitle } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Dialog, DialogContent } from "~/components/ui/dialog";
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
import {
  downloadImagesToCache,
  downloadImagesToGallery,
} from "~/lib/downloadImagesToCache";
import { hasPermission } from "~/lib/role";
import {
  catalogueApi,
  type ImageType,
  useDeleteCatalogItemMutation,
  useGetCatalogItemsQuery,
  useUpdateCatalogItemMutation,
} from "~/store/features/api/catalogueApi";
import {
  addImages,
  clearItems,
  removeImages,
  toggleCheck,
  useGetCheckedImages,
  useGetImagesFromGroup,
} from "~/store/features/sharableImageSlice";
import { useAppDispatch, useDispatchImages, useUserState } from "~/store/hooks";
import BottomSheet, { BottomSheetFlashList } from "@gorhom/bottom-sheet";

// Add this type definition
type CardItem = {
  id: string;
  name: string;
  description: string | null;
  price: string | null;
  images: ImageType[];
  createdAt: Date;
};

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

export default function DetailsScreen() {
  const { id } = useLocalSearchParams();
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const { setImages } = useDispatchImages();
  const { data, isLoading, refetch } = useGetCatalogItemsQuery(
    { id },
    {
      skip: !id,
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
        />
      </View>
    );
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
      ) : !data?.items?.length ? (
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
                placeholder="The searchbar doesn't work for now"
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
                      dispatch(
                        catalogueApi.util.updateQueryData(
                          "getCatalogItems",
                          { id: id as string },
                          (data) => {
                            data.items.sort(
                              (a, b) =>
                                new Date(b.createdAt).getTime() -
                                new Date(a.createdAt).getTime(),
                            );
                          },
                        ),
                      );
                    }}
                  >
                    <Text className="font-medium">Date: New to Old</Text>
                    <DropdownMenuShortcut>
                      <AntDesign name="calendar" size={20} color="#666" />
                    </DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onPress={() => {
                      dispatch(
                        catalogueApi.util.updateQueryData(
                          "getCatalogItems",
                          { id },
                          (data) => {
                            data.items.sort(
                              (a, b) =>
                                new Date(a.createdAt).getTime() -
                                new Date(b.createdAt).getTime(),
                            );
                          },
                        ),
                      );
                    }}
                  >
                    <Text className="font-medium">Date: Old to New</Text>
                    <DropdownMenuShortcut>
                      <AntDesign name="calendar" size={20} color="#666" />
                    </DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onPress={() => {
                      dispatch(
                        catalogueApi.util.updateQueryData(
                          "getCatalogItems",
                          { id },
                          (data) => {
                            data.items.sort((a, b) => b.price - a.price);
                          },
                        ),
                      );
                    }}
                  >
                    <Text className="font-medium">Price: High to Low</Text>
                    <DropdownMenuShortcut>
                      <AntDesign name="arrowup" size={20} color="#666" />
                    </DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onPress={() => {
                      dispatch(
                        catalogueApi.util.updateQueryData(
                          "getCatalogItems",
                          { id },
                          (data) => {
                            data.items.sort((a, b) => a.price - b.price);
                          },
                        ),
                      );
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
          {/* Cards Section */}
          <View className="flex-1 px-4">
            <FlashList
              data={data?.items}
              renderItem={({ item }) => (
                <CompactCard item={item} id={id} select={selectionMode} />
              )}
              extraData={selectionMode}
              estimatedItemSize={385}
              ItemSeparatorComponent={() => <View className="h-2" />}
              showsVerticalScrollIndicator={false}
              onRefresh={refetch}
              refreshing={isLoading}
            />
          </View>
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
        {checkedImages?.length > 0 ? (
          <View className="absolute inset-x-0 bottom-4 flex-row justify-center gap-6 border-gray-200 pt-4">
            <Pressable
              onPress={async () => {
                try {
                  const cachedImages = await downloadImagesToCache(
                    checkedImages?.map((image) => image.imageUrl),
                  );
                  Share.open({ urls: cachedImages });
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
                    checkedImages?.map((img) => img.imageUrl),
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
                    checkedImages?.map((img) => img.imageUrl),
                  );

                  await Share.shareSingle({
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
          </View>
        ) : null}
      </BottomSheet>
    </View>
  );
}

const CompactCard = ({
  item,
  id,
  select,
}: {
  item: CardItem;
  id: string;
  select: boolean;
}) => {
  const insets = useSafeAreaInsets();

  const [deleteItem] = useDeleteCatalogItemMutation();
  const [updateItem, { isLoading }] = useUpdateCatalogItemMutation();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(false);
  const dispatch = useAppDispatch();

  const handleCheck = (checked: boolean) => {
    if (checked) {
      dispatch(
        addImages({
          id,
          itemId: item.id,
          images: item.images.map((img) => ({
            id: img.id,
            imageUrl: img.imageUrl,
            blurhash: img.blurhash,
            checked: true,
          })),
        }),
      );
    } else {
      dispatch(
        removeImages({
          id,
          itemId: item.id,
        }),
      );
    }
    setChecked(checked);
  };
  useEffect(() => {
    if (!select) {
      setChecked(false);
    }
  }, [select]);

  const schema = z.object({
    name: z
      .string()
      .trim()
      .min(1, "Name must be minimum of 1 character")
      .max(100, "Name must be maximum of 100 characters"),
    description: z
      .string()
      .trim()
      .max(500, "Description must be maximum of 500 characters")
      .optional(),
    price: z.coerce
      .number({ message: "Enter a valid price" })
      .positive("Price must be greater than 0")
      .multipleOf(0.01, "Price can only have up to 2 decimal places")
      .min(0.01, "Minimum price is 0.01"),
  });
  const { role } = useUserState();
  const form = useForm<z.infer<typeof schema>>({
    defaultValues: {
      name: item.name,
      description: item.description,
      price: item.price,
    },
    resolver: zodResolver(schema),
  });

  const handleDelete = () => {
    Alert.alert(
      "Delete Catalogue Item",
      "Are you sure you want to delete?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            toast.promise(deleteItem({ id: item.id }).unwrap(), {
              loading: "Deleting...",
              success: () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                return "Item deleted successfully";
              },
              error: "Failed to delete Item",
            });
          },
        },
      ],
      { cancelable: false },
    );
  };

  const handleSubmit = async (data: z.infer<typeof schema>) => {
    toast.promise(
      updateItem({ id: item.id, catalogueId: id, ...data }).unwrap(),
      {
        success: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setOpen(false);
          return "Item updated successfully";
        },
        error: "Failed to update Item",
        loading: "Updating Item...",
      },
    );
  };

  return (
    <Card className="flex-row overflow-hidden rounded-lg bg-white shadow-sm">
      <Image
        style={{ width: 120, height: 120 }}
        source={item.images[0].imageUrl}
        contentFit="cover"
        className="rounded-l-lg"
        placeholder={item.images[0].blurhash}
      />

      <View className="flex-1 p-3">
        <Link
          href={{
            pathname: "/(protected)/(routes)/details/[id]",
            params: {
              id,
              title: item.name,
              catalogueId: item.id,
            },
          }}
        >
          <CardTitle
            className="mb-1 text-base font-bold text-gray-900 underline"
            numberOfLines={1}
          >
            {item.name}
          </CardTitle>
        </Link>
        <Text
          className="mb-1 flex-1 text-sm text-gray-600"
          numberOfLines={2}
          style={{ lineHeight: 20 }}
        >
          {item.description}
        </Text>

        <Text
          className="text-base font-semibold text-blue-600"
          numberOfLines={1}
        >
          ₹ {item.price.toLocaleString()}
        </Text>
        <View className="mt-2 flex-row items-center">
          <AntDesign name="calendar" size={12} color="#6B7280" />
          <Text className="ml-1 text-xs text-gray-500">
            {format(new Date(item.createdAt), "dd/MM/yyyy")}
          </Text>
        </View>
      </View>

      {hasPermission(role, "update:catalogue") ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="absolute right-2 top-2 p-1"
              size="icon"
            >
              <Entypo name="dots-three-vertical" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent insets={contentInsets} className="w-56">
            <DropdownMenuItem
              onPress={() => setOpen(true)}
              className="flex flex-row justify-between"
            >
              <Text className="font-medium">Edit</Text>
              <AntDesign name="edit" size={24} />
            </DropdownMenuItem>

            {hasPermission(role, "delete:catalogue") ? (
              <DropdownMenuItem
                onPress={() => handleDelete()}
                className="flex flex-row justify-between"
              >
                <Text className="font-medium">Delete</Text>
                <AntDesign name="delete" size={24} />
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem
              onPress={async () => {
                try {
                  const images = await downloadImagesToCache(
                    item.images.map((img) => img.imageUrl),
                  );

                  Share.open({
                    urls: images,
                    title:
                      "Hello, this photos were shared from React Native Share",
                  });
                } catch (error) {
                  console.error(error);
                }
              }}
              className="flex flex-row justify-between"
            >
              <Text className="font-medium">Share Photos</Text>
              <AntDesign name="sharealt" size={24} />
            </DropdownMenuItem>
            <DropdownMenuItem
              onPress={async () => {
                try {
                  const images = await downloadImagesToCache(
                    item.images.map((img) => img.imageUrl),
                  );
                  await Share.shareSingle({
                    title: "Title",
                    urls: images,
                    social: Share.Social.WHATSAPP,
                  });
                } catch (err) {
                  console.error(err);
                }
              }}
              className="flex flex-row justify-between"
            >
              <Text className="font-medium">Whatsapp</Text>
              <FontAwesome6 name="whatsapp" size={24} />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
      {select ? (
        <Checkbox
          className="absolute bottom-2 right-2 p-2"
          checked={checked}
          onCheckedChange={handleCheck}
        />
      ) : null}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-96">
          <FormProvider {...form}>
            <View className="w-full max-w-md rounded-lg bg-white shadow-sm">
              <Text className="text-2xl font-bold text-gray-800">
                Update Catalogue Item
              </Text>
              <Text className="mb-6 mt-2 text-sm text-gray-600">
                Update details for your Item
              </Text>
              <View>
                <Controller
                  control={form.control}
                  name="name"
                  render={({
                    field: { onChange, onBlur, value },
                    fieldState: { error },
                  }) => {
                    return (
                      <View className="mb-4">
                        <Text className="mb-1 text-sm font-medium text-gray-700">
                          Name
                        </Text>
                        <TextInput
                          className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500"
                          value={value}
                          onChangeText={onChange}
                          onChange={onBlur}
                          placeholder="Enter Catalogue name"
                        />
                        <Text className="mb-1 text-sm text-red-500">
                          {error?.message}
                        </Text>
                      </View>
                    );
                  }}
                />
                <Controller
                  control={form.control}
                  name="description"
                  render={({
                    field: { onChange, onBlur, value },
                    fieldState: { error },
                  }) => {
                    return (
                      <View className="mb-4">
                        <Text className="mb-1 text-sm font-medium text-gray-700">
                          Description
                        </Text>
                        <TextInput
                          className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          placeholder="Enter Catalogue description"
                          multiline
                          numberOfLines={3}
                          textAlignVertical="top"
                        />
                        <Text className="mb-1 text-sm text-red-500">
                          {error?.message}
                        </Text>
                      </View>
                    );
                  }}
                />
                <Controller
                  control={form.control}
                  name="price"
                  render={({
                    field: { onChange, onBlur, value },
                    fieldState: { error },
                  }) => (
                    <View className="mb-2">
                      <Text className="mb-1 text-sm font-medium text-gray-700">
                        Price
                      </Text>
                      <TextInput
                        className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="Enter price"
                        keyboardType="numeric"
                      />
                      <Text className="mb-1 text-sm text-red-500">
                        {error?.message}
                      </Text>
                    </View>
                  )}
                />
                <Button
                  onPress={form.handleSubmit(handleSubmit)}
                  disabled={form.formState.isSubmitting || isLoading}
                  className="mt-4 w-full rounded-md bg-blue-600 py-3"
                >
                  <Text className="text-center font-semibold text-white">
                    Update Catalogue
                  </Text>
                </Button>
              </View>
            </View>
          </FormProvider>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 200,
  },
  contentContainer: {
    backgroundColor: "white",
  },
  itemContainer: {
    padding: 6,
    margin: 6,
    backgroundColor: "#eee",
  },
});
