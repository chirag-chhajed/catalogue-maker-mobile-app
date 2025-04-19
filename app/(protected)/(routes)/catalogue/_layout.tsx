import { Feather } from "@expo/vector-icons";
import { Link, Stack } from "expo-router";
import { Pressable } from "react-native";

import { Text } from "~/components/ui/text";
import { THEME_COLORS } from "~/lib/constants";

const CatalogueLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerTintColor: THEME_COLORS.foreground,
        headerTitleStyle: {
          color: THEME_COLORS.foreground,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerLeft: () => (
            <Text className="text-3xl font-bold text-foreground">
              Catalogues
            </Text>
          ),
          headerTitle: "",
          headerRight: () => (
            <Pressable className="rounded-full p-3">
              <Link href="/(protected)/(routes)/settings/profile">
                <Feather
                  name="settings"
                  size={24}
                  color={THEME_COLORS.foreground}
                />
              </Link>
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name="[id]"
        options={({ route }) => ({
          headerTitle: route.params?.title ?? "Catalogue",
        })}
      />
      <Stack.Screen
        name="share"
        options={{
          headerTitle: "Share",
        }}
      />
      <Stack.Screen
        name="all"
        options={{
          headerTitle: "All Items",
        }}
      />
      <Stack.Screen
        name="create-catalog"
        options={{
          presentation: "modal",
          headerTitle: "Create Catalogue",
        }}
      />
      <Stack.Screen
        name="create-item-form"
        options={{
          presentation: "modal",
          headerTitle: "Create Item",
        }}
      />
    </Stack>
  );
};

export default CatalogueLayout;
