import "../global.css";

import { PortalHost } from "@rn-primitives/portal";
import { getLoadedFonts } from "expo-font";
import { Stack } from "expo-router";

import AuthProvider from "~/components/AuthProvider";
import { ReduxProvider } from "~/store/provider";

export default function Layout() {
  // const fonts = getLoadedFonts();
  // console.log(fonts);
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
