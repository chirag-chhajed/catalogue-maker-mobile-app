import { Ionicons } from "@expo/vector-icons";
import { router, Tabs } from "expo-router";

import { THEME_COLORS } from "~/lib/constants";
import { hasPermission } from "~/lib/role";
import { useUserState } from "~/store/hooks";

const SettingsLayout = () => {
  const { role } = useUserState();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: THEME_COLORS.primary,
        headerLeft: () => {
          return (
            <Ionicons
              name="chevron-back"
              size={24}
              color={THEME_COLORS.primary}
              onPress={() => router.back()}
              hitSlop={20}
            />
          );
        },
      }}
    >
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-sharp" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="organization"
        options={{
          title: "Organization",
          tabBarIcon: ({ color }) => (
            <Ionicons name="business-sharp" size={24} color={color} />
          ),
        }}
      />
      {hasPermission(role, "invite:user") ? (
        <Tabs.Screen
          name="invitations"
          options={{
            title: "Invitations",
            tabBarIcon: ({ color }) => (
              <Ionicons name="mail-outline" size={24} color={color} />
            ),
          }}
        />
      ) : null}
    </Tabs>
  );
};

export default SettingsLayout;
