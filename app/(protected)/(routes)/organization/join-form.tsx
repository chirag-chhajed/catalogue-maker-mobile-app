import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { Text, View, TextInput, Pressable, Image, Alert } from "react-native";
import { toast } from "sonner-native";
import * as z from "zod";

import { usePostApiV1InvitationAcceptMutation } from "~/store/features/api/newApis";

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
          return "Joined Organization";
        },
        error: ({ data }) => {
          return data?.message ?? "Something went wrong";
        },
        loading: "Loading...",
      },
    );
  };

  // const showJoinAlert = ({
  //   organizationName,
  //   role,
  //   inviteCode,
  // }: {
  //   organizationName: string;
  //   role: string;
  //   inviteCode: string;
  // }) => {
  //   Alert.alert(
  //     "Join Organization",
  //     `Do you want to join ${organizationName} as ${role}?`,
  //     [
  //       {
  //         text: "Reject",
  //         style: "destructive",
  //         onPress: () => {
  //           toast.promise(
  //             hello({
  //               joining: false,
  //               inviteCode,
  //             }),
  //             {
  //               loading: "Rejecting...",
  //               success: () => {
  //                 router.back();
  //                 return "Rejected";
  //               },
  //               error: () => "Failed to reject",
  //             },
  //           );
  //         },
  //       },
  //       {
  //         text: "Accept",
  //         style: "default",
  //         onPress: () => {
  //           toast.promise(
  //             hello({
  //               joining: true,
  //               inviteCode,
  //             }),
  //             {
  //               loading: "Accepting...",
  //               success: () => {
  //                 router.back();
  //                 return "Accepted";
  //               },
  //               error: () => "Failed to Accept",
  //             },
  //           );
  //         },
  //       },
  //     ],
  //     { cancelable: true },
  //   );
  // };

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
