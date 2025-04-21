import { AntDesign } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import auth from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, useRouter, router } from "expo-router";
import { useState } from "react";
import { FormProvider, useForm, Controller } from "react-hook-form";
import { TextInput, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { usePostApiV1AuthLoginMutation } from "~/store/features/api/newApis";
import { useAppSelector, useOrganizationIdSelector } from "~/store/hooks";

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_CLIENT_ID,
  scopes: ["profile", "email"],
});

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().trim().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    email: z.string().trim().email("Invalid email address"),
    password: z
      .string()
      .trim()
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .trim()
      .min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

const LoginForm = () => {
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const [login, { isLoading }] = usePostApiV1AuthLoginMutation();
  const onSubmit = async (data: LoginFormData) => {
    try {
      const hello = await auth().signInWithEmailAndPassword(
        data.email,
        data.password,
      );
      const idToken = await hello.user?.getIdToken();
      await login({
        body: {
          email: data.email,
          name: data.email,
          idToken,
        },
      }).unwrap();
    } catch (error) {
      const errorCode = error?.code;
      if (errorCode === "auth/user-not-found") {
        toast.error("User not found");
      } else if (errorCode === "auth/wrong-password") {
        toast.error("Wrong password");
      } else if (errorCode === "auth/invalid-email") {
        toast.error("Invalid email");
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      await auth().signOut();
    }
  };

  return (
    <FormProvider {...form}>
      <View className="w-full gap-4">
        <Controller
          control={form.control}
          name="email"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <View>
              <TextInput
                className="w-full rounded-lg border border-border bg-card px-4 py-2.5 font-mono text-foreground"
                placeholder="Email"
                value={value}
                onChangeText={onChange}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!isLoading || !form.formState.isSubmitting}
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
          name="password"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <View>
              <TextInput
                className="w-full rounded-lg border border-border bg-card px-4 py-2.5 font-mono text-foreground"
                placeholder="Password"
                value={value}
                onChangeText={onChange}
                secureTextEntry
                editable={!isLoading || !form.formState.isSubmitting}
              />
              {error?.message && (
                <Text className="mt-1 font-mono text-sm text-destructive">
                  {error.message}
                </Text>
              )}
            </View>
          )}
        />

        <Pressable
          onPress={() => router.push("/forget-password")}
          className="self-end"
          disabled={isLoading || form.formState.isSubmitting}
        >
          <Text className="font-mono text-sm text-primary">
            Forgot Password?
          </Text>
        </Pressable>
        <Button
          disabled={isLoading || form.formState.isSubmitting}
          onPress={form.handleSubmit(onSubmit)}
          className="w-full rounded-lg bg-primary py-3"
        >
          <Text className="font-mono font-semibold text-primary-foreground">
            Login
          </Text>
        </Button>
      </View>
    </FormProvider>
  );
};

const SignupForm = () => {
  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });
  const [login, { isLoading }] = usePostApiV1AuthLoginMutation();

  const onSubmit = async (data: SignupFormData) => {
    try {
      const hello = await auth().createUserWithEmailAndPassword(
        data.email,
        data.password,
      );
      const idToken = await hello.user?.getIdToken();
      await login({
        body: {
          email: data.email,
          name: data.name,
          idToken,
        },
      }).unwrap();
    } catch (error) {
      const errorCode = error?.code;
      if (errorCode === "auth/email-already-in-use") {
        toast.error("Email already in use");
      } else if (errorCode === "auth/invalid-email") {
        toast.error("Invalid email");
      } else if (errorCode === "auth/weak-password") {
        toast.error("Weak password");
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      await auth().signOut();
    }
  };

  return (
    <FormProvider {...form}>
      <View className="w-full gap-4">
        <Controller
          control={form.control}
          name="name"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <View>
              <TextInput
                className="w-full rounded-lg border border-border bg-card px-4 py-2.5 font-mono text-foreground"
                placeholder="Name"
                value={value}
                onChangeText={onChange}
                editable={!isLoading || !form.formState.isSubmitting}
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
          name="email"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <View>
              <TextInput
                className="w-full rounded-lg border border-border bg-card px-4 py-2.5 font-mono text-foreground"
                placeholder="Email"
                value={value}
                onChangeText={onChange}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!isLoading || !form.formState.isSubmitting}
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
          name="password"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <View>
              <TextInput
                className="w-full rounded-lg border border-border bg-card px-4 py-2.5 font-mono text-foreground"
                placeholder="Password"
                value={value}
                onChangeText={onChange}
                secureTextEntry
                editable={!isLoading && !form.formState.isSubmitting}
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
          name="confirmPassword"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <View>
              <TextInput
                className="w-full rounded-lg border border-border bg-card px-4 py-2.5 font-mono text-foreground"
                placeholder="Confirm Password"
                value={value}
                onChangeText={onChange}
                secureTextEntry
                editable={!isLoading && !form.formState.isSubmitting}
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
          className="w-full rounded-lg bg-primary py-3"
          disabled={isLoading || form.formState.isSubmitting}
        >
          <Text className="font-mono font-semibold text-primary-foreground">
            Sign Up
          </Text>
        </Button>
      </View>
    </FormProvider>
  );
};

export default function App() {
  const [isLogin, setIsLogin] = useState(true);
  async function onGoogleButtonPress() {
    // Check if your device supports Google Play
    await GoogleSignin.signOut();
    await GoogleSignin.hasPlayServices({
      showPlayServicesUpdateDialog: true,
    });
    // Get the users ID token
    const googleSignInResult = await GoogleSignin.signIn();

    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(
      googleSignInResult.data?.idToken,
    );

    // Sign-in the user with the credential
    return await auth().signInWithCredential(googleCredential);
  }
  const [login, { isLoading }] = usePostApiV1AuthLoginMutation();
  const router = useRouter();
  const { accessToken } = useAppSelector((state) => state.hello);
  const organizationId = useOrganizationIdSelector();

  if (accessToken && organizationId) {
    return <Redirect href="/(protected)/(routes)/catalogue" />;
  }
  if (accessToken && !organizationId) {
    return <Redirect href="/(protected)/(routes)/organization" />;
  }

  return (
    <SafeAreaView className="flex-1">
      <LinearGradient
        colors={["hsl(33, 25%, 92%)", "hsl(33, 31%, 72%)"]}
        style={{ flex: 1 }}
      >
        <View className="flex-1 items-center justify-center p-8">
          <View className="w-full max-w-sm gap-8">
            {/* Form Container */}
            <View className="rounded-xl bg-background/80 p-6 backdrop-blur-sm">
              <Text className="mb-6 text-center font-mono text-2xl font-bold text-foreground">
                {isLogin ? "Login" : "Sign Up"}
              </Text>

              {isLogin ? <LoginForm /> : <SignupForm />}

              <Pressable onPress={() => setIsLogin(!isLogin)} className="mt-4">
                <Text className="text-center font-mono text-sm text-primary">
                  {isLogin
                    ? "Need an account? Sign up"
                    : "Already have an account? Login"}
                </Text>
              </Pressable>
            </View>

            {/* Divider */}
            <View className="flex-row items-center">
              <View className="h-[1px] flex-1 bg-border" />
              <Text className="mx-4 font-mono text-sm text-muted-foreground">
                OR
              </Text>
              <View className="h-[1px] flex-1 bg-border" />
            </View>

            {/* Google Button */}
            <Button
              disabled={isLoading}
              onPress={async () => {
                try {
                  const { user } = await onGoogleButtonPress();
                  const idToken = await user.getIdToken();
                  const data = await login({
                    body: {
                      email: user.email,
                      name: user.displayName ?? "aefiowneo",
                      idToken: idToken ?? "",
                    },
                  }).unwrap();
                  router.replace("/(protected)/(routes)/organization");
                } catch (error) {
                  console.log(error);
                } finally {
                  await GoogleSignin.signOut();
                }
              }}
              size="lg"
              className="flex-row items-center justify-center gap-3 rounded-xl"
            >
              <AntDesign name="google" size={24} color="white" />
              <Text className="text-lg font-semibold text-white">
                Sign in with Google
              </Text>
            </Button>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}
