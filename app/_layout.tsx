import "../global.css";

import { PortalHost } from "@rn-primitives/portal";
import { Image } from "expo-image";
import { Stack } from "expo-router";
// import { PostHogProvider } from "posthog-react-native";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { View, useWindowDimensions } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Toaster } from "sonner-native";

import splashScreenImg from "~/assets/splash.png";
import AuthProvider from "~/components/AuthProvider";
import { ReduxProvider } from "~/store/provider";
import "../ReactotronConfig";

SplashScreen.hide();

const SplashScreenView = () => {
  const { width, height } = useWindowDimensions();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Image
        contentFit="cover"
        source={splashScreenImg}
        style={{ width, height }}
      />
    </View>
  );
};
export default function Layout() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 5000);
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
              name="forget-password"
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
