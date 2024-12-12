import { AntDesign } from "@expo/vector-icons";
import { Link, Stack } from "expo-router";
import { Pressable } from "react-native";

import { Text } from "~/components/ui/text";

export default function OrganizationLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerLeft: () => (
            <Text className="text-3xl font-bold ">Organizations</Text>
          ),

          headerRight: () => (
            <Pressable className="rounded-full bg-blue-600 p-3 ">
              <Link href="/(protected)/organization/create-form">
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
        }}
      />
      <Stack.Screen
        name="join-form"
        options={{
          presentation: "modal",
          headerTitle: "Join Organization",
        }}
      />
    </Stack>
  );
}
