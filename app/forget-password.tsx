import { zodResolver } from "@hookform/resolvers/zod";
import auth from "@react-native-firebase/auth";
import { useRouter } from "expo-router";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { View, TextInput, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";

const schema = z.object({
  email: z.string().trim().email("Invalid email address"),
});

type FormData = z.infer<typeof schema>;

export default function ForgetPassword() {
  const router = useRouter();
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: FormData) => {
    toast.promise(auth().sendPasswordResetEmail(data.email), {
      loading: "Sending reset email...",
      success: () => {
        router.back();
        return "Reset email sent! Check your inbox";
      },
      error: "Failed to send reset email",
    });
  };

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 items-center justify-center p-8">
        <View className="w-full max-w-sm">
          <View className="rounded-xl bg-background p-6">
            <Text className="mb-2 text-center font-mono text-2xl font-bold text-foreground">
              Reset Password
            </Text>
            <Text className="mb-6 text-center font-mono text-sm text-muted-foreground">
              Enter your email to receive a password reset link
            </Text>

            <FormProvider {...form}>
              <View className="w-full gap-4">
                <Controller
                  control={form.control}
                  name="email"
                  render={({
                    field: { onChange, value },
                    fieldState: { error },
                  }) => (
                    <View>
                      <TextInput
                        className="w-full rounded-lg border border-border bg-card px-4 py-2.5 font-mono text-foreground"
                        placeholder="Email"
                        value={value}
                        onChangeText={onChange}
                        autoCapitalize="none"
                        keyboardType="email-address"
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
                  onPress={form.handleSubmit(onSubmit)}
                  className="mt-2 w-full rounded-lg bg-primary py-3"
                >
                  <Text className="font-mono font-semibold text-primary-foreground">
                    Send Reset Email
                  </Text>
                </Button>

                <Pressable onPress={() => router.back()} className="mt-4">
                  <Text className="text-center font-mono text-sm text-primary">
                    Back to Login
                  </Text>
                </Pressable>
              </View>
            </FormProvider>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
