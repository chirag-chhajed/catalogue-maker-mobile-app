import { Feather } from "@expo/vector-icons";
import { Link, Stack } from "expo-router";
import { Pressable } from "react-native";

import { Text } from "~/components/ui/text";

const CatalogueLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerLeft: () => (
            <Text className="text-3xl font-bold ">Catalogues</Text>
          ),
          headerTitle: "",
          headerShadowVisible: false,
          headerRight: () => (
            <Pressable className=" p-3 ">
              <Link href="/(protected)/(routes)/settings/profile">
                <Feather name="settings" size={24} />
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
        name="create-catalog"
        options={{
          presentation: "modal",
          headerTitle: "Create Catalogue",
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="create-item-form"
        options={{
          presentation: "modal",
          headerTitle: "Create Item",
          headerShadowVisible: false,
        }}
      />
    </Stack>
  );
};

export default CatalogueLayout;
