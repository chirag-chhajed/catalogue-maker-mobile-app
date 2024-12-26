import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { Text, View, TextInput, Pressable, Image } from "react-native";
import { toast } from "sonner-native";
import * as z from "zod";
import {
  useAcceptInviteMutation,
  useInviteStatusMutation,
} from "~/store/features/api";

export default function JoinForm() {
  const schema = z.object({
    inviteCode: z
      .string()
      .trim()
      .length(10, "Invite code must be 10 characters"),
  });
  const [inviteStatus, { isLoading }] = useInviteStatusMutation();
  type schemaInferType = z.infer<typeof schema>;

  const form = useForm<schemaInferType>({
    resolver: zodResolver(schema),
    defaultValues: {
      inviteCode: "",
    },
    mode: "onBlur",
  });

  const handleSubmit = async (data: schemaInferType) => {
    toast.promise(inviteStatus(data).unwrap(), {
      success: () => "hello",
      error: ({ data }) => {
        return data?.message ?? "Something went wrong";
      },
      loading: "Loading...",
    });
  };

  return (
    <View className="flex-1 items-center justify-center p-6">
      {/* Placeholder Image */}
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

      {/* Form Container */}
      <FormProvider {...form}>
        <View className="w-full max-w-md rounded-lg bg-white p-6 shadow-sm">
          <Text className="text-2xl font-bold text-gray-800">
            Join an Organization
          </Text>
          <Text className="mb-6 mt-2 text-sm text-gray-600">
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
                      className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500"
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
              className="mt-4 w-full rounded-md bg-blue-600 py-3"
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
