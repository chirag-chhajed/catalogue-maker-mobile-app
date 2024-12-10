import { AntDesign } from "@expo/vector-icons";
import { Link, Stack } from "expo-router";
import { View, Pressable } from "react-native";
import { Text } from "~/components/ui/text";

const ProtectedLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="organization/index"
        options={{
          headerLeft: () => (
            <Text className="text-3xl font-bold ">Organizations</Text>
          ),

          headerRight: () => (
            <Link href="/(protected)/organization/create-form">
              <Pressable hitSlop={20} className="rounded-full bg-blue-600 p-3 ">
                <AntDesign name="plus" size={20} color="white" />
              </Pressable>
            </Link>
          ),
          headerTitle: "",
        }}
      />
      <Stack.Screen
        name="organization/create-form"
        options={{
          presentation: "modal",
          headerTitle: "Create Organization",
          // headerShown: false,
        }}
      />
      <Stack.Screen
        name="organization/join-form"
        options={{
          presentation: "modal",
          headerTitle: "Join Organization",
          // headerShown: false,
        }}
      />
    </Stack>
  );
};

export default ProtectedLayout;
