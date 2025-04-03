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
import { THEME_COLORS } from "~/lib/constants";
import { hasPermission } from "~/lib/role";
import {
  useDeleteCatalogMutation,
  useUpdateCatalogMutation,
} from "~/store/features/api/catalogueApi";
import { useUserState } from "~/store/hooks";

type ImageType = {
  imageUrl: string;
  blurhash?: string;
  imageId: string;
  catalogueId: string;
  itemId: string;
};

type CardItem = {
  catalogueId: string;
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
      <View className="h-[120px] w-[120px] items-center justify-center bg-secondary/50">
        <AntDesign
          name="picture"
          size={30}
          color={THEME_COLORS.mutedForeground}
        />
      </View>
    );
  }

  return (
    <View className="h-[120px] w-[120px] overflow-hidden">
      <View className="flex-row flex-wrap">
        {images.slice(0, 4).map((image, index) => (
          <Image
            key={image.imageId}
            source={{ uri: image.imageUrl }}
            placeholder={image.blurhash}
            style={{
              height: images.length === 1 ? 120 : images.length <= 2 ? 120 : 60,
              width: images.length === 1 ? 120 : images.length <= 2 ? 60 : 60,
            }}
          />
        ))}
      </View>
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

export const CompactCard = ({ item }: { item: CardItem }) => {
  const insets = useSafeAreaInsets();
  const [deleteCatalog] = useDeleteCatalogMutation();
  const [open, setOpen] = useState(false);
  const [updateCatalog, { isLoading }] = useUpdateCatalogMutation();
  const { role } = useUserState();
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
            toast.promise(deleteCatalog({ id: item.catalogueId }).unwrap(), {
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
    // const hello = await updateCatalog({ ...data, id: item.id }).unwrap();
    toast.promise(updateCatalog({ ...data, id: item.catalogueId }).unwrap(), {
      success: (hello) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setOpen(false);

        return "Catalogue updated successfully";
      },
      error: "Faisled to update Catalogue",
      loading: "Updating Catalogue...",
    });
  };

  return (
    <Card className="overflow-hidden border-none bg-card/50 backdrop-blur-sm">
      <View className="flex-row">
        <CardImage images={item.images} />

        <Link
          href={{
            pathname: "/catalogue/[id]",
            params: { id: item.catalogueId, title: item.name },
          }}
          className="flex-1"
        >
          <View className="flex-1 p-3">
            <CardTitle className="text-base font-bold text-foreground">
              {item.name}
            </CardTitle>
            <Text
              className="mt-1 text-sm text-muted-foreground"
              numberOfLines={2}
            >
              {item.description}
            </Text>
            <View className="mt-2 flex-row items-center">
              <AntDesign
                name="calendar"
                size={12}
                color={THEME_COLORS.mutedForeground}
              />
              <Text className="ml-1 text-xs text-muted-foreground">
                {format(new Date(item.createdAt), "dd/MM/yyyy")}
              </Text>
            </View>
          </View>
        </Link>

        {hasPermission(role, "create:catalogue") && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="absolute right-2 top-2 h-8 w-8 rounded-full p-0"
                size="icon"
              >
                <Entypo
                  name="dots-three-vertical"
                  color={THEME_COLORS.mutedForeground}
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent insets={contentInsets} className="w-56">
              <DropdownMenuItem
                onPress={() => setOpen(true)}
                className="flex-row items-center justify-between py-2"
              >
                <Text className="text-foreground">Edit</Text>
                <AntDesign
                  name="edit"
                  size={18}
                  color={THEME_COLORS.mutedForeground}
                />
              </DropdownMenuItem>

              {hasPermission(role, "delete:catalogue") && (
                <DropdownMenuItem
                  onPress={handleDelete}
                  className="flex-row items-center justify-between py-2"
                >
                  <Text className="text-destructive">Delete</Text>
                  <AntDesign
                    name="delete"
                    size={18}
                    color={THEME_COLORS.destructive}
                  />
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="bg-background p-0">
            <UpdateCatalogueForm
              item={item}
              isLoading={isLoading}
              onSubmit={handleSubmit}
              form={form}
            />
          </DialogContent>
        </Dialog>
      </View>
    </Card>
  );
};
