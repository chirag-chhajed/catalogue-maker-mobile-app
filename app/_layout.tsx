import "../global.css";

import { PortalHost } from "@rn-primitives/portal";
import { Stack } from "expo-router";
// import { PostHogProvider } from "posthog-react-native";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Toaster } from "sonner-native";

import AuthProvider from "~/components/AuthProvider";
import { ReduxProvider } from "~/store/provider";
import "../ReactotronConfig";

SplashScreen.hide();

const SplashScreenView = () => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Splash Screen</Text>
    </View>
  );
};
export default function Layout() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  if (loading) {
    return <SplashScreenView />;
  }
  return (
    <GestureHandlerRootView>
      {/* <PostHogProvider
        apiKey={process.env.EXPO_PUBLIC_POSTHOG_ID}
        options={{
          host: "https://eu.i.posthog.com",
        }}
      > */}
      <ReduxProvider>
        <AuthProvider>
          <Stack>
            <Stack.Screen
              name="index"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="(protected)"
              options={{
                headerShown: false,
              }}
            />
          </Stack>
          <PortalHost />
          <Toaster richColors position="bottom-center" />
        </AuthProvider>
      </ReduxProvider>
      {/* </PostHogProvider> */}
    </GestureHandlerRootView>
  );
}
