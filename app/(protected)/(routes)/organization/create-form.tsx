import { zodResolver } from "@hookform/resolvers/zod";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { Text, View, TextInput } from "react-native";
import { toast } from "sonner-native";
import * as z from "zod";

import { Button } from "~/components/ui/button";
import { useCreateOrgMutation } from "~/store/features/api";

export default function CreateForm() {
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
  const [create, { isLoading }] = useCreateOrgMutation();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
    },
    mode: "onBlur",
  });

  const handleSubmit = async (data: z.infer<typeof schema>) => {
    toast.promise(create(data).unwrap(), {
      loading: "Creating organization...",
      success: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.replace("/(protected)/(routes)/organization");
        return "Organization created successfully";
      },
      error: "Failed to create organization",
    });
  };

  return (
    <View className="flex-1 items-center justify-center p-6">
      {/* Placeholder Image */}
      <View className="mb-8 items-center">
        <Image
          source={"https://picsum.photos/192"}
          style={{ height: 192, width: 192 }}
          className="h-48 w-48"
          contentFit="cover"
        />
      </View>

      {/* Form Container */}
      <FormProvider {...form}>
        <View className="w-full max-w-md rounded-lg bg-white p-6 shadow-sm">
          <Text className="text-2xl font-bold text-gray-800">
            Create New Organization
          </Text>
          <Text className="mb-6 mt-2 text-sm text-gray-600">
            Enter a name for your new organization
          </Text>

          <View className="space-y-4">
            <Controller
              control={form.control}
              name="name"
              render={({
                field: { onChange, onBlur, value },
                fieldState: { error },
              }) => {
                return (
                  <View>
                    <Text className="mb-1 text-sm font-medium text-gray-700">
                      Name
                    </Text>
                    <TextInput
                      className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="Enter organization name"
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
                      placeholder="Enter description"
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                      onBlur={onBlur}
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
              className="mt-4 w-full rounded-md bg-blue-600 py-3"
              disabled={form.formState.isSubmitting || isLoading}
            >
              <Text className="text-center font-semibold text-white">
                Create Organization
              </Text>
            </Button>
          </View>
        </View>
      </FormProvider>
    </View>
  );
}
