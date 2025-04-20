import { zodResolver } from "@hookform/resolvers/zod";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { Text, View, TextInput } from "react-native";
import ImageModal from "react-native-image-modal";
import { toast } from "sonner-native";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { THEME_COLORS } from "~/lib/constants";
import { usePostApiV1CatalogueByCatalogueIdMutation } from "~/store/features/api/newApis";
import { useGetImages } from "~/store/hooks";

export default function CreateItemForm() {
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

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      price: "",
    },
    resolver: zodResolver(schema),
  });

  const { id } = useLocalSearchParams();
  const [create, { isLoading }] = usePostApiV1CatalogueByCatalogueIdMutation();
  const images = useGetImages();
  const handleSubmit = async (data: z.infer<typeof schema>) => {
    const formData = new FormData();
    if (images[0]) {
      formData.append("file", {
        uri: images[0].uri,
        type: images[0].type,
        name: images[0].name,
      });
    }

    toast.promise(
      create({
        body: formData,
        catalogueId: id,
        name: data.name,
        description: data.description,
        price: data.price,
      }).unwrap(),
      {
        success: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.back();
          return "Item created successfully";
        },
        loading: "Creating Item...",
        error: "Failed to create Item",
      },
    );
  };

  return (
    <View className="flex-1 items-center justify-center p-6">
      <View className="mb-8 items-center">
        <ImageModal
          key={images[0]?.uri}
          resizeMode="contain"
          source={{ uri: images[0]?.uri }}
          style={{ height: 150, width: 150 }}
          renderImageComponent={({ source, resizeMode, style }) => (
            <Image
              source={source}
              style={style}
              className="rounded-lg"
              contentFit={resizeMode}
            />
          )}
        />
      </View>

      <FormProvider {...form}>
        <View className="w-full rounded-xl bg-background p-4">
          <Text className="font-mono text-2xl font-bold text-foreground">
            Create New Item
          </Text>
          <Text className="mt-2 font-mono text-sm text-muted-foreground">
            Enter details for your new item
          </Text>

          <View className="mt-6 gap-4">
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
                    onBlur={onBlur}
                    placeholder="Enter item name"
                    placeholderTextColor={THEME_COLORS.mutedForeground}
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
                  <View className="relative">
                    <Text className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-foreground">
                      $
                    </Text>
                    <TextInput
                      className="w-full rounded-lg border border-border bg-input py-2.5 pl-7 pr-4 font-mono text-foreground"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="0.00"
                      inputMode="decimal"
                      keyboardType="decimal-pad"
                      placeholderTextColor={THEME_COLORS.mutedForeground}
                    />
                  </View>
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
                    placeholder="Enter item description"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    placeholderTextColor={THEME_COLORS.mutedForeground}
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
              disabled={isLoading || form.formState.isSubmitting}
              className="mt-6 w-full rounded-lg bg-primary py-3"
            >
              <Text className="font-mono font-semibold text-primary-foreground">
                Create Item
              </Text>
            </Button>
          </View>
        </View>
      </FormProvider>
    </View>
  );
}
