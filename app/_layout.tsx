import "../global.css";

import { PortalHost } from "@rn-primitives/portal";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Toaster } from "sonner-native";
import AuthProvider from "~/components/AuthProvider";
import { ReduxProvider } from "~/store/provider";

export default function Layout() {
  return (
    <GestureHandlerRootView>
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
    </GestureHandlerRootView>
  );
}
