import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { Text, View, TextInput, Pressable, Image } from "react-native";
import * as z from "zod";

import { useCreateCatalogMutation } from "~/store/features/api";

export default function CreateCatalogForm() {
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

  const [create, { isLoading }] = useCreateCatalogMutation();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
    },
    mode: "onBlur",
  });
  const handleSubmit = async (data: z.infer<typeof schema>) => {
    try {
      const resp = await create(data).unwrap();
      console.log(resp);
      router.back();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View className="flex-1 items-center justify-center p-6">
      <View className="mb-8 items-center">
        <Image
          source={{
            uri: "https://picsum.photos/192",
          }}
          style={{ height: 192, width: 192 }}
          className="h-48 w-48"
          resizeMode="contain"
        />
      </View>
      <FormProvider {...form}>
        <View className="w-full max-w-md rounded-lg bg-white p-6 shadow-sm">
          <Text className="text-2xl font-bold text-gray-800">
            Create New Catalogue
          </Text>
          <Text className="mb-6 mt-2 text-sm text-gray-600">
            Enter details for your new Catalogue
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
            <Pressable
              onPress={form.handleSubmit(handleSubmit)}
              disabled={isLoading}
              className="mt-4 w-full rounded-md bg-blue-600 py-3"
            >
              <Text className="text-center font-semibold text-white">
                Create Catalogue
              </Text>
            </Pressable>
          </View>
        </View>
      </FormProvider>
    </View>
  );
}
