import { zodResolver } from "@hookform/resolvers/zod";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { Text, View, TextInput } from "react-native";
import { toast } from "sonner-native";
import * as z from "zod";
import { AntDesign } from "@expo/vector-icons";

import { Button } from "~/components/ui/button";
import { usePostApiV1CatalogueMutation } from "~/store/features/api/newApis";
import { THEME_COLORS } from "~/lib/constants";

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

  const [create, { isLoading }] = usePostApiV1CatalogueMutation();
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
        body: {
          name: data.name,
          description: data.description,
        },
      }).unwrap(),
      {
        success: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.replace("/(protected)/(routes)/catalogue");
          return "Catalogue created successfully";
        },
        error: "Failed to create Catalogue",
        loading: "Creating Catalogue...",
      },
    );
  };

  return (
    <View className="flex-1 items-center justify-center p-6">
      <View className="mb-8 items-center">
        <View className="h-24 w-24 items-center justify-center rounded-full bg-primary/10">
          <AntDesign name="appstore1" size={40} color={THEME_COLORS.primary} />
        </View>
      </View>

      <FormProvider {...form}>
        <View className="w-full rounded-xl bg-background p-4">
          <Text className="font-mono text-2xl font-bold text-foreground">
            Create New Catalogue
          </Text>
          <Text className="mt-2 font-mono text-sm text-muted-foreground">
            Enter details for your new Catalogue
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

            <Button
              onPress={form.handleSubmit(handleSubmit)}
              disabled={form.formState.isSubmitting || isLoading}
              className="mt-6 w-full rounded-lg bg-primary py-3"
            >
              <Text className="font-mono font-semibold text-primary-foreground">
                Create Catalogue
              </Text>
            </Button>
          </View>
        </View>
      </FormProvider>
    </View>
  );
}
