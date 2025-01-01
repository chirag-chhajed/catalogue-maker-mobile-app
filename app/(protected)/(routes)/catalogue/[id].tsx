import {
  openPicker,
  type Config,
} from "@baronha/react-native-multiple-image-picker";
import { AntDesign, Entypo, FontAwesome6 } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { FlashList } from "@shopify/flash-list";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useLocalSearchParams, Link, router } from "expo-router";
import { useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { View, Pressable, Alert } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Share from "react-native-share";
import { toast } from "sonner-native";
import { z } from "zod";

import img from "~/assets/266.png";
import { Button } from "~/components/ui/button";
import { Card, CardTitle } from "~/components/ui/card";
import { Dialog, DialogContent } from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { downloadImagesToCache } from "~/lib/downloadImagesToCache";
import { hasPermission } from "~/lib/role";
import {
  type ImageType,
  useDeleteCatalogItemMutation,
  useGetCatalogItemsQuery,
  useUpdateCatalogItemMutation,
} from "~/store/features/api/catalogueApi";
import { useDispatchImages, useUserState } from "~/store/hooks";

// Add this type definition
type CardItem = {
  id: string;
  name: string;
  description: string | null;
  price: string | null;
  images: ImageType[];
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

  const itemsExist = data?.items.length > 0;

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

  return (
    <View className="flex-1">
      {!itemsExist ? (
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
                placeholder="Search catalogues..."
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
                  <DropdownMenuItem>
                    <Text className="font-medium">Date: New to Old</Text>
                    <DropdownMenuShortcut>
                      <AntDesign name="calendar" size={20} color="#666" />
                    </DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Text className="font-medium">Date: Old to New</Text>
                    <DropdownMenuShortcut>
                      <AntDesign name="calendar" size={20} color="#666" />
                    </DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Text className="font-medium">Price: High to Low</Text>
                    <DropdownMenuShortcut>
                      <AntDesign name="arrowup" size={20} color="#666" />
                    </DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Text className="font-medium">Price: Low to High</Text>
                    <DropdownMenuShortcut>
                      <AntDesign name="arrowdown" size={20} color="#666" />
                    </DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </View>
          </View>

          {/* Cards Section */}
          <View className="flex-1 px-4">
            <FlashList
              data={data?.items}
              renderItem={({ item }) => <CompactCard item={item} id={id} />}
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
    </View>
  );
}

const CompactCard = ({ item, id }: { item: CardItem; id: string }) => {
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
        style={{ width: 100, height: 100 }}
        source={item.images[0].imageUrl}
        contentFit="cover"
        className="rounded-l-lg"
        placeholder={item.images[0].blurhash}
      />
      <Link
        href={{
          pathname: "/(protected)/(routes)/details/[id]",
          params: {
            id,
            title: item.name,
            catalogueId: item.id,
          },
        }}
        className="min-w-0 flex-1"
      >
        <View className="flex-1 p-3">
          <CardTitle
            className="mb-1 text-base font-bold text-gray-900"
            numberOfLines={1}
          >
            {item.name}
          </CardTitle>

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
            ₹{item.price.toLocaleString()}
          </Text>
        </View>
      </Link>
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
