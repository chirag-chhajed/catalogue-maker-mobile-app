import { AntDesign, Entypo, FontAwesome6 } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { View, Alert } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Share from "react-native-share";
import { toast } from "sonner-native";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { Card, CardTitle } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Dialog, DialogContent } from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Text } from "~/components/ui/text";
import { downloadImagesToCache } from "~/lib/downloadImagesToCache";
import { hasPermission } from "~/lib/role";
import {
  useDeleteApiV1CatalogueByCatalogueIdAndItemIdMutation,
  usePutApiV1CatalogueByCatalogueIdAndItemIdMutation,
} from "~/store/features/api/newApis";
import {
  addSharableImageGroup,
  removeSharableImageGroup,
} from "~/store/features/newSharableImageSlice";
import { useAppDispatch, useUserState } from "~/store/hooks";

type CardItem = {
  itemId: string;
  catalogueId: string;
  orgId: string;
  name: string;
  description?: string;
  price: number;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
  image: {
    imageUrl: string;
    blurhash?: string;
    uploadedAt?: number;
  };
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
  price: z.coerce
    .number({ message: "Enter a valid price" })
    .positive("Price must be greater than 0")
    .multipleOf(0.01, "Price can only have up to 2 decimal places")
    .min(0.01, "Minimum price is 0.01"),
});

export const CompactCard = ({
  item,
  select,
}: {
  item: CardItem;
  select: boolean;
}) => {
  const insets = useSafeAreaInsets();

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
        addSharableImageGroup({
          itemId: item.itemId,
          name: item.name,
          catalogueId: item.catalogueId,
          description: item.description,
          price: item.price,
          image: {
            imageUrl: item.image.imageUrl,
            blurhash: item.image.blurhash,
          },
        }),
      );
    } else {
      dispatch(removeSharableImageGroup({ itemId: item.itemId }));
    }
    setChecked(checked);
  };
  const [deleteItem] = useDeleteApiV1CatalogueByCatalogueIdAndItemIdMutation();
  const [updateItem, { isLoading }] =
    usePutApiV1CatalogueByCatalogueIdAndItemIdMutation();
  useEffect(() => {
    if (!select) {
      setChecked(false);
    }
  }, [select]);

  const { role } = useUserState();
  const form = useForm<z.infer<typeof schema>>({
    defaultValues: {
      name: item.name,
      description: item.description || "",
      price: item.price || 0,
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
            toast.promise(
              deleteItem({
                itemId: item.itemId,
                catalogueId: item.catalogueId,
              }).unwrap(),
              {
                loading: "Deleting...",
                success: () => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  return "Item deleted successfully";
                },
                error: "Failed to delete Item",
              },
            );
          },
        },
      ],
      { cancelable: false },
    );
  };

  const handleSubmit = async (data: z.infer<typeof schema>) => {
    toast.promise(
      updateItem({
        itemId: item.itemId,
        catalogueId: item.catalogueId,
        body: {
          ...data,
        },
      }).unwrap(),
      {
        loading: "Updating...",
        success: () => {
          return "Item updated successfully";
        },
        error: () => {
          return "Failed to update Item";
        },
      },
    );
  };

  return (
    <Card className="flex-row overflow-hidden rounded-lg bg-white shadow-sm">
      <Image
        style={{ width: 120, height: 120 }}
        source={item.image.imageUrl}
        contentFit="cover"
        className="rounded-l-lg"
        placeholder={item.image.blurhash}
        cachePolicy="disk"
      />

      <View className="flex-1 p-3">
        <Link
          href={{
            pathname: "/(protected)/(routes)/catalogue/[catalogueId.itemId]",
            params: {
              catalogueId: item.catalogueId,
              itemId: item.itemId,
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
                  const images = await downloadImagesToCache([
                    item.image.imageUrl,
                  ]);

                  Share.open({
                    title: item.name,
                    urls: images,
                    message: `${item.name}\n\n${item.description}\n\nPrice: ${item.price}`,
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
                  const images = await downloadImagesToCache([
                    item.image.imageUrl,
                  ]);
                  await Share.shareSingle({
                    urls: images,
                    social: Share.Social.WHATSAPP,
                    message: `${item.name}\n\n${item.description}\n\nPrice: ${item.price}`,
                    title: item.name,
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
          hitSlop={30}
        />
      ) : null}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-96">
          <FormProvider {...form}>
            <View className="w-full rounded-xl bg-background p-4">
              <Text className="font-mono text-2xl font-bold text-foreground">
                Update Catalogue Item
              </Text>
              <Text className="mt-2 font-mono text-sm text-muted-foreground">
                Update details for your Item
              </Text>
              <View className="mt-6 space-y-4">
                <Controller
                  control={form.control}
                  name="name"
                  render={({
                    field: { onChange, onBlur, value },
                    fieldState: { error },
                  }) => (
                    <View>
                      <Text className="mb-2 font-mono text-sm font-medium text-foreground">
                        Name
                      </Text>
                      <TextInput
                        className="w-full rounded-lg border border-border bg-input px-4 py-2.5 font-mono text-foreground"
                        value={value}
                        onChangeText={onChange}
                        onChange={onBlur}
                        placeholder="Enter Catalogue name"
                      />
                      {error?.message && (
                        <Text className="mt-1 font-mono text-sm text-destructive">
                          {error.message}
                        </Text>
                      )}
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
                    <View>
                      <Text className="mb-2 font-mono text-sm font-medium text-foreground">
                        Description
                      </Text>
                      <TextInput
                        className="w-full rounded-lg border border-border bg-input px-4 py-2.5 font-mono text-foreground"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="Enter Catalogue description"
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                      />
                      {error?.message && (
                        <Text className="mt-1 font-mono text-sm text-destructive">
                          {error.message}
                        </Text>
                      )}
                    </View>
                  )}
                />
                <Controller
                  control={form.control}
                  name="price"
                  render={({
                    field: { onChange, onBlur, value },
                    fieldState: { error },
                  }) => (
                    <View>
                      <Text className="mb-2 font-mono text-sm font-medium text-foreground">
                        Price
                      </Text>
                      <TextInput
                        className="w-full rounded-lg border border-border bg-input px-4 py-2.5 font-mono text-foreground"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="Enter price"
                        keyboardType="decimal-pad"
                        inputMode="decimal"
                      />
                      {error?.message && (
                        <Text className="mt-1 font-mono text-sm text-destructive">
                          {error.message}
                        </Text>
                      )}
                    </View>
                  )}
                />
                <Button
                  onPress={form.handleSubmit(handleSubmit)}
                  disabled={form.formState.isSubmitting || isLoading}
                  className="mt-6 w-full rounded-lg bg-primary py-3"
                >
                  <Text className="font-mono font-semibold text-primary-foreground">
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
