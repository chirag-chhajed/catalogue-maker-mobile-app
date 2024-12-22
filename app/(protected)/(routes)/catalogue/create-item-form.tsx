import { zodResolver } from "@hookform/resolvers/zod";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { Text, View, TextInput, Pressable, ScrollView } from "react-native";
import { toast } from "sonner-native";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { useCreateCatalogItemMutation } from "~/store/features/api";
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

  const [create, { isLoading }] = useCreateCatalogItemMutation();
  const images = useGetImages();
  console.log(isLoading, "loading");
  const handleSubmit = async (data: z.infer<typeof schema>) => {
    console.log("submitting", data);
    const formData = new FormData();
    for (const image of images) {
      formData.append("images", image);
    }
    formData.append("name", data.name);
    formData.append("description", data.description || "");
    formData.append("price", data.price);

    toast.promise(create({ id, formData }), {
      success: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.back();
        return "Item created successfully";
      },
      loading: "Creating Item...",
      error: "Failed to create Item",
    });
  };
  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="flex-1 items-center justify-center p-6">
        {/* Photo Grid */}
        <View className="mb-8 w-full flex-row flex-wrap justify-center gap-2">
          {images.map((url, index) => (
            <Image
              key={url.uri}
              source={url.uri}
              style={{ height: 125, width: 125 }}
              className="rounded-lg"
              contentFit="cover"
            />
          ))}
        </View>

        <FormProvider {...form}>
          <View className="w-full max-w-md rounded-lg bg-white p-6 shadow-sm">
            <Text className="text-2xl font-bold text-gray-800">
              Create New Item
            </Text>
            <Text className="mb-6 mt-2 text-sm text-gray-600">
              Enter details for your new item
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
                      onBlur={onBlur}
                      placeholder="Enter item name"
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
                  <View className="mb-2">
                    <Text className="mb-1 text-sm font-medium text-gray-700">
                      Description
                    </Text>
                    <TextInput
                      className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="Enter item description"
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
                className="di mt-4 w-full rounded-md bg-blue-600 py-3 disabled:bg-gray-400"
              >
                <Text className="text-center font-semibold text-white">
                  Create Item
                </Text>
              </Button>
            </View>
          </View>
        </FormProvider>
      </View>
    </ScrollView>
  );
}
