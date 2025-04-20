import { AntDesign } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { Text, View, TextInput } from "react-native";
import { toast } from "sonner-native";
import * as z from "zod";

import { Button } from "~/components/ui/button";
import { THEME_COLORS } from "~/lib/constants";
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
          <AntDesign name="adduser" size={40} color={THEME_COLORS.primary} />
        </View>
      </View>

      <FormProvider {...form}>
        <View className="w-full rounded-xl bg-background p-4">
          <Text className="font-mono text-2xl font-bold text-foreground">
            Join an Organization
          </Text>
          <Text className="mt-2 font-mono text-sm text-muted-foreground">
            Enter the invite code you received to join an organization.
          </Text>

          <View className="mt-6 gap-4">
            <Controller
              control={form.control}
              name="inviteCode"
              render={({
                field: { onChange, onBlur, value, disabled },
                fieldState: { error },
              }) => (
                <View>
                  <Text className="mb-2 font-mono text-sm font-medium text-foreground">
                    Invite Code
                  </Text>
                  <TextInput
                    className="w-full rounded-lg border border-border bg-input px-4 py-2.5 font-mono text-foreground"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    editable={disabled}
                    placeholder="Enter invite code"
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
                Join Organization
              </Text>
            </Button>
          </View>
        </View>
      </FormProvider>
    </View>
  );
}
