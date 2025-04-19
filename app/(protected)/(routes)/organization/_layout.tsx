import { AntDesign } from "@expo/vector-icons";
import { Link, Stack, Redirect } from "expo-router";
import { Pressable } from "react-native";

import { Text } from "~/components/ui/text";
import { THEME_COLORS } from "~/lib/constants";
import { useUserState } from "~/store/hooks";

export default function OrganizationLayout() {
  const user = useUserState();
  if (user?.organizationId) {
    return <Redirect href="/(protected)/(routes)/catalogue" />;
  }
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerLeft: () => (
            <Text className="text-3xl font-bold text-foreground">
              Organizations
            </Text>
          ),
          headerRight: () => (
            <Pressable className="rounded-full bg-primary p-3">
              <Link href="/(protected)/(routes)/organization/create-form">
                <AntDesign name="plus" size={20} color="white" />
              </Link>
            </Pressable>
          ),
          headerTitle: "",
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="create-form"
        options={{
          presentation: "modal",
          headerTitle: "Create Organization",
          headerTintColor: THEME_COLORS.foreground,
          headerTitleStyle: {
            color: THEME_COLORS.foreground,
          },
        }}
      />
      <Stack.Screen
        name="join-form"
        options={{
          presentation: "modal",
          headerTitle: "Join Organization",
          headerTintColor: THEME_COLORS.foreground,
          headerTitleStyle: {
            color: THEME_COLORS.foreground,
          },
        }}
      />
    </Stack>
  );
}
