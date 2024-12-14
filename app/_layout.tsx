import "../global.css";

import { PortalHost } from "@rn-primitives/portal";
import { Stack } from "expo-router";
import AuthProvider from "~/components/AuthProvider";

import { ReduxProvider } from "~/store/provider";

export default function Layout() {
  return (
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
      </AuthProvider>
    </ReduxProvider>
  );
}
