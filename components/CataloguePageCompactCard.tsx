import { AntDesign, Entypo } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { View, Alert, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { toast } from "sonner-native";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { Card, CardTitle } from "~/components/ui/card";
import { Dialog, DialogContent } from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Text } from "~/components/ui/text";
import { hasPermission } from "~/lib/role";
import {
  type ImageType,
  useDeleteCatalogMutation,
  useUpdateCatalogMutation,
} from "~/store/features/api/catalogueApi";
import { catalogueApiV2 } from "~/store/features/api/v2/catalogueApiV2";
import { useAppDispatch, useUserState } from "~/store/hooks";

const pastelColors = ["#b2e0f8", "#ffd6d6", "#d6ffd6", "#fff4d6"];

type CardItem = {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  images: ImageType[];
};

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

const CardImage = ({ images }: { images: ImageType[] }) => {
  if (images.length === 0) {
    return (
      <View
        style={{
          width: 120,
          height: 120,
          backgroundColor:
            pastelColors[Math.floor(Math.random() * pastelColors.length)],
        }}
      />
    );
  }

  return (
    <View
      style={{ width: 120, height: 120 }}
      className="flex-row flex-wrap overflow-hidden"
    >
      {images.slice(0, 4).map((image) => (
        <Image
          key={image.id}
          source={{ uri: image.imageUrl }}
          placeholder={image.blurhash}
          contentFit="cover"
          style={{
            width: images.length === 1 ? 120 : 60,
            height: images.length <= 2 ? 120 : 60,
          }}
        />
      ))}
    </View>
  );
};

const UpdateCatalogueForm = ({
  item,
  isLoading,
  onSubmit,
  form,
}: {
  item: CardItem;
  isLoading: boolean;
  onSubmit: (data: z.infer<typeof schema>) => Promise<void>;
  form: ReturnType<typeof useForm<z.infer<typeof schema>>>;
}) => {
  return (
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
            }) => (
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
            )}
          />
          <Controller
            control={form.control}
            name="description"
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => (
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
            )}
          />
          <Button
            onPress={form.handleSubmit(onSubmit)}
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
  );
};

export const CompactCard = ({
  item,
  page,
  limit,
  sortDir,
}: {
  item: CardItem;
  page: number;
  limit: number;
  sortDir: "asc" | "desc";
}) => {
  console.log(page, limit, sortDir);
  const insets = useSafeAreaInsets();
  const [deleteCatalog] = useDeleteCatalogMutation();
  const [open, setOpen] = useState(false);
  const [updateCatalog, { isLoading }] = useUpdateCatalogMutation();
  const { role } = useUserState();
  const dispatch = useAppDispatch();

  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

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
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: () => {
            toast.promise(deleteCatalog({ id: item.id }).unwrap(), {
              loading: "Deleting...",
              success: () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                dispatch(
                  catalogueApiV2.util.updateQueryData(
                    "getCatalogues",
                    {
                      page,
                      limit,
                      sortDir,
                    },
                    (draft) => {
                      const index = draft.data.findIndex(
                        (cat) => cat.id === item.id,
                      );
                      if (index !== -1) {
                        // Remove the item at the found index
                        draft.data.splice(index, 1);
                      }
                    },
                  ),
                );
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
    // const hello = await updateCatalog({ ...data, id: item.id }).unwrap();
    toast.promise(updateCatalog({ ...data, id: item.id }).unwrap(), {
      success: (hello) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setOpen(false);
        dispatch(
          catalogueApiV2.util.updateQueryData(
            "getCatalogues",
            { page, limit, sortDir },
            (draft) => {
              const index = draft.data.findIndex((cat) => cat.id === item.id);
              if (index !== -1) {
                draft.data[index] = {
                  ...draft.data[index],
                  name: data.name,
                  description: data.description || "",
                };
              }
            },
          ),
        );
        return "Catalogue updated successfully";
      },
      error: "Failed to update Catalogue",
      loading: "Updating Catalogue...",
    });
  };

  return (
    <Card className="relative flex-row overflow-hidden rounded-lg bg-white shadow-sm">
      <CardImage images={item.images} />

      <Link
        href={{
          pathname: "/catalogue/[id]",
          params: { id: item.id, title: item.name },
        }}
        className="w-full flex-1"
      >
        <View className="w-full p-3">
          <CardTitle className="text-base font-bold text-gray-900">
            {item.name}
          </CardTitle>
          <Text className="text-sm text-gray-600" numberOfLines={2}>
            {item.description}
          </Text>
          <View className="mt-2 flex-row items-center">
            <AntDesign name="calendar" size={12} color="#6B7280" />
            <Text className="ml-1 text-xs text-gray-500">
              {format(new Date(item.createdAt), "dd/MM/yyyy")}
            </Text>
          </View>
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

            {hasPermission(role, "delete:catalogue") && (
              <DropdownMenuItem
                onPress={handleDelete}
                className="flex flex-row justify-between"
              >
                <Text className="font-medium">Delete</Text>
                <AntDesign name="delete" size={24} />
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-96">
          <UpdateCatalogueForm
            item={item}
            isLoading={isLoading}
            onSubmit={handleSubmit}
            form={form}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
};
