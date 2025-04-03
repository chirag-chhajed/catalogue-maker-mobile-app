import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { Text, View, TextInput, Pressable } from "react-native";
import { toast } from "sonner-native";
import * as z from "zod";
import { AntDesign } from "@expo/vector-icons";

import { usePostApiV1InvitationAcceptMutation } from "~/store/features/api/newApis";
import { router } from "expo-router";

export default function JoinForm() {
  const schema = z.object({
    inviteCode: z
      .string()
      .trim()
      .length(10, "Invite code must be 10 characters"),
  });
  const [acceptInvite, { isLoading }] = usePostApiV1InvitationAcceptMutation();
  type schemaInferType = z.infer<typeof schema>;

  const form = useForm<schemaInferType>({
    resolver: zodResolver(schema),
    defaultValues: {
      inviteCode: "",
    },
    mode: "onBlur",
  });

  const handleSubmit = async (data: schemaInferType) => {
    toast.promise(
      acceptInvite({
        body: {
          code: data.inviteCode,
        },
      }).unwrap(),
      {
        success: (res) => {
          router.back();
          return "Joined Organization";
        },
        error: ({ data }) => {
          return data?.message ?? "Something went wrong";
        },
        loading: "Loading...",
      },
    );
  };

  return (
    <View className="flex-1 items-center justify-center p-6">
      <View className="mb-8 items-center">
        <View className="h-24 w-24 items-center justify-center rounded-full bg-primary/10">
          <AntDesign name="adduser" size={40} color="hsl(27, 34%, 53%)" />
        </View>
      </View>

      <FormProvider {...form}>
        <View className="w-full max-w-md rounded-lg bg-card p-6 shadow-sm">
          <Text className="text-2xl font-bold text-foreground">
            Join an Organization
          </Text>
          <Text className="mb-6 mt-2 text-sm text-muted-foreground">
            Enter the invite code you received to join an organization.
          </Text>

          <View>
            <Controller
              control={form.control}
              name="inviteCode"
              render={({
                field: { onChange, onBlur, value, disabled },
                fieldState: { error },
              }) => {
                return (
                  <View>
                    <Text className="mb-1 text-sm font-medium text-gray-700">
                      Invite Code
                    </Text>
                    <TextInput
                      className="w-full rounded-md border border-input bg-background px-4 py-2 text-foreground focus:border-ring"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      editable={disabled}
                      placeholder="Enter invite code"
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
              disabled={form.formState.isSubmitting || isLoading}
              className="mt-4 w-full rounded-md bg-primary py-3"
            >
              <Text className="text-center font-semibold text-white">
                Join Organization
              </Text>
            </Pressable>
          </View>
        </View>
      </FormProvider>
    </View>
  );
}
