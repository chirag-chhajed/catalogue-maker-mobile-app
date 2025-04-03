import { zodResolver } from "@hookform/resolvers/zod";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { Text, View, TextInput } from "react-native";
import { toast } from "sonner-native";
import * as z from "zod";
import { AntDesign } from "@expo/vector-icons";

import { Button } from "~/components/ui/button";
import { usePostApiV1OrganisationMutation } from "~/store/features/api/newApis";

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
  const [create, { isLoading }] = usePostApiV1OrganisationMutation();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
    },
    mode: "onBlur",
  });

  const handleSubmit = async (data: z.infer<typeof schema>) => {
    toast.promise(
      create({
        body: data,
      }).unwrap(),
      {
        loading: "Creating organization...",
        success: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.back();
          return "Organization created successfully";
        },
        error: "Failed to create organization",
      },
    );
  };

  return (
    <View className="flex-1 items-center justify-center p-6">
      <View className="mb-8 items-center">
        <View className="h-24 w-24 items-center justify-center rounded-full bg-primary/10">
          <AntDesign name="team" size={40} color="hsl(27, 34%, 53%)" />
        </View>
      </View>

      <FormProvider {...form}>
        <View className="w-full max-w-md rounded-lg bg-card p-6 shadow-sm">
          <Text className="text-2xl font-bold text-foreground">
            Create New Organization
          </Text>
          <Text className="mb-6 mt-2 text-sm text-muted-foreground">
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
                    <Text className="mb-1 text-sm font-medium text-foreground">
                      Name
                    </Text>
                    <TextInput
                      className="w-full rounded-md border border-input bg-background px-4 py-2 text-foreground focus:border-ring"
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
                    <Text className="mb-1 text-sm font-medium text-foreground">
                      Description
                    </Text>
                    <TextInput
                      className="w-full rounded-md border border-input bg-background px-4 py-2 text-foreground focus:border-ring"
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
              className="mt-4 w-full rounded-md bg-primary py-3"
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
