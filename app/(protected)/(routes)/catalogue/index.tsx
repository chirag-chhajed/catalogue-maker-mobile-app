import { AntDesign, Entypo } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { FlashList } from "@shopify/flash-list";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { View, Pressable, Alert, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { hasPermission } from "~/lib/role";
import {
  useDeleteCatalogMutation,
  useGetCatalogQuery,
  useUpdateCatalogMutation,
} from "~/store/features/api/catalogueApi";
import { useUserState } from "~/store/hooks";

type CardItem = {
  id: string;
  name: string;
  description: string;
};

const pastelColors = ["#b2e0f8", "#ffd6d6", "#d6ffd6", "#fff4d6"];

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { data, refetch, isLoading } = useGetCatalogQuery();

  const cataloguesExist = (data?.length ?? 0) > 0;
  const user = useUserState();

  return (
    <View className="flex-1">
      {!cataloguesExist ? (
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
          </View>

          {/* Cards Section */}

          <View className=" flex-1 px-4">
            {data?.length > 0 ? (
              <FlashList
                data={data}
                estimatedItemSize={300}
                ItemSeparatorComponent={() => <View className="h-2" />}
                showsVerticalScrollIndicator={false}
                onRefresh={refetch}
                refreshing={isLoading}
                renderItem={({ item }) => <CompactCard item={item} />}
              />
            ) : null}
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

const CompactCard = ({ item }: { item: CardItem }) => {
  const insets = useSafeAreaInsets();

  const [deleteCatalog] = useDeleteCatalogMutation();

  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

  const [open, setOpen] = useState(false);
  const [updateCatalog, { isLoading }] = useUpdateCatalogMutation();

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
  });

  const { role } = useUserState();

  const form = useForm<z.infer<typeof schema>>({
    defaultValues: {
      name: item.name,
      description: item.description,
    },
    resolver: zodResolver(schema),
    mode: "onBlur",
  });

  const handleDelete = () => {
    Alert.alert(
      "Delete Catalogue",
      "Are you sure you want to delete this catalogue?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => {
            toast.promise(deleteCatalog({ id: item.id }).unwrap(), {
              loading: "Deleting...",
              success: () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                return "Catalogue deleted successfully";
              },
              error: "Failed to delete catalogue",
            });
          },
          style: "destructive",
        },
      ],
      { cancelable: false },
    );
  };

  const handleSubmit = async (data: z.infer<typeof schema>) => {
    toast.promise(updateCatalog({ ...data, id: item.id }).unwrap(), {
      success: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setOpen(false);
        return "Catalogue updated successfully";
      },
      error: "Failed to update Catalogue",
      loading: "Updating Catalogue...",
    });
  };

  return (
    <Card className=" relative flex-row overflow-hidden rounded-lg bg-white shadow-sm">
      <View
        style={{
          width: 100,
          height: 100,
          backgroundColor:
            pastelColors[Math.floor(Math.random() * pastelColors.length)],
        }}
      />
      <Link
        href={{
          pathname: "/catalogue/[id]",
          params: {
            id: item.id,
            title: item.name,
          },
        }}
        className="w-full flex-1 "
      >
        <View className="w-full p-3">
          <CardTitle className="text-base font-bold text-gray-900">
            {item.name}
          </CardTitle>
          <Text className="text-sm text-gray-600" numberOfLines={2}>
            {item.description}
          </Text>
        </View>
      </Link>

      {hasPermission(role, "create:catalogue") ? (
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
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-96">
          <FormProvider {...form}>
            <View className="w-full max-w-md rounded-lg bg-white shadow-sm">
              <Text className="text-2xl font-bold text-gray-800">
                Update Catalogue
              </Text>
              <Text className="mb-6 mt-2 text-sm text-gray-600">
                Update details for your Catalogue
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
                <Button
                  onPress={form.handleSubmit(handleSubmit)}
                  disabled={form.formState.isSubmitting || isLoading}
                  className="mt-4 w-full rounded-md bg-blue-600 py-3"
                >
                  <Text className="text-center font-semibold text-white">
                    Create Catalogue
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
